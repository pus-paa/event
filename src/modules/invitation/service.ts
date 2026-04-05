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

    const canRespondAsOrganizer = invitations.invited_by === userId;

    if (!canRespondAsSelf && !canRespondAsFamily && !canRespondAsOrganizer) {
      throwForbiddenError("You are not allowed to respond to this invitation");
    }

    let params;

    if (invitations && userId !== data.userId && familyId !== null) {
      params = {
        ...data,
        category: invitations.category as
          | "friend"
          | "family"
          | "colleague"
          | "vvip",
        invitation_name: invitations.invitation_name,
      };
    } else {
      params = data;
    }

    const result = await Model.makeEventGuest({
      eventId: eventId,
      guestId: data?.userId!,
      invited_by: Number(invitations?.invited_by!),
      familyId: familyId,
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
      invitation_name: input.invitation_name || "FAMILY",
      familyId: isFamily ? guestUser.familyId : undefined,
      invited_by: userId,
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
    return Resource.toRoomCollection(event_hotel_management);
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

export default {
  setResponce,
  inviteGuest,
  getInvitedEvent,
  getEventguest,
  getEventHotelManagement,
  listinvitationsResponce,
  remove_invitation,
};
