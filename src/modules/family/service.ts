import {
  type AddMemberValidation,
  type CreateFamilyValidation,
  type UpdateFamilyValidation,
  type UpdateMemberValidation,
} from "./validators";
import Model from "./model";
import UserService from "@/modules/user/service";
import Resource from "./resource";
import { throwForbiddenError, throwNotFoundError } from "@/utils/error";
import logger from "@/config/logger";
import userModel from "@/modules/user/model";
import InvitationModel from "@/modules/invitation/model";

const checkAuthorization = async (
  familyId: number,
  userId: number,
  onlyCreator: boolean = false,
): Promise<boolean> => {
  const family = await Model.find(familyId);

  if (!family) {
    return false;
  }

  if (onlyCreator) {
    return family.createdBy === userId;
  }

  const isMemberOfFamily = await Model.findIfMemberOfFamily(familyId, userId);

  if (!isMemberOfFamily) {
    return false;
  }

  return true;
};

const create = async (input: CreateFamilyValidation["body"], user: number) => {
  try {
    const userDetail = await UserService.find({ id: user });
    if (!userDetail) {
      return throwNotFoundError("User with information was not found")
    }
    if (!userDetail.email) {
      throw new Error("User email was not found");
    }
    if (!userDetail.phone) {
      throw new Error("User phone was not found");
    }
    if (userDetail && userDetail.familyId) {
      throw new Error("User already has a family");
    }

    const { familyName } = input;

    const result = await Model.create({ familyName, createdBy: user });

    if (!result) {
      throw new Error("Failed to create family");
    }


    await Model.addMemberIfUser(result.id, user, {
      username: userDetail.username || userDetail.email,
      dob: userDetail?.dob ?? undefined,
      email: userDetail.email,
      phone: userDetail.phone,
      relation: "self",
      foodPreference: null,
    });

    return Resource.toJson(result);
  } catch (err: any) {
    logger.error("Error in Family creation:", err);
    throw err;
  }
};

const get = async (id: number) => {
  try {
    const result = await Model.find(id);
    if (!result) {
      return throwNotFoundError("Family");
    }

    return Resource.toJson(result);
  } catch (err: any) {
    logger.error("Error in Family fetch:", err);
    throw err;
  }
};

const getMyFamilies = async (userId: number) => {
  try {
    const result = await Model.findByUserId(userId);
    return result;
  } catch (error) {
    throw error;
  }
};

const update = async (
  familyId: number,
  input: UpdateFamilyValidation["body"],
  user: number,
) => {
  try {
    const existing = await Model.find(familyId);
    if (!existing) {
      return throwNotFoundError("Family");
    }

    const isAuthorized = await checkAuthorization(familyId, user, true);

    if (!isAuthorized) {
      throwForbiddenError("Only family creator can update family");
    }

    const result = await Model.update(input, familyId);
    if (!result) {
      throw new Error("Failed to update family");
    }

    return Resource.toJson(result);
  } catch (err: any) {
    logger.error("Error in Family update:", err);
    throw err;
  }
};

const remove = async (id: number, user: number) => {
  try {
    const existing = await Model.find(id);
    if (!existing) {
      return throwNotFoundError("Family");
    }

    const isAuthorized = await checkAuthorization(id, user, true);

    if (!isAuthorized) {
      throwForbiddenError("Only family creator can delete family");
    }

    const result = await Model.destroyWithMembers(id);
    return result;
  } catch (err: any) {
    logger.error("Error in Family deletion:", err);
    throw err;
  }
};

const addMember = async (
  familyId: number,
  addedBy: number,
  input: AddMemberValidation["body"],
) => {
  try {
    await get(familyId);

    const isAuthorized = await checkAuthorization(familyId, addedBy);
    if (!isAuthorized) {
      throwForbiddenError("Only family members can add members");
    }

    const user = await userModel.find({ email: input.email, phone: input.phone });

    let userId;
    if (user) {
      const existedFamily = await Model.findIfUserHasFamily(user.id);
      if (existedFamily && existedFamily.familyId !== familyId) {
        throw new Error("User already belongs to another family");
      }

      userId = user.id;
      if (!input.username && user.username) {
        input.username = user.username;
      }
    } else {
      const newUser = await UserService.create({
        username: input.username ?? "Member",
        password: `${new Date()}_User`,
        email: input.email,
        dob: input.dob ?? null,
        phone: input.phone,
        relation: input.relation ?? "Family member"
      });
      if (!newUser || !newUser.id) {
        throw new Error("Failed to create user for family member");
      }
      userId = newUser.id;
    }

    const result = await Model.addMemberIfUser(familyId, userId, input);

    if (!result) {
      throw new Error("Failed to add member to family");
    }

    return Resource.toJsonMember(result);
  } catch (error) {
    throw error;
  }
};

const listMembers = async (familyId: number) => {
  try {
    await get(familyId);
    const members = await Model.getMembers(familyId);
    console.log(members);
    return Resource.collectionMembers(members as any);
  } catch (error) {
    throw error;
  }
};

const getMemberDetails = async (familyId: number, memberId: number) => {
  try {
    await get(familyId);

    const member = await Model.getMember(familyId, memberId);
    if (!member) {
      return throwNotFoundError("Family member");
    }

    return Resource.toJsonMember(member as any);
  } catch (error) {
    throw error;
  }
};

const updateMember = async (
  familyId: number,
  memberId: number,
  updatedBy: number,
  input: UpdateMemberValidation["body"],
) => {
  try {
    await get(familyId);

    const isAuthorized = await checkAuthorization(familyId, updatedBy, true);
    if (!isAuthorized) {
      throwForbiddenError("Only family creator can update members");
    }

    const existingMember = await Model.getMember(familyId, memberId);
    if (!existingMember) {
      return throwNotFoundError("Family member");
    }

    const result = await Model.updateMember(familyId, memberId, input);
    if (!result) {
      throw new Error("Failed to update family member");
    }

    return Resource.toJsonMember(result);
  } catch (error) {
    throw error;
  }
};

const removeMember = async (
  familyId: number,
  memberId: number,
  removedBy: number,
) => {
  try {
    await get(familyId);

    const isAuthorized = await checkAuthorization(familyId, removedBy, true);
    if (!isAuthorized) {
      throwForbiddenError("Only family creator can remove members");
    }

    const existingMember = await Model.getMember(familyId, memberId);
    if (!existingMember) {
      return throwNotFoundError("Family member");
    }

    const [removedMember, removedEventOfMemberInFamily] = await Promise.all([
      Model.removeMember(familyId, memberId),
      InvitationModel.removeEventGuestWhileRemovingFamilyMember(
        familyId,
        memberId,
      ),
    ]);

    if (removedMember && removedEventOfMemberInFamily) {
      return "Member removed successfully";
    } else {
      throw new Error("Failed to remove family member");
    }
  } catch (error) {
    throw error;
  }
};

const makeFamilyAndAddUserToFamily = async (
  userId: number,
  fullName: string,
) => {
  console.log('making the family with the userId', userId, fullName)
  const userFamily = await Model.create({
    createdBy: userId,
    familyName: `${fullName}'s Family`,
  });
  await UserService.update(
    { familyId: userFamily?.id },
    userId,
  )
  return userFamily?.id || null;
};
export default {
  create,
  get,
  update,
  remove,
  addMember,
  listMembers,
  getMemberDetails,
  updateMember,
  makeFamilyAndAddUserToFamily,
  removeMember,
  getMyFamilies,
};
