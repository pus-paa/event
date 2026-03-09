import { serial, text, integer , timestamp, boolean } from "drizzle-orm/pg-core";

import event from "@/modules/event/schema"
import user from "@/modules/user/schema";
import family from "@/modules/family/schema"

const tableName = "invitation";
const attributes = {
  id: serial("id"),
  invitation_name: text("invitation_name").notNull(),
  status: text("status"), // accepted, declined, pending
  notes: text("notes"),
  role: text("role"), // Guest , Singer and maybe more role in the future 
  category: text("category"), //  friend  , colleague , VVIP, family  
  eventId: integer("event_id").notNull().references(() => event.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => user.id, { onDelete: "cascade" }),
  familyId: integer("family_id").references(() => family.id, { onDelete: "cascade" }),
  invited_by: integer("invited_by").notNull().references(() => user.id, { onDelete: "no action" }), // TODO: busiiness logic to discuss
  responded_by: integer("responded_by"),
  isAccomodation: boolean("is_accomodation"),
  joined_at: text("joined_at"),
  respondedAt: text("respondedAt"),
  arrival_date_time: timestamp("arrival_date_time"),
  departure_date_time: timestamp("departure_date_time"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
};

export { tableName, attributes }; 
