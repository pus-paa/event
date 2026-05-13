import logger from "@/config/logger";
import { invitationStatus } from "@/constant";
import Model from "./model";
import Resource from "./resource";
import EventService from "@/modules/event/service";
import {
  throwErrorOnValidation,
  throwForbiddenError,
  throwNotFoundError,
  throwUnauthorizedError,
} from "@/utils/error";
import UserService from "@/modules/user/service";
import FamilyService from "@/modules/family/service";
import Invitation from "./model";
import {
  EventInvitationType,
  EventInvitation,
  setResponcevalidationType,
  EventInvitationRemoveType,
} from "./validators";

//list of the event with the event detail and the user id in the header
const getInvitedEvent = async (
  params: { page?: number, limit?: number, userId?: number, eventId?: number, familyId?: number },
  userId: number,
  familyId?: number,
) => {
  try {
    const invited_event = await Model.listAllInvitationEvent({
      ...params,
      userId,
      familyId,
    });
    return invited_event;
  } catch (err: any) {
    logger.error(
      `Error fetching invitations for user ${userId}: ${err.message}`,
    );
    throw err;
  }
};
const findInvitationforEvent = async (userId: number, eventId: number) => {
  try {
    const invitedEvent = await Model.find({
      eventId,
      userId
    });
    if (!invitedEvent) {
      throwNotFoundError("No invitation for the userId for the given event");
    }
    return invitedEvent;
  }
  catch (err) {

  }
}

const listinvitationsResponce = async (
  eventId: number,
  params: { familyId?: number; userId: number },
) => {
  try {
    const parsedFamilyId =
      params.familyId !== undefined ? Number(params.familyId) : undefined;
    const parsedUserId =
      params.userId !== undefined ? Number(params.userId) : undefined;
    if (Number.isNaN(eventId)) {
      throwErrorOnValidation("eventId must be a valid number");
    }

    if (parsedFamilyId === undefined && parsedUserId === undefined) {
      throwErrorOnValidation("Either familyId or userId is required");
    }

    if (parsedFamilyId !== undefined && Number.isNaN(parsedFamilyId)) {
      throwErrorOnValidation("familyId must be a valid number");
    }

    if (parsedUserId !== undefined && Number.isNaN(parsedUserId)) {
      throwErrorOnValidation("userId must be a valid number");
    }

    const invitationResponse = await Model.getInvitationResponces({
      eventId,
      familyId: parsedFamilyId,
      userId: parsedUserId,
    });
    return invitationResponse;
  } catch (err: any) {
    logger.error(
      `Error fetching invitation response for event ${eventId}: ${err.message}`,
    );
    throw err;
  }
};

const setResponce = async (
  body: setResponcevalidationType["body"],
  userId: number,
  familyId: number | null = null,
  eventId: number,
) => {
  try {
    let invitations;
    invitations = await Model.findInvitationEvent({
      eventId: eventId,
      userId: userId,
      familyId: familyId ?? undefined,
    });

    if (!invitations) {
      const eventMembers = await EventService.getUserRelatedToEvent(
        eventId,
        userId,
      );

      const isOrganizer = eventMembers.some(
        (user) => user?.user?.id === userId,
      );
      //Getting the invitation for the user that we are trying to set the responce ; 
      invitations = await Model.findInvitationEvent({
        eventId: eventId,
        userId: isOrganizer ? body.userId : userId,
        familyId: familyId ?? undefined,
      });
    }

    if (!invitations) {
      return throwNotFoundError("Invitation was not found");
    }
    const canRespondAsSelf = invitations.userId === userId;
    const canRespondAsFamily =
      familyId !== null &&
      invitations.familyId !== null &&
      invitations.familyId === familyId;

    const canRespondAsOrganizer = invitations.invitedBy === userId;

    if (!canRespondAsSelf && !canRespondAsFamily && !canRespondAsOrganizer) {
      throwForbiddenError("You are not allowed to respond to this invitation");
    }

    let params;

    if (invitations && userId !== body.userId && familyId !== null) {
      //Import the category fromt he family Id to make the same category when responding for the family invitation for the family memebr 
      params = {
        ...body,
        category: invitations.category,
        invitationName: invitations.invitationName,
      };
    } else {
      params = body;
    }

    const result = await Model.makeEventGuest({
      eventId: eventId,
      guestId: body.userId,
      invitedBy: Number(invitations?.invitedBy!),
      familyId: invitations.familyId ? invitations.familyId : null,
      params,
    });
    return result;
  } catch (err) {
    throw err;
  }
};

