import { serial, timestamp, varchar, integer, boolean } from "drizzle-orm/pg-core";
import event from "@/modules/event/schema";
import business from "@/modules/businesses/schema";

const tableName = "catering";

const attributes = {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  eventId: serial("event_id")
    .notNull()
    .references(() => event.id, { onDelete: "cascade" }),
  perPlateprice: integer("per_plate_price").notNull(),
  noOfpax: integer("no_of_pax"), // Guest Count 
  startDateTime: timestamp("start_date_time", { withTimezone: true }).notNull(),
  endDateTime: timestamp("end_date_time", { withTimezone: true }).notNull(),
  mealType: varchar("meal_type", { length: 255 }).notNull(),
  isVeg: boolean("is_veg"),
  vendorId: integer("vendor_id").references(() => business.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
};

export { tableName, attributes };
