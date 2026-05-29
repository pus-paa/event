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

//Make another service for the guest and for the organizer  , have the search if this is the organizer or not then redirect to the noon Organizer responce handler 
// The another will have the guest invitation and checks needed to be done and then will handle all the cases there

const setResponce = async (
  body: setResponcevalidationType["body"],
  userId: number,
  familyId: number | null = null,
  eventId: number,
) => {
  try {
    const isOrganizer = await EventService.checkAuthorized(eventId, userId);
    if (isOrganizer) {
      return await OrganizerResponceSet(body, userId, eventId);
    }

    return await setResponceForGuest(body, userId, familyId, eventId);
  } catch (err) {
    throw err;
  }
};

const OrganizerResponceSet = async (
  body: setResponcevalidationType["body"],
  userId: number,
  eventId: number,
) => {
  try {
    //Validation for the organizer related Resopnce 
    logger.debug({
      text: "This is the organizer responce set handler",
      eventId: eventId,
      guestId: body.userId,
      userId: userId,
      params: body,
    });
    let invitation = await Model.find({
      eventId: eventId,
      userId: body.userId,
    });

    if (!invitation && body.familyId) {
      invitation = await Model.find({
        eventId: eventId,
        familyId: body.familyId,
      });
    }

    if (!invitation) {
      throwNotFoundError("Invitation was not found for the user");
      return;
    }

    const params =
      invitation && body.userId !== invitation.userId && invitation.familyId
        ? {
          ...body,
          category: invitation.category,
          invitationName: invitation.invitationName ?? undefined,
        }
        : body;

    return await upsertInvitationResponse({
      invitation,
      eventId,
      invitedBy: userId,
      familyId: invitation.familyId ? invitation.familyId : undefined,
      params,
    });
  } catch (err) {
    throw err;
  }
}

const setResponceForGuest = async (
  body: setResponcevalidationType["body"],
  userId: number,
  familyId: number | null = null,
  eventId: number,
) => {
  try {
    logger.debug({
      data: "THis is the data send by the user to set the responce from the ui ",
      input: body,
    });

    let invitations = await Model.find({
      eventId: eventId,
      userId: userId,
      familyId: familyId ?? undefined,
    });

    if (!invitations) {
      invitations = await Model.find({
        familyId: familyId ?? undefined,
      });
    }

    logger.debug({
      invitation: "This is the invitation",
      invitationsasd: invitations,
    });

    if (!invitations) {
      return throwNotFoundError("Invitation was not found");
    }

    const canRespondAsSelf = invitations.userId === userId;
    const canRespondAsFamily =
      familyId !== null &&
      invitations.familyId !== null &&
      invitations.familyId === familyId;

    if (!canRespondAsSelf && !canRespondAsFamily) {
      throwForbiddenError("You are not allowed to respond to this invitation");
    }

    const params =
      invitations && userId !== body.userId && familyId !== null
        ? {
          ...body,
          category: invitations.category,
          invitationName: invitations.invitationName ?? undefined,
        }
        : body;

    logger.debug({
      text: "This the event guest detail ",
      eventId: eventId,
      guestId: body.userId,
      invitedBy: Number(invitations?.invitedBy!),
      familyId: invitations.familyId ? invitations.familyId : undefined,
      params,
    });

    return await upsertInvitationResponse({
      invitation: invitations,
      eventId,
      invitedBy: Number(invitations?.invitedBy!),
      familyId: invitations.familyId ? invitations.familyId : undefined,
      params,
    });
  } catch (err) {
    throw err;
  }
}

const upsertInvitationResponse = async ({
  invitation,
  eventId,
  invitedBy,
  familyId,
  params,
}: {
  invitation: any;
  eventId: number;
  invitedBy: number;
  familyId?: number;
  params: setResponcevalidationType["body"];
}) => {
  const baseData = {
    ...params,
    invitedBy: params.invitedBy ?? invitedBy,
    eventId,
    familyId: familyId,
  };

  if (invitation?.id) {
    const nextStatus = params.status;
    const shouldClearResponseDetails =
      nextStatus === invitationStatus.rejected;

    const clearedResponseFields = shouldClearResponseDetails
      ? {
        notes: null,
        arrivalDatetime: null,
        departureDatetime: null,
        isAccomodation: null,
        isArrivalPickupRequired: false,
        isDeparturePickupRequired: false,
        assignedRoom: null,
        arrivalInfo: null,
        departureInfo: null,
        respondedBy: null,
        status: invitationStatus.rejected,
        respondedAt: null,
      }
      : {};

    return await Model.update(
      {
        ...baseData,
        ...clearedResponseFields,
        updatedAt: new Date(),
      },
      invitation.id,
    );
  }

  return await Model.create({
    ...baseData,
    category: params.category as string,
    eventId: eventId,
    invitedBy: invitedBy,
  });
}

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
      invitationName: input.invitationName ?? undefined,
      familyId: isFamily ? guestUser.familyId : undefined,
      invitedBy: userId,
      status: input.isDraft ? invitationStatus.draft : invitationStatus.pending,
      category: input.category,
      numberOfGuests: input.numberOfGuests,
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
    console.log('The user in the hotel management is', userId);
    //const isAllowed = await EventService.checkAuthorized(eventId, userId);
    //TODO: handle the guest and the user
    //if (!isAllowed) {
    // return throwForbiddenError(
    //  "User with the details cannot get the information of the guest ",
    //);
    //}
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
          status: "draft",
          eventId: toEventId,
          invitedBy: userId,
          familyId: invitation.familyId ? invitation.familyId : null,
          userId: invitation.userId as number,

        };
      });
    if (!newEventInvitation.length) {
      return [];
    }
    const bulkInvitationResponce = await Model.inviteBulk(newEventInvitation as any);
    return bulkInvitationResponce;

  } catch (err) {
    throw err;
  }

}

const getInvitationGifts = async (
  invitationId: number,
  userId: number,
  familyId?: number,
) => {
  try {
    const invitation = await Model.find({ id: invitationId });
    if (!invitation) return throwNotFoundError("Invitation not found");

    const isOrganizer = await EventService.checkAuthorized(
      invitation.eventId,
      userId,
    );

    const isSelfInvite = invitation.userId === userId;
    const isFamilyInvite =
      familyId !== undefined &&
      invitation.familyId !== null &&
      invitation.familyId === familyId;

    if (!isOrganizer && !isSelfInvite && !isFamilyInvite) {
      return throwForbiddenError(
        "You do not have permission to view gifts for this invitation",
      );
    }

    return await Model.getInvitationGiftAssignments(invitationId);
  } catch (err) {
    throw err;
  }
};





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
  getInvitationGifts,
};
