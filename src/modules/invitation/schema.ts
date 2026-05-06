import { integer, pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";
import { attributes, tableName } from "./attributes";
import event from "../event/schema";
const schema = pgTable(tableName, attributes);
export const guest_category_schema = pgTable("guest_category", {
  id: serial(),
  category_title: varchar("category_title", { length: 100 }),
  eventId: integer("event_id").references(() => event.id, { onDelete: "cascade" }),
  priority: integer("priority"),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date())
});
export default schema;
