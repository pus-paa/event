import logger from "@/config/logger";
import Model from "./model";
import Resource, { Invitation_Event } from "./resource";
import EventService from "@/modules/event/service"
import { throwErrorOnValidation, throwForbiddenError, throwNotFoundError, throwUnauthorizedError } from "@/utils/error";
import UserService from "@/modules/user/service";
import FamilyService from "@/modules/family/service"
import { UserColumn } from "../user/resource";
import Invitation from "./model";
import { EventInvitationType , EventInvitation } from "./validators";

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
  userId: number;
[key: string]: any;
}, userId: number, familyId: number | null = null  , eventId:number) => {
  try { 
   const invitations = await Model.findInvitationEvent({ eventId: eventId, userId:userId , familyId:familyId??undefined }); 

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
    if(body.userId !== userId){
  
      const members = await FamilyService.listMembers(familyId??0);
     if (members.some(member => member?.id === userId)) {
    }else{
      throwForbiddenError("You can only set responce for your family members");
    }
    const result = await Model.makeEventGuest({ 
      eventId:eventId ,
       guestId: body.userId,
       invited_by: Number(invitations?.invited_by!),
       familyId: familyId,
       params: body
      });
    return result;
  }
} catch (err) {
    throw err;

  }
}

const inviteGuest = async (input: EventInvitationType, userId: number , eventId:number ) => {
  try {
    const result = EventInvitation.safeParse(input);
    if (!result.success) {
      throw new Error(
        result.error.issues.map((issue) => issue.message).join(", "),
      );
    }
    const isValid = await EventService.checkAuthorized(eventId, userId);
    if (!isValid) {
      return throwErrorOnValidation("Unauthorized: You are not allowed to invite guests for this event");
    }

    const { fullName, email, phone, isFamily } = input;
    let guestUser: Partial<UserColumn> | undefined;
    if (email || phone) {
      try {
        guestUser = (await UserService.list({ email, phone })).items[0] // get the user with the email and the phone
        if (!guestUser) { // No user with the email or overall no user found 
          guestUser = await UserService.UserGeneratorWithPhoneOrEmail(fullName, email, phone);
        }
      } catch (err) {
        throw err;
      }
    }
    if (!guestUser || guestUser.id == undefined) throw new Error("Error while making the user ")
    if (isFamily && !guestUser.familyId) {
      //Making the family table and then upadaing the guest family id 
      guestUser.familyId = await FamilyService.makeFamilyAndAddUserToFamily(guestUser.id, fullName)
    }
    const invitationexist = await Model.find({ eventId: eventId, userId: guestUser.id });
    if (invitationexist) {
      throwErrorOnValidation("This user is already invited to the event");
    }
    const invitation = await Invitation.create({
      eventId: eventId,
      userId: guestUser.id!,
      invitation_name: input.invitation_name,
      familyId: isFamily ? guestUser.familyId : undefined,
      invited_by: userId,
      status: "Pending",
    });

    if (!invitation) {
      throw new Error("Failed to create invitation");
    }

   return  Resource.toJson(invitation as any );
  } catch (err: any) {
    logger.error("Error in inviting guest:", err);
    throw err;
  }
};

const getEventguest = async (eventid: number, userId: number) => {
  try {
    const isAllowed = await EventService.checkAuthorized(eventid, userId);
    if (!isAllowed) {
      return throwUnauthorizedError("User with the details cannot get the information of the guest ");
    }
    const event_guest = Model.getEventGuest(eventid);
    return event_guest;
  } catch (err) {
    throw err;
  }
};


const getInvitedGuest = async (eventId: number, userId: number) => {
  try {
    const isAuthorized = await EventService.checkAuthorized(eventId, userId);
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
  getInvitedEvent,
  listinvitationsResponce,
};
