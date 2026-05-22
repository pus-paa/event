import { integer, pgTable, serial, timestamp, unique } from "drizzle-orm/pg-core";
import businessSchema from "@/modules/businesses/schema";
import userSchema from "@/modules/user/schema";

const favouritesTable = pgTable(
  "favourites",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => userSchema.id, { onDelete: "cascade" }),
    businessId: integer("business_id")
      .notNull()
      .references(() => businessSchema.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [unique("unique_user_business").on(table.userId, table.businessId)],
);

export default favouritesTable;
