import { type IAuthRequest } from "@/routes/index";
import Service from "./service";
import logger from "@/config/logger";
import { throwErrorOnValidation } from "@/utils/error";

const get = async (req: IAuthRequest) => {
  try {
    const userId = req.user?.id;
    const data = await Service.list({ ...req?.query, userId });
    return data;
  } catch (err: any) {
    throw err;
  }
};

const create = async (req: IAuthRequest) => {
  try {
    const userId = req.user?.id;
    const data = await Service.create(
      { ...req.body, organizer: userId },
      userId,
    );
    return data;
  } catch (err: any) {
    throw err;
  }
};

const findOne = async (req: IAuthRequest) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      throwErrorOnValidation("Invalid ID");
    }
    const data = await Service.find(Number(id));
    return data;
  } catch (err: any) {
    throw err;
  }
};

const update = async (req: IAuthRequest) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!id || isNaN(Number(id))) {
      throwErrorOnValidation("Invalid ID");
    }
    if (!userId) {
      throwErrorOnValidation("User not authenticated");
    }

    const data = await Service.update(Number(id), req.body, userId);
    return data;
  } catch (err: any) {
    throw err;
  }
};

const deleteModule = async (req: IAuthRequest) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!id || isNaN(Number(id))) {
      throwErrorOnValidation("Invalid ID");
    }
    if (!userId) {
      throwErrorOnValidation("User not authenticated");
    }
    const data = await Service.remove(Number(id), userId);
    return data;
  } catch (err: any) {
    throw err;
  }
};

const listMyEvents = async (req: IAuthRequest) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throwErrorOnValidation("User not authenticated");
    }
    const data = await Service.listMyEvents(userId, req.query);
    return data;
  } catch (err: any) {
    throw err;
  }
};

const getUserRelatedToEvent = async (req: IAuthRequest) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.id;

    logger.debug("This is the getEvent guest in the controller");
    if (!eventId || isNaN(Number(eventId))) {
      throwErrorOnValidation("Invalid Event ID");
    }
    if (!userId) {
      throwErrorOnValidation("User not authenticated");
    }

    const data = await Service.getUserRelatedToEvent(Number(eventId), userId);
    return data;
  } catch (error: any) {
    throw error;
  }
};

const getSubEventOfEvent = async (req: IAuthRequest) => {
  const { params } = req;

  const subEvents = await Service.getSubEventOfEvent(Number(params.id));
  return subEvents;
};
const makeUserRelatedToEvent = async (req: IAuthRequest) => {
  try {
    const eventId = Number(req.params.eventId);
    console.log('eventId', eventId);
    const userId = req.user.id;
    const service = await Service.makeEventMember(eventId, userId, req.body)
    console.log('the service in the evemt mking jobis', service)
    return service;
  } catch (err) {
    throw err;
  }

}
export default {
  makeUserRelatedToEvent,
  get,
  create,
  findOne,
  update,
  deleteModule,
  listMyEvents,
  getUserRelatedToEvent,
  getSubEventOfEvent,
};
