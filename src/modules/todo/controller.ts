import { type IAuthRequest } from "@/routes/index";
import Service from "./service";
import { throwErrorOnValidation } from "@/utils/error";

const get = async (req: IAuthRequest) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throwErrorOnValidation("User not authenticated");
    }

    const data = await Service.list({ ...req?.query });
    return data;
  } catch (err: any) {
    throw err;
  }
};

const getByEventId = async (req: IAuthRequest) => {
  try {
    const userId = req.user?.id;
    const { eventId } = req.params;
    if (!userId) {
      throwErrorOnValidation("User not authenticated");
    }
    if (!eventId || isNaN(Number(eventId))) {
      throwErrorOnValidation("Invalid eventId");
    }

    const data = await Service.findByEventId(Number(eventId), userId);
    return data;
  } catch (err: any) {
    throw err;
  }
};

const create = async (req: IAuthRequest) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throwErrorOnValidation("User not authenticated");
    }

    const data = await Service.create(req.body, userId);
    return data;
  } catch (err: any) {
    throw err;
  }
};

const findOne = async (req: IAuthRequest) => {
  try {
    const { id } = req.params;
    // const userId = req.user?.id;
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
    console.log("this is the params", req.params);
    const { id } = req.params;
    // const userId = req.user?.id;
    if (!id || isNaN(Number(id))) {
      throwErrorOnValidation("Invalid ID");
    }

    const data = await Service.update(Number(id), req.body);
    return data;
  } catch (err: any) {
    throw err;
  }
};

const deleteTodo = async (req: IAuthRequest) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      throwErrorOnValidation("invalid task id");
    }
    const deleteTodo = await Service.deleteTodo(Number(id));
    return deleteTodo;
  } catch (err) {
    throw err;
  }
}
const bulkStatus = async (req: IAuthRequest) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throwErrorOnValidation("User not authenticated");
    }
    const udpateTodo = await Service.bulkUpdate(req.body, userId);
    return udpateTodo;
  } catch (err) {
    throw err;
  }

}

export default {
  bulkStatus,
  get,
  deleteTodo,
  getByEventId,
  create,
  findOne,
  update,
};