const inviteGuest = async (
  input: EventInvitationType,
  userId: number,
  eventId: number,
) => {
  try {
    const result = EventInvitation.safeParse(input);
    if (!result.success) {
      throw new Error(
        result.error.issues.map((issue) => issue.message).join(", "),
      );
    }
    await EventService.checkAuthorized(eventId, userId);

    const geteventCategory = await getEventGuestCategory(eventId, userId);
    const categoryExists = geteventCategory.some(
      (cat) => cat.category_title === input.category,
    );

    if (!categoryExists) {
      return throwErrorOnValidation("The category is not in the event");
    }

    const { fullName, email, phone, isFamily } = input;
    let guestUser;
    if (email || phone) {
      try {
        guestUser = (
          await UserService.list({ email: input.email, phone: input.phone })
        ).items[0]; // get the user with the email and the phone
        if (!guestUser?.id) {
          // No user with the email or overall no user found
          guestUser = await UserService.UserGeneratorWithPhoneOrEmail({
            fullName,
            email,
            phone,
            relation: input.category ? input.category : `${isFamily ? "Family" : "Friend"}`,
          });
        }
      } catch (err) {
        throw err;
      }
    }
    if (!guestUser || guestUser.id == undefined) {
      throw new Error("Error while making the user ");
    }
    if (isFamily && !guestUser.familyId) {
      guestUser.familyId = await FamilyService.makeFamilyAndAddUserToFamily(
        guestUser.id,
        fullName,
      );
    }
    const invitationexist = await Model.find({
      eventId: eventId,
      userId: guestUser.id,
    });
    if (invitationexist) {
      throwErrorOnValidation("This user is already invited to the event");
    }
    const invitation = await Invitation.create({
      eventId: eventId,
      userId: guestUser.id!,
      invitationName: input.invitationName || "FAMILY",
      familyId: isFamily ? guestUser.familyId : undefined,
      invitedBy: userId,
      status: input.isDraft ? invitationStatus.draft : invitationStatus.pending,
      category: input.category,
    });

    if (!invitation) {
      throw new Error("Failed to create invitation");
    }

    return Resource.toJson(invitation as any);
  } catch (err: any) {
    logger.error("Error in inviting guest:", err);
    throw err;
  }
};

const getEventguest = async (eventid: number, userId: number) => {
  try {
    const isAllowed = await EventService.checkAuthorized(eventid, userId);
    if (!isAllowed) {
      return throwUnauthorizedError(
        "User with the details cannot get the information of the guest ",
      );
    }
    const event_guest = Model.getEventGuest(eventid);
    return event_guest;
  } catch (err) {
    throw err;
  }
};
const getEventHotelManagement = async (eventId: number, userId: number) => {
  try {
    const isAllowed = await EventService.checkAuthorized(eventId, userId);
    if (!isAllowed) {
      return throwUnauthorizedError(
        "User with the details cannot get the information of the guest ",
      );
    }
    const event_hotel_management = await Model.EventHotelManagent(eventId);
    const room_grouped = Resource.toRoomGroupCollection(event_hotel_management as any);
    return room_grouped;
  }
  catch (err) {
    throw err;
  }
}


const remove_invitation = async (
  eventId: number,
  userId: number,
  params: EventInvitationRemoveType,
) => {
  try {
    const isAuthToEvent = EventService.checkAuthorized(eventId, userId);
    if (!isAuthToEvent) {
      return throwForbiddenError("Unauthorized to remvoe the guest");
    }
    const remove_invitation = await Model.removeinvitation(
      params.userId,
      eventId,
    );
    return remove_invitation;
  } catch (err) {
    throw err;
  }
};

