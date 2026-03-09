import logger from "@/config/logger";
import { invitationStatus } from "@/constant";
import Model from "./model";
import { Invitation_Event } from "./resource";
import EventService from "@/modules/event/service"
import Service from "./service"
import { throwErrorOnValidation, throwForbiddenError, throwNotFoundError, throwUnauthorizedError } from "@/utils/error";
import { invitationStatusValidation } from "./validators";
import UserService from "@/modules/user/service";
import { UserColumn } from "../user/resource";
import FamilyModel from "@/modules/family/model";
import Invitation from "./model";
import { EventInvitationType , EventInvitation } from "./validators";

const updateInvitationStatus = async (rsvpId: number, status: string, respondedBy?: number) => {
  try {
    invitationStatusValidation.parse(status);
    if (respondedBy === undefined || respondedBy === null) {
      throwErrorOnValidation("User is required to update invitation status");
    }

    const actorId = Number(respondedBy);
    if (Number.isNaN(actorId)) {
      throwErrorOnValidation("Invalid user for invitation status update");
    }

     logger.info(`Updating RSVP status with id: ${rsvpId} to ${status}`);

    const rsvp = await Model.updateInvitationStatus(rsvpId, status, actorId);
    if (!rsvp) {
      throw new Error(`RSVP with id ${rsvpId} not found`);
    }

    if (status === invitationStatus.accepted && rsvp.eventId && rsvp.userId) {
      await Service.makeEventGuest({
        eventId: rsvp.eventId,
        guestId: rsvp.userId,
        inviterId: rsvp.invited_by,
        familyId: rsvp.familyId ?? null,
        params: rsvp,
      }
      );
    }

    logger.info(`RSVP with id ${rsvpId} updated to ${status}.`);
    return rsvp;
  } catch (err: any) {
    throw err;
  }
}

const acceptRSVP = async (rsvpId: number, respondedBy?: number) => {
  return updateInvitationStatus(rsvpId, invitationStatus.accepted, respondedBy);
};

const rejectRSVP = async (rsvpId: number, respondedBy?: number) => {
  return updateInvitationStatus(rsvpId, invitationStatus.rejected, respondedBy);
};
//list of the event with the event detail and the user id in the header 
const getInvitedEvent = async (params: Partial<Invitation_Event>, userId: number , familyId?:number ) => {
  try {
    const invited_event = await Model.listAllInvitationEvent({ ...params, userId , familyId });
    return invited_event;
  } catch (err: any) {
    logger.error(`Error fetching invitations for user ${userId}: ${err.message}`);
    throw err;
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

    if (
      parsedFamilyId === undefined
      && parsedUserId === undefined
    ) {
      throwErrorOnValidation("Either familyId or userId is required");
    }

    if (parsedFamilyId !== undefined && Number.isNaN(parsedFamilyId)) {
      throwErrorOnValidation("familyId must be a valid number");
    }

    if (parsedUserId !== undefined && Number.isNaN(parsedUserId)) {
      throwErrorOnValidation("userId must be a valid number");
    }
    
    const listEvent =  await Model.getInvitationResponces({ eventId, familyId: parsedFamilyId, userId: parsedUserId });
    return listEvent;
  } catch (err: any) {
    logger.error(
      `Error fetching invitation response for event ${eventId}: ${err.message}`,
    );
    throw err;
  }
}

const setResponce = async (body: {
  eventId: number;
  userid: number;

[key: string]: any;
}, userId: number, familyId?: number | null) => {
  try { 
  
    const invitations = await Model.findInvitationEvent({ eventId: body.eventId, userId  ,familyId: familyId ?? undefined });

    if (!invitations) {
      return throwNotFoundError("Invitation was not found");
    }
    //Check invitation to the user or the family in the family id 
    if (invitations.userId !== userId && (familyId && invitations.familyId !== familyId)) {
      throwForbiddenError("You'r family id and the invitaion family id didn't match ");
    }
    //invitation duplicate check 
    const eventGuest = await Model.getEventGuest({eventId: body.eventId, userId: body.userid});

    if (eventGuest) {
      throwErrorOnValidation("Responce already exist for this user and event");
    }
    const result = await Service.inviteGuest({
      eventId: body.eventId,
      userId: body.userid,
      inviterId: Number(invitations?.invited_by!),
      familyId: familyId,
      params: body
    } , userId);
    return result;

  } catch (err) {
    throw err;

  }
}

