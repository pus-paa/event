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
  slug: varchar("slug", { length: 100 }).unique(), // URL-friendly name
  // Visuals - URL
  avatar: text("avatar"),
  cover: text("cover"),
  // Location - full address support
  location: varchar("location", { length: 255 }),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  // Verification
  legal_document: text("legal_document"), // URL to PDF/image
  is_verified: boolean("is_verified").default(false),
  // Relations
  owner_id: integer("owner_id").notNull(), // Reference to users.id
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}
