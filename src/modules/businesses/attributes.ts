import {
  serial,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
export const tableName = "businesses"
export const businessesAttribute = {
  id: serial("id").primaryKey(),
  business_name: varchar("business_name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }), // e.g., "catering", "venue", "entertainment" , "photography"
  category: varchar("category", { length: 100 }),// e.g., "food", "drinks", "music", "decor" , "modern", "classic" , "rustic" and all this thing
  avatar: text("avatar"),
  cover: text("cover"),
  location: varchar("location", { length: 255 }),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  legal_document: text("legal_document"), // URL to PDF/image
  is_verified: boolean("is_verified").default(false),
  owner_id: integer("owner_id").notNull(), // Reference to users.id
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  venue_id: integer("venue_id")
}

export const venueAttribute = {
  capacity: integer("capacity"),
  business_id: integer("business_id"),
  area_sqft: varchar("area_sqft", { length: 40 }),
  min_booking_hours: integer("min_booking_hours").default(1),
  max_booking_hours: integer("max_booking_hours"),
  has_catering: boolean("has_catering").default(false),
  has_av_equipment: boolean("has_av_equipment").default(false),
  is_outDoor: varchar("is_outDoor"),
  price_per_hour: integer("price_per_hour"),
  parking: varchar("parking", { length: 50 }), // free , open and all this thing 
}