const inviteGuest = async (input: EventInvitationType, userId: number) => {
  try {
    const result = EventInvitation.safeParse(input);
    if (!result.success) {
      throw new Error(
        result.error.issues.map((issue) => issue.message).join(", "),
      );
    }
    const isValid = await EventService.checkAuthorized(input.eventId, userId);
    if (!isValid) {
      return throwErrorOnValidation("Unauthorized: You are not allowed to invite guests for this event");
    }

    const { fullName, email, phone, eventId, isFamily } = input;
    let guestUser: Partial<UserColumn> | undefined;
    if (email || phone) {
      try {
        guestUser = (await UserService.list({ email, phone })).items[0] // get the user with the email and the phone
      } catch (err) {
        throw err;
      }
    }
    if (!guestUser) { // No user with the email or overall no user found 
      guestUser = await UserGeneratorWithPhoneOrEmail(fullName, email, phone);
    }
    if (!guestUser || guestUser.id == undefined) throw new Error("Error while making the user ")
    if (isFamily && !guestUser.familyId) {
      //Making the family table and then upadaing the guest family id 
      const userFamily = await FamilyModel.create({
        createdBy: guestUser.id!,
        familyName: `${guestUser}'s Family`,

      })
      guestUser.familyId = userFamily?.id;
      const updateUser = await UserService.update({ familyId: userFamily?.id }, guestUser.id)
      guestUser.familyId = updateUser.familyId;
    }
    // 2. Create RSVP (Invitation) entry
    const invitation = await Invitation.create({
      eventId: eventId,
      userId: guestUser.id!,
      familyId: isFamily ? guestUser.familyId : undefined,
      invited_by: userId,
      status: "Pending",
    });

    if (!invitation) {
      throw new Error("Failed to create invitation");
    }

    return {
      ...guestUser,
      invitationId: invitation.id,
     
    };
  } catch (err: any) {
    logger.error("Error in inviting guest:", err);
    throw err;
  }
};

const getEventguest = async (eventid: number, userId: number) => {
  try {
    const isAllowed = await checkAuthorized(eventid, userId);
    if (!isAllowed) {
      return throwUnauthorizedError("User with the details cannot get the information of the guest ");
    }
    const event_guest = Model.getEventGuest(eventid);
    return event_guest;
  } catch (err) {
    throw err;
  }
};

const makeEventGuest = async ({ eventId, guestId, inviterId, familyId, params }: { eventId: number, guestId: number, inviterId: number, familyId?: number | null, params: any }) => {
  try {
    const data = await Model.makeEventGuest({ eventId, guestId, invited_by: inviterId, familyId, params });
    return data;
  } catch (error: any) {
    logger.error("Error in making event guest:", error);
    throw error;
  }
};
const getInvitedGuest = async (eventId: number, userId: number) => {
  try {
    const isAuthorized = await checkAuthorized(eventId, userId);
    if (!isAuthorized) {
      return throwForbiddenError("Not allowed to get the guest for this event");
    }

    const invitedGuest = await Model.getInvitedGuest(eventId);
    return invitedGuest;
  } catch (err: any) {
    logger.error(err, "Error in getInvitedGuest service");
    throw err;
  }
};

export default {
  setResponce,
  inviteGuest,
  acceptRSVP,
  rejectRSVP,
  updateInvitationStatus,
  getInvitedEvent,
  listinvitationsResponce,
};
