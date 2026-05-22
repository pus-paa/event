import { buisness, event } from "@/config/db/schema";
import catering from "@/modules/catering/schema"
import {
  integer,
  serial,
  varchar,
  timestamp,
  numeric,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";
import { budgetCategory, expense } from "./schema";

export const paymentModeEnum = pgEnum("payment_mode", [
  "cash",
  "bank_transfer",
  "credit_card",
  "upi",
  "cheque",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "cleared",
  "pending",
  "cancelled",
]);

const budgetCategoryTableName = "budget_category";
const expenseTableName = "expense";
const paymentTableName = "payment";

const budgetCateogryAttributes = {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  eventId: integer("event_id")
    .notNull()
    .references(() => event.id, { onDelete: "cascade" }),
  allocatedBudget: numeric("allocated_budget", {
    precision: 15,
    scale: 2,
  }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
};

const expenseAttributes = {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => budgetCategory.id, { onDelete: "cascade" }),
  subEventid: integer("sub_event_id").references(() => event.id),
  cateringId: integer('catering_id').references(() => catering.id),
  name: varchar("name", { length: 255 }).notNull(),
  businessId: integer("vendor_id").references(() => buisness.id),
  allocatedAmount: numeric("allocated_amount", {
    precision: 15,
    scale: 2,
  }).notNull(),
  nextDueDate: date("next_due_date"),
  notes: varchar("notes", { length: 999 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
};

const paymentAttributes = {
  id: serial("id").primaryKey(),
  expenseId: integer("expense_id")
    .notNull()
    .references(() => expense.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  paidOn: date("paid_on").notNull(),
  mode: paymentModeEnum("mode").notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  notes: varchar("notes", { length: 999 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
};

export {
  budgetCategoryTableName,
  budgetCateogryAttributes,
  expenseTableName,
  paymentTableName,
  expenseAttributes,
  paymentAttributes,
};
