import { budget_category, expense, payment } from "./schema";

const budgetCategorySelectQuery = {
  id: budget_category.id,
  name: budget_category.name,
  eventId: budget_category.eventId,
  allocatedBudget: budget_category.allocatedBudget,
  createdAt: budget_category.createdAt,
  updatedAt: budget_category.updatedAt,
};

const expenseSelectQuery = {
  id: expense.id,
  categoryId: expense.categoryId,
  name: expense.name,
  businessId: expense.businessId,
  estimatedCost: expense.estimatedCost,
  contractAmount: expense.contractAmount,
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
  categoryId: budget_category.id,
  categoryName: budget_category.name,
  eventId: budget_category.eventId,
  allocatedBudget: budget_category.allocatedBudget,
  categoryCreatedAt: budget_category.createdAt,
  categoryUpdatedAt: budget_category.updatedAt,

  expenseId: expense.id,
  expenseName: expense.name,
  businessId: expense.businessId,
  estimatedCost: expense.estimatedCost,
  contractAmount: expense.contractAmount,
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
