import users from "./schema";
const selectQuery = {
  id: users.id,
  username: users.username,
  phone: users.phone,
  email: users.email,
  accountStatus: users.accountStatus,
  dob: users.dob,
  bio: users.bio,
  photo: users.photo,
  location: users.location,
  country: users.country,
  city: users.city,
  address: users.address,
  isActivated: users.isActivated,
  zip: users.zip,
  familyId: users.familyId,
  relation: users.relation,
  foodPreference: users.foodPreference,
  coverPhoto: users.coverPhoto,
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
