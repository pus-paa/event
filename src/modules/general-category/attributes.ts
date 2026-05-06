import { serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const tableName = "general_category";
export const attributes = {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  icon: varchar("icon", { length: 200 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
};
