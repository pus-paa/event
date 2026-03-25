import { boolean, integer, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import eventSchema from "@/modules/event/schema";
import user from "@/modules/user/schema"
export const tableName = "todos";
export const todoAttribute = {
  id: serial(),
  eventId: integer("event_id").references(() => eventSchema.id).notNull(),
  task: varchar('task', { length: 200 }),
  isDone: boolean("is_done").default(false),
  assigned_to: integer("assigned_to").references(() => user.id),
  title: varchar("title", { length: 255 }),
  parentId: integer("parentId"),
  dueDate: timestamp("due_date").defaultNow(),
  status: varchar("status", { length: 30 }),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
}

export default todoAttribute; 
