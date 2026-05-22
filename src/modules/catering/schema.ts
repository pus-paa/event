import { integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { attributes, tableName } from "./attributes";

const schema = pgTable(tableName, attributes);
export const menuSchema = pgTable("menu", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  cateringId: serial("catering_id")
    .notNull()
    .references(() => schema.id, { onDelete: "cascade" }),

  type: varchar("type", { length: 255 }).notNull(),// eg : starter , apetizer etc
  note: varchar("note", { length: 255 }),
  guestCount: integer("guest_count"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export default schema;
