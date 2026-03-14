import { integer, pgEnum, serial, timestamp, varchar } from "drizzle-orm/pg-core";
const tableName = "event";
import user from "@/modules/user/schema";

const statusEnum = pgEnum("status", [
  "draft",
  "published",
  "cancelled",
  "invited",
]);

const eventMemberTableName = "user_event";
const eventVendorTableName = "event_vendor";

const eventAttribute = {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 50 }),
  description: varchar("description", { length: 200 }),
  type: varchar("type", { length: 100 }).notNull(),
  startDateTime: timestamp("startDateTime", { withTimezone: true }).notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }), // For the longer folder and image url 
  endDateTime: timestamp("endDateTime", { withTimezone: true }).notNull(),
  location: varchar("location", { length: 50 }),
  organizer: integer("organizer").references(() => user.id, {
    onDelete: "cascade",
  }),
  parentId: integer("parentid"),
  budget: integer("budget"),
  rsvp_deadline: varchar("rsvp_deadline"),
  visiblity: varchar("visiblity"),
  status: varchar("status", { length: 20 }),
  venue: varchar("venue", { length: 50 }),
  theme: varchar("theme", { length: 50 }),
  attire: varchar("attire", { length: 50 }),
  side: varchar("side", { length: 20 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
};

export {
  tableName,
  eventAttribute,
  eventMemberTableName,
  statusEnum,
  eventVendorTableName,
};
