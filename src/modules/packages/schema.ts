import { numeric, pgTable, timestamp } from "drizzle-orm/pg-core";
import { integer, serial, varchar } from "drizzle-orm/pg-core"
import { tableName, attributes } from "./attribute";
import { buisness } from "@/config/db/schema";

const schema = pgTable(tableName, attributes)

export const packageItem = pgTable("package_item", {
  id: serial("id").primaryKey(),
  packageId: integer("package_id").references(() => schema.id, { onDelete: "cascade" }),
  group: varchar("group", { length: 255 }),
  title: varchar("title"),
  quantity: numeric("quantity"),
  rate: numeric("rate"),
  amount: numeric("amount"),
  remark: integer("remark"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdateFn(() => new Date()).notNull()
})

export const eventPackageTable = pgTable("event_package", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => schema.id, { onDelete: "cascade" }),
  packageVendor: integer("package_vendor_id").references(() => buisness.id, { onDelete: "cascade" }),
  packageGroup: varchar("package_group", { length: 255 }),
  price: numeric("price"),
  title: varchar("title"),
  quantity: numeric("quantity"),
  rate: numeric("rate"),
  amount: numeric("amount"),
  remark: integer("remark"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdateFn(() => new Date()).notNull()
})

export default schema;
