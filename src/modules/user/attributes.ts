import {
  text,
  json,
  timestamp,
  serial,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
const tableName = "user";

const attributes = {
  id: serial("id").primaryKey(),
  username: text("username"),
  email: text("email").notNull().unique(),
  password: text("password"),
  phone: text("phone"),
  userFamilyId: integer("user_family_id"),
  accountStatus: boolean("accountStatus"),
  location: text("location"),
  bio: text("bio"),
  photo: text("photo"),
  country: text("country"),
  city: text("city"),
  address: text("address"),
  dob: timestamp("date_of_birth"),
  zip: text("zip"),
  familyId: integer("family_id"),
  relation: text("relation"),
  foodPreference: text("food_preference"),
  coverPhoto: text("coverPhoto"),
  info: json("info"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
};

export { tableName, attributes };
