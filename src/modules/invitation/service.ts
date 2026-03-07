import logger from "@/config/logger";
import { invitationStatus } from "@/constant";
import Model from "./model";
import PermissionService from "./permission.service";
import EventService from "@/modules/event/service"
import { throwErrorOnValidation, throwForbiddenError, throwNotFoundError } from "@/utils/error";
import z from "zod";
import { invitationStatusValidation, validationRSVP } from "./validators";
import { EventInvitationColumn } from "./resource";
import permissionService from "./permission.service";

const create = async (input: any) => {
  try {
    logger.info(`Creating RSVP with input: ${JSON.stringify(input)}`);
    const { error, success } = await z.safeParseAsync(validationRSVP, input);
    if (!success) {
      throwErrorOnValidation(
        error.issues.map((issue) => issue.message).join(", "),
      );
    }
    const rsvp = await Model.create({
      ...input,
      status: invitationStatus.invited,
    });
    if (!rsvp) {
      throw new Error("Failed to create RSVP");
    }
    logger.info(`RSVP created successfully with id: ${rsvp.id}`);
    return rsvp;
  } catch (err: any) {
    throw err;
  }
};

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

    await PermissionService.canUserModifyInvitation(rsvpId, actorId);
    logger.info(`Updating RSVP status with id: ${rsvpId} to ${status}`);

    const rsvp = await Model.updateInvitationStatus(rsvpId, status, actorId);
    if (!rsvp) {
      throw new Error(`RSVP with id ${rsvpId} not found`);
    }

    if (status === invitationStatus.accepted && rsvp.eventId && rsvp.userId) {
      await EventService.makeEventGuest({
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

const getInvitedEvent = async (params: Partial<EventInvitationColumn>, userId: number) => {
  try {
    const invited_event = await Model.findAllInvitation({ ...params, userId });
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

    const allowedInvitation = await permissionService.canUserModifyInvitation(eventId, params.userId);
    if (!allowedInvitation) {
      throwForbiddenError("You do not have permission to view this invitation response");
    }
    return await Model.listInvitationResponse(eventId, {
      familyId: parsedFamilyId,
      userId: parsedUserId,
    });
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
}, userId: number , familyId?:number | null ) => {
  try {
    const invitations = (await Model.find({ eventId: body.eventId, userId }));
    if (!invitations) {
      return throwNotFoundError("Invitation was not found");
    }
   //Check invitation to the user or the family in the family id 
    if(invitations.userId !== userId && (familyId && invitations.familyId !== familyId)){
      throwForbiddenError("You'r family id and the invitaion family id didn't match ");
    }
    //invitdtion duplicate check 
    const eventGuest = await EventService.getEventguest( body.eventId, body.userid );
    if (eventGuest) {
      throwErrorOnValidation("Responce already exist for this user and event");
    }
    const result = await EventService.makeEventGuest({
      eventId: body.eventId,
      guestId: body.userid,
      inviterId: Number(invitations?.invited_by!),
      familyId: familyId,
      params: body
    });
    return result;

  } catch (err) {
    throw err;

  }
}
export default {
  setResponce,
  create,
  acceptRSVP,
  rejectRSVP,
  updateInvitationStatus,
  getInvitedEvent,
  listinvitationsResponce,
};
