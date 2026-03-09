import type { IAuthRequest } from "@/routes/index";
import Service from "./service";
import { throwErrorOnValidation } from "@/utils/error";

const sendInvitation = async (req: IAuthRequest) => {
 try {
    const userId = req.user?.id;
    if (!userId) {
      throwErrorOnValidation("User not authenticated");
    }
    const data = await Service.inviteGuest(req.body, userId);
    return data;
  } catch (error: any) {
    throw error;
  }
}
const getInvitations = async (req: IAuthRequest) => {
  try {
    const userId:number  = req.user?.id;
    const familyId =req.user?.familyId ? Number(req.user.familyId) : undefined;
    if (!userId) {
      throwErrorOnValidation("User not authenticated");
    }
    const invitations = await Service.getInvitedEvent(req.query, userId, familyId);
    return invitations;
  } catch (err) {
    throw err;
  }
};

const getInvitationResponse = async (req: IAuthRequest) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    const familyId = req.user.familyId ? Number(req.user.familyId) : undefined;
    if (!eventId) {
      throwErrorOnValidation("eventId is required");
    }
    if (!familyId && !userId) {
      throwErrorOnValidation("Either familyId or userId is required");
    }
    console.debug(`The event id in the service is ${eventId}`)
    return await Service.listinvitationsResponce(Number(eventId), {
      familyId: familyId !== undefined ? Number(familyId) : undefined,
      userId: Number(userId),
    });
  } catch (err) {
    throw err;
  }
};

const setResponce = async (req: IAuthRequest) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;
    const familyId = req.user.familyId;

    //the userId is one doing the request and the body.userid is for whom the responce is made for the event guest
    const service = await Service.setResponce({ ...req.body, eventId }, userId, familyId); // TODO:update the validaion in this line of the code 
    return service;
  } catch (err) {
    throw err;

  }
}

const getEventGuest = async (req: IAuthRequest) => {
  try {
    const { id } = req.params;
    const userId = req.user.id
    if (!id) {
      throwErrorOnValidation(
        "Event id was not found in the params"
      )
    }
    const data = await Service.getEventGuest(Number(id), userId);
    return data;
  }
  catch (err) {
    throw err;
  }
}

//updateresponce  ( individual )
export default {
  setResponce,
  sendInvitation,
  getInvitations,
  getInvitationResponse,

};
