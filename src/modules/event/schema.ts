import { pgTable } from "drizzle-orm/pg-core";
import { integer, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import user from "@/modules/user/schema"
import {
  eventAttribute,
  tableName,
  eventMemberTableName,
  eventVendorTableName,
} from "./attributes";

const schema = pgTable(tableName, eventAttribute);

const event_member_attribute = {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => user.id, { onDelete: "cascade" }),
  eventId: integer("event_id")
    .references(() => schema.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50 }),
};

const event_vendor_attribute = {
  id: serial("id").primaryKey(),
  event_id: integer("event_id")
    .notNull()
    .references(() => schema.id),
  vendor_buisness_id: text("vendor_buisness_id").notNull(),
  acquired_by: integer("acquired_by"),
  status: varchar("status", { length: 15 }), // Accepted , Enquiring
  notes: varchar("notes", { length: 200 }),
  createdAt: timestamp("create_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
};

const event_member_schema = pgTable(
  eventMemberTableName, event_member_attribute
);
const event_vendor_schema = pgTable(
  eventVendorTableName, event_vendor_attribute
);
export { event_member_schema, event_vendor_schema };
export default schema;
