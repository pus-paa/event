import {
  serial,
  integer,
  timestamp,
  boolean,
  varchar,
} from "drizzle-orm/pg-core";

import event from "@/modules/event/schema";
import user from "@/modules/user/schema";
import family from "@/modules/family/schema";

const tableName = "invitation";
const attributes = {
  id: serial("id"),
  invitation_name: varchar("invitation_name", { length: 50 })
    .notNull()
    .default("Family name"),
  status: varchar("status", { length: 10 }), // accepted, declined, pending
  notes: varchar("notes", { length: 150 }),
  role: varchar("role", { length: 16 }).notNull().default("Guest"), // Guest , Singer and maybe more role in the future
  category: varchar("category", { length: 10 }).notNull(), //  friend  , colleague , VVIP, family
  eventId: integer("event_id")
    .notNull()
    .references(() => event.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => user.id, { onDelete: "cascade" }),
  familyId: integer("family_id").references(() => family.id, {
    onDelete: "cascade",
  }),
  invited_by: integer("invited_by")
    .notNull()
    .references(() => user.id, { onDelete: "no action" }), // TODO: busiiness logic to discuss
  responded_by: integer("responded_by").references(() => user.id, {
    onDelete: "cascade",
  }),
  isArrivalPickupRequired: boolean("is_arrival_pickup_required").default(false),
  isDeparturePickupRequired: boolean("is_departure_pickup_required").default(
    false,
  ),
  isAccomodation: boolean("is_accomodation"),
  joined_at: timestamp("joined_at", { withTimezone: true }).defaultNow(),
  responded_at: timestamp("responded_at", { withTimezone: true }),
  arrival_date_time: timestamp("arrival_date_time", { withTimezone: true }),
  departure_date_time: timestamp("departure_date_time", { withTimezone: true }),
  assigned_room: varchar("assigned_room", { length: 150 }),
  arrival_info: varchar("arrival_info", { length: 200 }),
  departure_info: varchar("departure_info", { length: 200 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
};

export { tableName, attributes };