const getEventGuestCategory = async (eventId: number, userId: number) => {
  try {
    await EventService.checkAuthorized(eventId, userId);
    return await Model.getGuestCategory(eventId);
  } catch (err) {
    throw err;
  }
};

const createGuestCategory = async (body: any, eventId: number, userId: number) => {
  try {
    await EventService.checkAuthorized(eventId, userId);
    return await Model.addGuestCategory(body, eventId);
  } catch (err) {
    throw err;
  }
};


const updateGuestCategory = async (body: any, id: number, userId: number) => {
  try {
    const category = await Model.findGuestCategory(id);
    if (!category) return throwNotFoundError("Guest category not found");
    if (!category.eventId) return throwErrorOnValidation("Category is not associated with an event");
    await EventService.checkAuthorized(category.eventId, userId);
    return await Model.updateGuestCategory(body, id);
  } catch (err) {
    throw err;
  }
};

const delete_guest_category = async (id: number, userId: number) => {
  try {
    const category = await Model.findGuestCategory(id);
    if (!category) return throwNotFoundError("Guest category not found");
    if (!category.eventId)
      return throwErrorOnValidation("Category is not associated with an event");
    await EventService.checkAuthorized(category.eventId, userId);
    return await Model.removeGuestCategory(id);
  } catch (err) {
    throw err;
  }
};

const toggleCheckInOut = async (
  invitationId: number,
  action: "checkIn" | "checkOut",
  userId: number,
) => {
  try {
    const invitation = await Model.find({ id: invitationId });
    if (!invitation) return throwNotFoundError("Invitation not found");

    await EventService.checkAuthorized(invitation.eventId, userId);

    const field = action === "checkIn" ? "hasCheckedIn" : "hasCheckedOut";
    const value = !invitation[field as keyof typeof invitation];

    const result = await Model.update({ [field]: value }, invitationId);
    return result;
  } catch (err) {
    throw err;
  }
}
const getGuestTransportationList = async (eventId: number, userId: number) => {
  try {
    await EventService.checkAuthorized(eventId, userId);
    const data = await Model.getGuestTransportationList(eventId);
    return data;
  } catch (err: any) {
    logger.error(
      `Error fetching guest transportation list for event ${eventId}: ${err.message}`,
    );
    throw err;
  }
};
const importInvitation = async ({ fromEventId, toEventId }: { fromEventId: number, toEventId: number }, userId: number) => {
  try {
    const eventInvitation = await Model.listinvitationByEventId(fromEventId);
    const toEventInvitationList = await Model.listinvitationByEventId(toEventId);
    const existingUserIds = new Set(
      toEventInvitationList
        .map((invitation) => invitation.userId)
        .filter((id): id is number => typeof id === "number"),
    );
    const newEventInvitation = eventInvitation
      .filter((invitation) => typeof invitation.userId === "number")
      .filter((invitation) => !existingUserIds.has(invitation.userId as number))
      .map((invitation) => {
        return {
          ...invitation,
          eventId: toEventId,
          invitedBy: userId,
          familyId: invitation.familyId ? invitation.familyId : null,
          userId: invitation.userId as number,
        };
      });
    if (!newEventInvitation.length) {
      return [];
    }
    const bulkInvitationResponce = await Model.inviteBulk(newEventInvitation);
    return bulkInvitationResponce;

  } catch (err) {
    throw err;
  }

}



export default {
  importInvitation,
  setResponce,
  inviteGuest,
  getInvitedEvent,
  getEventguest,
  getEventHotelManagement,
  findInvitationforEvent,
  listinvitationsResponce,
  remove_invitation,
  getEventGuestCategory,
  createGuestCategory,
  updateGuestCategory,
  delete_guest_category,
  toggleCheckInOut,
  getGuestTransportationList,
};
