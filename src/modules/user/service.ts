import {
  changePasswordValidationSchema,
  loginValidationSchema,
  updateProfileValidationSchema,
  validationSchema,
  type createUserType,
  type loginType,
  type updateProfileType,
} from "./validators";
import crypto from "crypto";
import { role } from "@/constant";
import z from "zod";
import logger from "@/config/logger";
import Model from "./model";
import type { UserColumn } from "./resource";
import { throwErrorOnValidation, throwNotFoundError } from "@/utils/error";
import { comparePassword, hashPassword } from "@/utils/hashPassword";
import Resource from "./resource";
import Token from "@/utils/token";

const list = async (params: any) => {
  try {
    const data = await Model.findAllAndCount(params);
    return data;
  } catch (err: any) {
    throw err;
  }
};

const create = async (input: createUserType) => {
  try {
    const { error, success } = await z.safeParseAsync(validationSchema, input);
    if (!success) {
      throwErrorOnValidation(
        error.issues.map((issue) => issue.message).join(", "),
      );
    }
    const { email, password } = input;
    const duplicateUser = await Model.find({ email, phone: input.phone });
    if (duplicateUser?.id) {
      throwErrorOnValidation("User with this email already exists");
    }
    const hashedPw = await hashPassword(password ?? `${Date.now()}`);
    const user = await Model.create(input, hashedPw);
    if (!user) {
      throw Error("Failed to create user");
    }
    const tokenPayload = {
      id: user!.id,
      email: user!.email,
      role: role.user,
      familyId: user.familyId == 0 ? undefined : user.familyId,
    };
    const token = await Token.sign(tokenPayload, "30d");
    const jsonData = Resource.toJson(user as any);
    //include the token in the responce whi!evele making the user in the system
    return {
      ...jsonData,
      token,
    };
  } catch (err: any) {
    throw err;
  }
};

const login = async (input: loginType) => {
  try {
    console.log(input);
    const result = loginValidationSchema.safeParse(input);

    if (!result.success) {
      throwErrorOnValidation(
        result.error.issues.map((issue) => issue.message).join(", "),
      );
    }

    const user = await Model.find({ phone: input.phone }, { includePassword: true })
    if (!user || !user.id) {
      throwErrorOnValidation("Invalid credentials");
    }

    const isPasswordValid = await comparePassword(
      input.password,
      user!.password as string,
    );
    if (!isPasswordValid) {
      throwErrorOnValidation("Invalid credentials");
    }
    const tokenPayload = {
      id: user!.id,
      role: role.user,
      email: user!.email,
      familyId: user?.familyId == 0 ? undefined : user?.familyId,
    };
    const token = await Token.sign(tokenPayload, "30d");

    return { token, user: Resource.toJson(user as any) };
  } catch (error) {
    throw error;
  }
};

const find = async (data: Partial<UserColumn>) => {
  try {
    if (!!data.email) {
      const user = await Model.find({ email: data.email });
      if (!user || user == null) {
        return throwNotFoundError("User with the email was not found ");
      }
      return Resource.toJson(user as any);
    }
    if (!!data.phone) {
      const user = await Model.find({ phone: data.phone });
      if (!user || user == null) {
        return throwNotFoundError("User with the phone was not found ");
      }
      return Resource.toJson(user as any);

    }
    if (!!data.id) {
      const user = await Model.find({ id: data.id });
      if (!user || user == null) {
        throwNotFoundError("User with the id was not found");
      }
      return Resource.toJson(user as any);
    }

  } catch (error) {
    throw error;
  }
};

const changePassword = async (input: { currentPassword: string, newPassword: string }, id: number) => {
  try {
    const result = changePasswordValidationSchema.safeParse(input);
    if (!result.success) {
      throwErrorOnValidation(
        result.error.issues.map((issue) => issue.message).join(", "),
      );
    }
    const { currentPassword, newPassword } = input;

    const user = await Model.find({ id }, { includePassword: true });
    if (!user) {
      throwNotFoundError("User");
    }
    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      user!.password as string,
    );
    if (!isCurrentPasswordValid) {
      throwErrorOnValidation("Current password is incorrect");
    }
    const hashedNewPassword = await hashPassword(newPassword);
    const updatePassword = await Model.update(
      { password: hashedNewPassword },
      id,
    );
    return Resource.toJson(updatePassword);
  } catch (error) {
    throw error;
  }
};
const resetPassword = async (input: { newPassword: string }, userId: number) => {
  try {
    const user = await Model.update({
      password: await hashPassword(input.newPassword),
      isActivated: true
    }, userId)
    const tokenPayload = {
      id: user!.id,
      role: role.user,
      email: user!.email,
      familyId: user?.familyId == 0 ? undefined : user?.familyId,
    };
    const token = await Token.sign(tokenPayload, "30d");
    console.log("the user with the information was", user);
    return { token, user: Resource.toJson(user as any) };


  } catch (err) {
    throw err;
  }
}

const updateProfile = async (input: updateProfileType, id: number) => {
  try {
    const result = updateProfileValidationSchema.safeParse(input);
    if (!result.success) {
      throwErrorOnValidation(
        result.error.issues.map((issue) => issue.message).join(", "),
      );
      return;
    }
    const updateData = result.data;

    const user = await Model.find({ id });
    if (!user) {
      throwNotFoundError("User");
    }

    if (updateData.email) {
      const duplicateUser = await Model.find({ email: updateData.email });
      if (duplicateUser && duplicateUser.id !== id) {
        throwErrorOnValidation("User with this email already exists");
      }
    }

    const updatedUser = await Model.update(updateData, id);
    if (!updatedUser) {
      throwNotFoundError("User");
    }

    return Resource.toJson(updatedUser as any);
  } catch (error) {
    throw error;
  }
};

const remove = async (id: number) => {
  try {
    // Check if admin exists
    const admin = await Model.find({ id });

    if (!admin) {
      throwNotFoundError("Admin");
    }

    // Delete user
    await Model.destroy(id);

    logger.info(`User ${id} deleted successfully`);
    return { message: "User deleted successfully" };
  } catch (error) {
    throw error;
  }
};
const update = async (params: Partial<UserColumn>, userId: number) => {
  try {
    const updated_data = await Model.update(params, userId);
    return updated_data;
  } catch (err) {
    throw err;
  }
}
const UserGeneratorWithPhoneOrEmail = async ({
  fullName,
  email,
  phone,
  relation
}: {
  fullName: string,
  email: string | undefined,
  phone: string,
  relation: string
}) => {
  const randomPassword = crypto.randomBytes(8).toString("hex");
  const placeholderEmail = email || `guest_${Date.now()}_${Math.floor(Math.random() * 1000)}@khumbaya.com`;
  const placeholderPhone = phone || `+977${Date.now()}`;

  const user = await create({
    dob: new Date(),
    username: fullName,
    email: placeholderEmail,
    password: randomPassword,
    relation: relation,
    phone: placeholderPhone,
  });
  if (!user || user.id == undefined) throw new Error("Error while making the user ")
  return user;
}
export default {
  list,
  update,
  create,
  UserGeneratorWithPhoneOrEmail,
  login,
  // logout,
  find,
  changePassword,
  updateProfile,
  remove,
  resetPassword
};
