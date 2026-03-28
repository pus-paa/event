import {
  serial,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
export const tableName = "businesses";
export const vendorVenueTableName = "vendor_venues_table";
export const vendorServiceTableName = "vendor_services_table";
import schema from "./schema"

export const businessesAttribute = {
  id: serial("id").primaryKey(),
  business_name: varchar("business_name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }),
  category: varchar("category", { length: 100 }),
  avatar: text("avatar"),
  cover: text("cover"),
  location: varchar("location", { length: 255 }),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  legal_document: varchar("legal_document", { length: 255 }),
  is_verified: boolean("is_verified").default(false),
  owner_id: integer("owner_id").notNull(),
  description: text("description"),
  price_starting_from: integer("price_starting_from"),
  years_of_experience: integer("years_of_experience"),
  team_size: integer("team_size"),
  service_area: varchar("service_area", { length: 255 }),
  contact_person_name: varchar("contact_person_name", { length: 120 }),
  contact_phone: varchar("contact_phone", { length: 20 }),
  website_url: text("website_url"),
  instagram_url: text("instagram_url"),
  whatsapp_number: varchar("whatsapp_number", { length: 20 }),
  provides_home_service: boolean("provides_home_service").default(false),
  travel_policy: text("travel_policy"),
  cancellation_policy: text("cancellation_policy"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),

};

export const venueAttribute = {
  id: serial("id").primaryKey(),
  business_id: integer("business_id").notNull().references(() => schema.id),
  venue_type: varchar("venue_type", { length: 100 }),
  capacity: integer("capacity"),
  area_sqft: varchar("area_sqft", { length: 40 }),
  min_booking_hours: integer("min_booking_hours").default(1),
  max_booking_hours: integer("max_booking_hours"),
  has_catering: boolean("has_catering").default(false),
  has_av_equipment: boolean("has_av_equipment").default(false),
  is_outDoor: varchar("is_outDoor", { length: 20 }),
  price_per_hour: integer("price_per_hour"),
  parking: varchar("parking", { length: 50 }),
  rooms_available: integer("rooms_available"),
  valet_available: boolean("valet_available").default(false),
  alcohol_allowed: boolean("alcohol_allowed").default(false),
  sound_limit_db: integer("sound_limit_db"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
};

export const vendorServicesAttribute = {
  id: serial("id").primaryKey(),
  business_id: integer("business_id").notNull().references(() => schema.id),
  artist_type: varchar("artist_type", { length: 100 }),
  styles_specialized: varchar("styles_specialized", { length: 255 }),
  max_bookings_per_day: integer("max_bookings_per_day"),
  advance_amount: integer("advance_amount"),
  uses_own_material: boolean("uses_own_material").default(true),
  travel_charges: integer("travel_charges"),
  portfolio_link: varchar("portfolio_link", { length: 255 }),
  available_for_destination: boolean("available_for_destination").default(false),
  customization_available: boolean("customization_available"),   // jewelry, dress rent, invitations
  serves_veg: boolean("serves_veg"),                            // catering, cake, chaat
  min_order: integer("min_order"),                             // replaces min_plates, min_order_qty
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
};
