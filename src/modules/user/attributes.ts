import {
  json,
  date,
  timestamp,
  serial,
  boolean,
  integer,
  varchar,
  text,
} from "drizzle-orm/pg-core";
const tableName = "user";

const attributes = {
  // Much more practical lengths
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull(),
  email: varchar("email", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 60 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  accountStatus: boolean("accountStatus").default(true),
  location: varchar("location", { length: 255 }),
  bio: text("bio"),
  photo: text("photo"),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  address: varchar("address", { length: 255 }),
  dob: date("date_of_birth"),
  zip: varchar("zip", { length: 20 }),
  familyId: integer("family_id"),
  relation: varchar("relation", { length: 50 }),
  foodPreference: varchar("food_preference", { length: 100 }),
  coverPhoto: text("coverPhoto"),
  info: json("info"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
};
export { tableName, attributes };
