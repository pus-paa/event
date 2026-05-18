import { budgetCategory, expense, payment } from "./schema";

const budgetCategorySelectQuery = {
  id: budgetCategory.id,
  name: budgetCategory.name,
  eventId: budgetCategory.eventId,
  allocatedBudget: budgetCategory.allocatedBudget,
  createdAt: budgetCategory.createdAt,
  updatedAt: budgetCategory.updatedAt,
};

const expenseSelectQuery = {
  id: expense.id,
  categoryId: expense.categoryId,
  subEventid: expense.subEventid,
  name: expense.name,
  businessId: expense.businessId,
  allocatedAmount: expense.allocatedAmount,
  nextDueDate: expense.nextDueDate,
  notes: expense.notes,
  createdAt: expense.createdAt,
  updatedAt: expense.updatedAt,
};

const paymentSelectQuery = {
  id: payment.id,
  expenseId: payment.expenseId,
  name: payment.name,
  amount: payment.amount,
  paidOn: payment.paidOn,
  mode: payment.mode,
  status: payment.status,
  notes: payment.notes,
  createdAt: payment.createdAt,
  updatedAt: payment.updatedAt,
};

const expenseWithCategorySelectQuery = {
  categoryId: budgetCategory.id,
  categoryName: budgetCategory.name,
  eventId: budgetCategory.eventId,
  allocatedBudget: budgetCategory.allocatedBudget,
  categoryCreatedAt: budgetCategory.createdAt,
  categoryUpdatedAt: budgetCategory.updatedAt,
  expenseId: expense.id,
  subEventid: expense.subEventid,
  expenseName: expense.name,
  businessId: expense.businessId,
  allocatedAmount: expense.allocatedAmount,
  nextDueDate: expense.nextDueDate,
  expenseNotes: expense.notes,
  expenseCreatedAt: expense.createdAt,
  expenseUpdatedAt: expense.updatedAt,
};

export default {
  budgetCategorySelectQuery,
  expenseSelectQuery,
  paymentSelectQuery,
  expenseWithCategorySelectQuery,
};
