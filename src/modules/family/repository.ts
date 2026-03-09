import users from "@/modules/user/schema";
import { family } from "./schema";
const selectQuery = {
  id: family.id,
  familyName: family.familyName,
  createdBy: family.createdBy,
  createdAt: family.createdAt,
  updatedAt: family.updatedAt,
};

const selectMemersQuery = {
  familyId: users.familyId,
  userId: users.id,
  username: users.username,
  phone: users.phone,
  relation: users.relation,
  name: users.username,
  email: users.email,
  foodPreference: users.foodPreference,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};


export default {
  selectQuery,
  selectMemersQuery,
};
