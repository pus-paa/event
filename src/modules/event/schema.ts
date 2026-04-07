import { pgTable } from "drizzle-orm/pg-core";
import { integer, serial, varchar } from "drizzle-orm/pg-core";
import user from "@/modules/user/schema"
import {
  eventAttribute,
  tableName,
  eventMemberTableName,
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

const event_member_schema = pgTable(
  eventMemberTableName, event_member_attribute
);
export { event_member_schema, };
export default schema;
