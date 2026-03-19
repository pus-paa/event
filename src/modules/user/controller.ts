import type { IAuthRequest } from "@/routes/index";
import Service from "./service";
import logger from "@/config/logger";

const get = async (req: IAuthRequest) => {
  try {
    if (!!req?.query?.phone) {
      req.query.phone = `+` + req.query.phone.trim();
    }
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
    const phone = `+` + req.query.phone.trim();// This is due to the issue in the ui 
    console.log(phone)
    const userDetail = await Service.find({
      phone: phone.trim()
    })

    console.log('User witht he info', userDetail);
    return userDetail;
  }
  catch (err) {
    throw err;
  }
}
const resetPassword = async (req: IAuthRequest) => {
  try {
    const { userId, newPassword } = req.body
    const updatedUser = Service.resetPassword({ newPassword: newPassword }, userId)
    return updatedUser;
  }
  catch (err) {
    throw err;
  }
}

const create = async (req: IAuthRequest) => {
  try {
    const { body } = req;
    body.isActivated = true;
    const data = await Service.create(body);
    return data;
  } catch (err: any) {
    throw err;
  }
};
const login = async (req: Request) => {
  try {
    const { body }: any = req;
    const data = await Service.login(body);
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
  resetPassword,
  findUserByPhone
};
