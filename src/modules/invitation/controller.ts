import type { IAuthRequest } from "@/routes/index";
import Service from "./service";
import { throwErrorOnValidation } from "@/utils/error";

const sendInvitation = async (req: IAuthRequest) => {
  try {
    const userId = req.user?.id;
    const eventId = req.params.eventId;
    if (!eventId || isNaN(Number(req.params.eventId))) {
      throwErrorOnValidation(" Valid Event id is required in the params");
    }
    if (!userId) {
      throwErrorOnValidation("User not authenticated");
    }
    const data = await Service.inviteGuest(req.body, userId, eventId);
    return data;
  } catch (error: any) {
    throw error;
  }
}
const getInvitations = async (req: IAuthRequest) => {
  try {
    const userId: number = req.user?.id;
    const familyId = req.user?.familyId ? Number(req.user.familyId) : undefined;
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
    const eventId = req.params.id;
    const userId = req.user.id;
    const familyId = req?.user?.familyId;
    const service = await Service.setResponce(req.body, userId, familyId, eventId); // TODO:update the validaion in this line of the code 
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
    const data = await Service.getEventguest(Number(id), userId);
    return data;
  }
  catch (err) {
    throw err;
  }
}

const removeinvitation = async (req: IAuthRequest) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updated_user = await Service.remove_invitation(id, userId, req.body);
    return updated_user;
  } catch (err) {
    throw err;
  }
}

const getHotelManegemt = async (req: IAuthRequest) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const get_hotel_managemtn = await Service.getEventHotelManagement(id, userId);
    return get_hotel_managemtn;
  }
  catch (err) {
    throw err;
  }
}

const getEventGuestCategory = async (req: IAuthRequest) => {
  try {
    const eventId = Number(req.params.id);
    const userId = req.user.id;
    return await Service.getEventGuestCategory(eventId, userId);
  } catch (err) {
    throw err;
  }
};

const createGuestCategory = async (req: IAuthRequest) => {
  try {
    const eventId = Number(req.params.id);
    const userId = req.user.id;
    return await Service.createGuestCategory(req.body, eventId, userId);
  } catch (err) {
    throw err;
  }
};

const updateGuestCategory = async (req: IAuthRequest) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;
    return await Service.updateGuestCategory(req.body, id, userId);
  } catch (err) {
    throw err;
  }
};

const deleteGuestCategory = async (req: IAuthRequest) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;
    return await Service.delete_guest_category(id, userId);
  } catch (err) {
    throw err;
  }
}

const toggleCheckInOut = async (req: IAuthRequest) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const userId = req.user.id;

    if (!id || isNaN(Number(id))) {
      throwErrorOnValidation("Valid invitation id is required");
    }
    if (!action || !["checkIn", "checkOut"].includes(action)) {
      throwErrorOnValidation("Action must be 'checkIn' or 'checkOut'");
    }

    return await Service.toggleCheckInOut(Number(id), action, userId);
  } catch (err) {

    throw err;
  }
}
const getGuestTransportationList = async (req: IAuthRequest) => {
  try {
    const eventId = Number(req.params.id);
    const userId = req.user.id;
    if (!eventId) {
      throwErrorOnValidation("eventId is required");
    }
    return await Service.getGuestTransportationList(eventId, userId);
  } catch (err) {
    throw err;
  }
};
const importGuest = async (req: IAuthRequest) => {
  try {
    const userId = req.user.id;
    return await Service.importInvitation(req.body, userId);
  } catch (err) {
    throw err;
  }
};
export default {
  importGuest,
  setResponce,
  getHotelManegemt,
  removeinvitation,
  sendInvitation,
  getInvitations,
  getInvitationResponse,
  getEventGuest,
  getEventGuestCategory,
  createGuestCategory,
  updateGuestCategory,
  deleteGuestCategory,
  toggleCheckInOut,
  getGuestTransportationList,
};
