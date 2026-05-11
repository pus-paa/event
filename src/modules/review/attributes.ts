import { integer, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import businesses from "@/modules/businesses/schema";
import user from "@/modules/user/schema";
export const tableName = "review";

export const reviewAttributes = {
  id: serial("id").primaryKey(),
  businessId: integer("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => user.id),
  rating: integer("rating").notNull(), // 1-5 scale
  description: varchar("description", { length: 200 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),

}