import { integer, jsonb, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import eventSchema from "@/modules/event/schema";
import user from "@/modules/user/schema"
export const tableName = "todos";
export const todoAttribute = {
  id: serial().primaryKey(),
  eventId: integer("event_id").references(() => eventSchema.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 255 }),
  task: varchar('task', { length: 200 }),
  doneByuserIds: jsonb("done_by_user_id").$type<number[]>().default([]), // Initialization to tackle null error
  assignedTo: integer("assigned_to").references(() => user.id),
  assignedGroup: varchar("assigned_group"),
  parentId: integer("parentId"),
  category: varchar("category", { length: 100 }),
  createdBy: integer("created_by").references(() => user.id).notNull(),
  dueDate: timestamp("due_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
}

export default todoAttribute; 
