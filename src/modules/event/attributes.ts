import { integer, pgEnum, serial, text, timestamp } from "drizzle-orm/pg-core";
const tableName = "event";
import user from "@/modules/user/schema";

//status
const eventType = pgEnum("event_type", ["wedding"]); // might have multiple type of event so not including this for now
const statusEnum = pgEnum("status", [
  "draft",
  "published",
  "cancelled",
  "invited",
]);

const eventMemberTableName = "user_event";
const eventGuestTableName = "event_guest";
const eventVendorTableName = "event_vendor";

const eventAttribute = {
  id: serial("id").primaryKey(),
  title: text("title"),
  description: text("description"),
  type: text("type").notNull(),
  startDateTime: timestamp("startDateTime").notNull(),
  imageUrl: text("imageUrl"),
  endDate: timestamp("endDateTime").notNull(),
  location: text("location"),
  organizer: integer("organizer").references(() => user.id, {
    onDelete: "cascade",
  }),
  parentId: integer("parentid"),
  budget: integer("budget"),
  rsvp_deadline: text("rsvp_deadline"),
  visiblity: text("visiblity"),
  status: statusEnum("status"),
  theme: text("theme"),
  attire: text("attire"),
  side: text("side"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
};

export {
  tableName,
  eventAttribute,
  eventType,
  eventMemberTableName,
  eventGuestTableName,
  statusEnum,
  eventVendorTableName,
};
