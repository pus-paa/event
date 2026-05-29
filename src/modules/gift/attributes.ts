import {
  serial,
  integer,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import event from "@/modules/event/schema"
import user from "@/modules/user/schema"

const giftCategoryTableName = "gift_category";
const giftTableName = "gift";

const giftCategoryattributes = {
  id: serial("id").notNull().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  eventId: integer("event_id").references(() => event.id, { onDelete: "cascade" }).notNull(),
  createdBy: integer("created_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}

const giftsAttributes = {
  id: serial("id").notNull().primaryKey(),
  name: varchar("name").notNull(),
  category: varchar("category", { length: 255 }).notNull(),
  count:integer("count").default(1).notNull(),  
  eventId: integer("event_id").references(() => event.id, { onDelete: "cascade" }).notNull(),
  value: integer("value"),
  createdBy: integer("created_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdateFn(() => new Date()),
}
export { giftTableName, giftCategoryTableName, giftsAttributes, giftCategoryattributes }; 
