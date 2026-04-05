import users from "./schema";
const selectQuery = {
  id: users.id,
  username: users.username,
  email: users.email,
  phone: users.phone,
  accountStatus: users.accountStatus,
  dob: users.dob,
  location: users.location,
  bio: users.bio,
  photo: users.photo,
  country: users.country,
  city: users.city,
  address: users.address,
  zip: users.zip,
  isActivated: users.isActivated,
  familyId: users.familyId,
  relation: users.relation,
  foodPreference: users.foodPreference,
  coverPhoto: users.coverPhoto,
  info: users.info,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

const authSelectQuery = {
  ...selectQuery,
  password: users.password,
};

export default {
  authSelectQuery,
  selectQuery,
};
