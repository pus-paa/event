import { z } from "zod";

const createBudgetCategorySchema = z.object({
  params: z.object({
    eventId: z.coerce.number().positive(),
  }),
  body: z.object({
    name: z.string().max(255),
    subEventId: z.number().optional(),
    allocatedBudget: z.number().positive(),
  }),
});

const updateBudgetCategorySchema = z.object({
  params: z.object({
    categoryId: z.coerce.number().positive(),
  }),
  body: z.object({
    name: z.string().max(255).optional(),
    allocatedBudget: z.number().positive().optional(),
  }),
});

const addExpenseToCategorySchema = z.object({
  params: z.object({
    categoryId: z.coerce.number().positive(),
  }),
  body: z.object({
    name: z.string().max(255),
    allocatedAmount: z.number().positive(),
    nextDueDate: z.coerce.date().optional(),
    notes: z.string().max(999).optional(),
    businessId: z.coerce.number().positive().optional(),
  }),
});

const updateExpenseSchema = z.object({
  params: z.object({
    expenseId: z.coerce.number().positive(),
  }),
  body: z.object({
    name: z.string().max(255).optional(),
    allocatedAmount: z.number().positive().optional(),
    nextDueDate: z.coerce.date().optional(),
    notes: z.string().max(999).optional(),
    businessId: z.coerce.number().positive().optional(),
  }),
});

const addPaymentToExpenseSchema = z.object({
  params: z.object({
    expenseId: z.coerce.number().positive(),
  }),
  body: z.object({
    name: z.string().max(255),
    amount: z.number().positive(),
    paidOn: z.coerce.date(),
    mode: z.enum(["cash", "bank_transfer", "credit_card", "upi", "cheque"]),
    status: z.enum(["cleared", "pending", "cancelled"]).default("pending"),
    notes: z.string().max(999).optional(),
  }),
});

const updatePaymentSchema = z.object({
  params: z.object({
    paymentId: z.coerce.number().positive(),
  }),
  body: z.object({
    name: z.string().max(255).optional(),
    amount: z.number().positive().optional(),
    paidOn: z.coerce.date().optional(),
    mode: z
      .enum(["cash", "bank_transfer", "credit_card", "upi", "cheque"])
      .optional(),
    status: z.enum(["cleared", "pending", "cancelled"]).optional(),
    notes: z.string().max(999).optional(),
  }),
});

type CreateBudgetCategoryInput = z.infer<
  typeof createBudgetCategorySchema
>["body"];
type AddExpenseToCategoryInput = z.infer<
  typeof addExpenseToCategorySchema
>["body"];
type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>["body"];
type AddPaymentToExpenseInput = z.infer<
  typeof addPaymentToExpenseSchema
>["body"];
type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>["body"];

export {
  createBudgetCategorySchema,
  updateBudgetCategorySchema,
  addExpenseToCategorySchema,
  updateExpenseSchema,
  addPaymentToExpenseSchema,
  updatePaymentSchema,
  type CreateBudgetCategoryInput,
  type AddExpenseToCategoryInput,
  type UpdateExpenseInput,
  type AddPaymentToExpenseInput,
  type UpdatePaymentInput,
};
