import user from "@/modules/user/schema";
import { integer, serial, varchar, timestamp } from "drizzle-orm/pg-core";

const tableName = "families";
const attributes = {
  id: serial("id").primaryKey(),
  familyName: varchar("family_name", { length: 120 }).notNull(),
  createdBy: integer("created_by")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
};

export { tableName, attributes };
