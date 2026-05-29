import { integer,timestamp,  serial, varchar } from "drizzle-orm/pg-core";
import {event , buisness} from "@/config/db/schema"
const attributes = {
    id: serial("id").notNull().primaryKey(),
    name:varchar("name", { length: 255 }).notNull(),
    capacity:integer("capacity").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    eventId: integer("event_id").references(() => event.id, { onDelete: "cascade" }).notNull(),
    vendorId: integer("vendor_id").references(() => buisness.id, { onDelete: "set null" }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()),
}