import { serial, json, timestamp, varchar } from "drizzle-orm/pg-core";
const tableName = "admins";
const attributes = {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull().unique(),
  password: varchar("password", { length: 20 }).notNull(),
  info: json("info"),
  // modules:,
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
};

export { tableName, attributes };
