import logger from "@/config/logger";
import { invitationStatus } from "@/constant";
import Model from "./model";
import Resource, { Invitation_Event } from "./resource";
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
  setResponcevalidation,
  EventInvitationRemoveType,
  importGuestsValidation,
  ImportGuestsType,
} from "./validators";

//list of the event with the event detail and the user id in the header
const getInvitedEvent = async (
  params: Partial<Invitation_Event>,
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
  body: setResponcevalidationType,
  userId: number,
  familyId: number | null = null,
  eventId: number,
) => {
  try {
    const { error, data } = setResponcevalidation.safeParse(body);
    if (error) {
      return throwErrorOnValidation(error.message);
    }
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

    if (invitations && userId !== data.userId && familyId !== null) {
      params = {
        ...data,
        category: invitations.category ?? undefined,
        invitationName: invitations.invitationName,
      };
    } else {
      params = data;
    }

    const result = await Model.makeEventGuest({
      eventId: eventId,
      guestId: data?.userId!,
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

    if (!input.isDraft) {
      const eventCategories = await getEventGuestCategory(eventId, userId);
      if (!eventCategories.some((cat) => cat.category_title === input.category)) {
        return throwErrorOnValidation("The category is not in the event");
      }
    }

    const { fullName, email, phone, isFamily, relation } = input;
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
            relation: relation ? relation : `${isFamily ? "Family" : "Friend"}`,
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
      invitationName: input.invitation_name || "FAMILY",
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
    const room_grouped = Resource.toRoomGroupCollection(event_hotel_management)
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

const importGuestsFromEvent = async (
  targetEventId: number,
  body: ImportGuestsType,
  userId: number,
) => {
  try {
    const result = importGuestsValidation.safeParse(body);
    if (!result.success) {
      return throwErrorOnValidation(result.error.issues.map((i) => i.message).join(", "));
    }
    const { sourceEventId, selectedUserIds } = result.data;

    await EventService.checkAuthorized(targetEventId, userId);
    await EventService.checkAuthorized(sourceEventId, userId);

    const sourceGuests = await Model.getEventGuest(sourceEventId);

    let imported = 0;
    let skipped = 0;
    let failed = 0;

    for (const guest of sourceGuests) {
      if (!guest.user?.id) {
        failed++;
        continue;
      }

      if (selectedUserIds && !selectedUserIds.includes(guest.user.id)) {
        continue;
      }

      const existing = await Model.find({ eventId: targetEventId, userId: guest.user.id });
      if (existing) {
        skipped++;
        continue;
      }

      try {
        await Model.create({
          eventId: targetEventId,
          userId: guest.user.id,
          invitedBy: userId,
          familyId: guest.eventGuest?.familyId ?? null,
          category: guest.eventGuest?.category ?? null,
          status: invitationStatus.draft,
        });
        imported++;
      } catch (err: any) {
        logger.error(`Failed to import guest ${guest.user.id}: ${err.message}`);
        failed++;
      }
    }

    return { imported, skipped, failed };
  } catch (err: any) {
    logger.error(`Error importing guests: ${err.message}`);
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

export default {
  setResponce,
  inviteGuest,
  getInvitedEvent,
  getEventguest,
  getEventHotelManagement,
  listinvitationsResponce,
  remove_invitation,
  getEventGuestCategory,
  createGuestCategory,
  updateGuestCategory,
  delete_guest_category,
  toggleCheckInOut,
  getGuestTransportationList,
  importGuestsFromEvent,
};
