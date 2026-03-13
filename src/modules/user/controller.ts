import type { IAuthRequest } from "@/routes/index";
import Service from "./service";
import logger from "@/config/logger";

const get = async (req: IAuthRequest) => {
  try {
    const data = await Service.list(req?.query);
    return data;
  } catch (err: any) {
    throw err;
  }
};

const profile = async (req: IAuthRequest) => {
  try {
    const { user } = req;
    const data = await Service.find({ id: user.id });
    return data;
  } catch (err) {
    throw err;
  }
};
const findUserByPhone = async (req: IAuthRequest) => {
  try {
    const userDetail = await Service.find(req.body)
    return userDetail;
  }
  catch (err) {
    throw err;
  }
}

const create = async (req: IAuthRequest) => {
  try {
    const { body } = req;
    const data = await Service.create(body);
    return data;
  } catch (err: any) {
    throw err;
  }
};
const login = async (req: Request) => {
  try {
    const { body, headers }: any = req;
    const data = await Service.login({
      ...body,
      host: headers?.host,
      userAgent: headers["user-agent"],
    });
    return data;
  } catch (err: any) {
    throw err;
  }
};

const changePassword = async (req: IAuthRequest) => {
  try {
    const { user, body } = req;
    const data = await Service.changePassword(body, user?.id); // Update this in the token while in the middleware
    return data;
  } catch (err: any) {
    throw err;
  }
};

const updateProfile = async (req: IAuthRequest) => {
  try {
    const { user, body } = req;
    const data = await Service.updateProfile(body, user?.id);
    return data;
  } catch (err: any) {
    throw err;
  }
};
const deleteModule = async (req: Request) => {
  try {
    logger.info("This is the deletemodule");
    logger.info("Deleting module %s", req);
  } catch (err) {
    throw "Validation error ";
  }
};
export default {
  login,
  create,
  get,
  changePassword,
  updateProfile,
  profile,
  deleteModule,
  findUserByPhone
};
