import { buisness } from "@/config/db/schema";
import { serial, timestamp, integer, varchar, numeric } from "drizzle-orm/pg-core";
export const tableName = "vendor_package";
export const attributes = {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").references(() => buisness.id, { onDelete: "cascade" }).notNull(),
  totalAmount: numeric("total_amount"),
  title: varchar("title"),
  currency: varchar("currency"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdateFn(() => new Date()).notNull()
}
