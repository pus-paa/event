import { timestamp, integer, pgTable, serial, unique } from "drizzle-orm/pg-core";
import {
	giftCategoryTableName,
	giftTableName,
	giftCategoryattributes,
	giftsAttributes,
} from "./attributes";
import invitation from "@/modules/invitation/schema";
import user from "@/modules/user/schema";

const giftCategory = pgTable(giftCategoryTableName, giftCategoryattributes);
const gift = pgTable(giftTableName, giftsAttributes);
const giftAssignmentTable = pgTable(
  "gift_assignment",
  {
    id: serial("id").notNull().primaryKey(),
    invitationId: integer("invitation_id")
      .references(() => invitation.id, { onDelete: "cascade" })
      .notNull(),
    totalCount: integer("total_count").notNull(),
    giftId: integer("gift_id")
      .references(() => gift.id, { onDelete: "cascade" })
      .notNull(),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow(),
    assignedBy: integer("assigned_by").references(() => user.id, { onDelete: "set null" }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    unique("invitation_gift_unique").on(table.invitationId, table.giftId),
  ]
)
;

export { giftCategory, gift, giftAssignmentTable };
export default giftCategory;
