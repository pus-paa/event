import { family } from "./schema";
import UserRepository from "@/modules/user/repository"
const selectQuery = {
  id: family.id,
  familyName: family.familyName,
  createdBy: family.createdBy,
  createdAt: family.createdAt,
  updatedAt: family.updatedAt,
};

const selectMemersQuery = UserRepository.selectQuery;

export default {
  selectQuery,
  selectMemersQuery,
};
