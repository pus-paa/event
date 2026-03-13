export interface UserColumn {
  id: number;
  username: string | null;
  info: any | null;
  password: string | null;
  dob: Date | null;
  email: string;
  city: string | null;
  zip: string | null;
  address: string | null;
  coverPhoto: string | null;
  photo: string | null;
  familyId: number | null;
  relation: string | null;
  foodPreference: string | null;
  country: string | null;
  bio: string | null;
  location: string | null;
  phone: string | null;
  accountStatus: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}
class Resource {
  static toJson(user: UserColumn): Partial<UserColumn> {
    const data: Partial<UserColumn> = {
      id: user.id,
      username: user.username,
      phone: user.phone,
      email: user.email,
      location: user.location,
      bio: user.bio,
      photo: user.photo,
      country: user.country,
      city: user.city,
      address: user.address,
      zip: user.zip,
      familyId: user.familyId,
      relation: user.relation,
      foodPreference: user.foodPreference,
      coverPhoto: user.coverPhoto,
      info: user.info,
      dob: user.dob,
      accountStatus: user.accountStatus,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    return data;
  }
  static collection(users: UserColumn[]) {
    return users.map(this.toJson);
  }
}

export default Resource;
