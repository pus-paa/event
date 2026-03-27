import {
  AddExpenseToCategoryInput,
  AddPaymentToExpenseInput,
  CreateBudgetCategoryInput,
  UpdateExpenseInput,
  UpdatePaymentInput,
} from "./validators";
import EventModel from "../event/model";
import { throwForbiddenError, throwNotFoundError } from "@/utils/error";
import Budget from "./model";
import {
  BudgetCategoryResource,
  ExpenseResource,
  PaymentResource,
} from "./resource";

const withExpenseComputed = async (expenseData: any) => {
  const spend = await Budget.getTotalClearedPayments(expenseData.id);
  const contractAmount = expenseData.contractAmount
    ? Number(expenseData.contractAmount)
    : null;
  const remaining = contractAmount !== null ? contractAmount - spend : null;
  return ExpenseResource.toJson({ ...expenseData, spend, remaining });
};

const createBudgetCategory = async (
  input: CreateBudgetCategoryInput,
  userId: number,
  eventId: number,
) => {
  const isAuthorized = await EventModel.isUserEventAdmin(eventId, userId);
  if (!isAuthorized)
    throwForbiddenError(
      "You do not have permission to create a budget category.",
    );

  const info = await Budget.totalAllocatedAndRemainingBudget(eventId);
  if (input.allocatedBudget > info.remainingBudgetToAllocate)
    throwForbiddenError(
      `Allocated budget exceeds remaining budget. Remaining: ${info.remainingBudgetToAllocate}`,
    );

  const category = await Budget.createBudgetCategory({ ...input, eventId });

  if (!category) throw new Error("Failed to create budget category");
  return BudgetCategoryResource.toJson(category);
};

const getBudgetCategory = async (categoryId: number, userId: number) => {
  const category = await Budget.getBudgetCategoryById(categoryId);
  if (!category) throwNotFoundError("Budget Category");

  const isAuthorized = await EventModel.isUserEventAdmin(
    category?.eventId as number,
    userId,
  );
  if (!isAuthorized)
    throwForbiddenError(
      "You do not have permission to view this budget category.",
    );

  const estimated = await Budget.getTotalEstimatedCostByCategory(categoryId);
  const expenses = await Budget.getAllExpensesByCategory(categoryId);
  const spend = await Promise.all(
    expenses.map((e) => Budget.getTotalClearedPayments(e.id)),
  );
  const totalSpend = spend.reduce((a, s) => a + s, 0);
  const pending = estimated - totalSpend;

  return BudgetCategoryResource.toJson({
    ...category,
    estimatedTotal: estimated,
    spend: totalSpend,
    pending,
    budgetBalance: Number(category!.allocatedBudget) - estimated,
  });
};

const getAllBudgetCategories = async (eventId: number, userId: number) => {
  const isAuthorized = await EventModel.isUserEventAdmin(eventId, userId);
  if (!isAuthorized)
    throwForbiddenError(
      "You do not have permission to view budget categories.",
    );

  const categories = await Budget.getAllBudgetCategories(eventId);

  const result = await Promise.all(
    categories.map(async (cat) => {
      const estimated = await Budget.getTotalEstimatedCostByCategory(cat.id);
      const expenses = await Budget.getAllExpensesByCategory(cat.id);
      const spends = await Promise.all(
        expenses.map((e) => Budget.getTotalClearedPayments(e.id)),
      );
      const totalSpend = spends.reduce((a, s) => a + s, 0);
      const pending = estimated - totalSpend;

      return BudgetCategoryResource.toJson({
        ...cat,
        estimatedTotal: estimated,
        spend: totalSpend,
        pending,
        budgetBalance: Number(cat.allocatedBudget) - estimated,
      });
    }),
  );

  return result;
};

const updateBudgetCategory = async (
  categoryId: number,
  input: Partial<CreateBudgetCategoryInput>,
  userId: number,
) => {
  const category = await Budget.getBudgetCategoryById(categoryId);
  if (!category) throwNotFoundError("Budget Category");

  const isAuthorized = await EventModel.isUserEventAdmin(
    category?.eventId as number,
    userId,
  );
  if (!isAuthorized)
    throwForbiddenError(
      "You do not have permission to update this budget category.",
    );

  if (
    input.allocatedBudget &&
    input.allocatedBudget !== Number(category!.allocatedBudget)
  ) {
    const info = await Budget.totalAllocatedAndRemainingBudget(
      category?.eventId as number,
    );
    const difference =
      input.allocatedBudget - Number(category!.allocatedBudget);
    if (difference > info.remainingBudgetToAllocate)
      throwForbiddenError(
        `New allocated budget exceeds remaining event budget. Remaining: ${info.remainingBudgetToAllocate}`,
      );

    const totalEstimated =
      await Budget.getTotalEstimatedCostByCategory(categoryId);
    if (input.allocatedBudget < totalEstimated)
      throwForbiddenError(
        `Allocated budget cannot be less than total estimated expenses: ${totalEstimated}`,
      );
  }

  const updated = await Budget.updateBudgetCategory(categoryId, input);
  return BudgetCategoryResource.toJson(updated!);
};

const deleteBudgetCategory = async (categoryId: number, userId: number) => {
  const category = await Budget.getBudgetCategoryById(categoryId);
  if (!category) throwNotFoundError("Budget Category");

  const isAuthorized = await EventModel.isUserEventAdmin(
    category?.eventId as number,
    userId,
  );
  if (!isAuthorized)
    throwForbiddenError(
      "You do not have permission to delete this budget category.",
    );

  return await Budget.deleteBudgetCategory(categoryId);
};

const getBudgetSummary = async (eventId: number, userId: number) => {
  const isAuthorized = await EventModel.isUserEventAdmin(eventId, userId);
  if (!isAuthorized)
    throwForbiddenError(
      "You do not have permission to view this event's budget.",
    );

  const categories = await Budget.getBudgetSummary(eventId);

  const budgetInfo = await Budget.totalAllocatedAndRemainingBudget(eventId);

  let totalEstimated = 0;
  let totalSpent = 0;
  let totalPending = 0;

  categories.forEach((cat: any) => {
    totalEstimated += cat.estimated;
    totalSpent += cat.spend;
    totalPending += cat.estimated - cat.spend;
  });

  return {
    summary: {
      totalEstimated,
      totalSpent,
      totalPending,
      totalBudget:
        budgetInfo.remainingBudgetToAllocate + budgetInfo.totalAllocated,
      totalAllocated: budgetInfo.totalAllocated,
      totalRemaining: budgetInfo.remainingBudgetToAllocate,
    },
    categories,
  };
};

const addExpenseToCategory = async (
  input: AddExpenseToCategoryInput,
  userId: number,
  categoryId: number,
) => {
  const category = await Budget.getBudgetCategoryById(categoryId);
  if (!category) throwNotFoundError("Budget Category");

  const isAuthorized = await EventModel.isUserEventAdmin(
    category?.eventId as number,
    userId,
  );
  if (!isAuthorized)
    throwForbiddenError(
      "You do not have permission to add an expense to this category.",
    );

  const totalEstimated =
    await Budget.getTotalEstimatedCostByCategory(categoryId);
  const willExceedBudget =
    totalEstimated + input.estimatedCost > Number(category!.allocatedBudget);

  const newExpense = await Budget.createExpense({ ...input, categoryId });

  return {
    expense: ExpenseResource.toJson({
      ...newExpense,
      spend: 0,
    }),
    warning: willExceedBudget
      ? `This expense pushes the category over its allocated budget of ${category!.allocatedBudget}`
      : null,
  };
};

const getExpense = async (expenseId: number, userId: number) => {
  const expenseData = await Budget.getExpenseById(expenseId);
  if (!expenseData) throwNotFoundError("Expense");

  const category = await Budget.getBudgetCategoryById(
    expenseData?.categoryId as number,
  );
  const isAuthorized = await EventModel.isUserEventAdmin(
    category?.eventId as number,
    userId,
  );
  if (!isAuthorized)
    throwForbiddenError("You do not have permission to view this expense.");

  return await withExpenseComputed(expenseData);
};

const getAllExpensesByCategory = async (categoryId: number, userId: number) => {
  const category = await Budget.getBudgetCategoryById(categoryId);
  if (!category) throwNotFoundError("Budget Category");

  const isAuthorized = await EventModel.isUserEventAdmin(
    category?.eventId as number,
    userId,
  );
  if (!isAuthorized)
    throwForbiddenError(
      "You do not have permission to view expenses for this category.",
    );

  const expenses = await Budget.getAllExpensesByCategory(categoryId);
  return Promise.all(expenses.map(withExpenseComputed));
};

const updateExpense = async (
  expenseId: number,
  input: UpdateExpenseInput,
  userId: number,
) => {
  const expenseData = await Budget.getExpenseById(expenseId);
  if (!expenseData) throwNotFoundError("Expense");

  const category = await Budget.getBudgetCategoryById(
    expenseData?.categoryId as number,
  );
  const isAuthorized = await EventModel.isUserEventAdmin(
    category?.eventId as number,
    userId,
  );
  if (!isAuthorized)
    throwForbiddenError("You do not have permission to update this expense.");

  if (input.contractAmount) {
    const totalScheduled = await Budget.getTotalScheduledPayments(expenseId);
    if (input.contractAmount < totalScheduled)
      throwForbiddenError(
        `Contract amount cannot be less than total scheduled payments: ${totalScheduled}`,
      );
  }

  const updated = await Budget.updateExpense(expenseId, input);
  return await withExpenseComputed(updated);
};

const deleteExpense = async (expenseId: number, userId: number) => {
  const expenseData = await Budget.getExpenseById(expenseId);
  if (!expenseData) throwNotFoundError("Expense");

  const category = await Budget.getBudgetCategoryById(
    expenseData?.categoryId as number,
  );
  const isAuthorized = await EventModel.isUserEventAdmin(
    category?.eventId as number,
    userId,
  );
  if (!isAuthorized)
    throwForbiddenError("You do not have permission to delete this expense.");

  return await Budget.deleteExpense(expenseId);
};

const addPaymentToExpense = async (
  input: AddPaymentToExpenseInput,
  userId: number,
  expenseId: number,
) => {
  const expenseData = await Budget.getExpenseById(expenseId);
  if (!expenseData) throwNotFoundError("Expense");

  const category = await Budget.getBudgetCategoryById(
    expenseData?.categoryId as number,
  );
  const isAuthorized = await EventModel.isUserEventAdmin(
    category?.eventId as number,
    userId,
  );
  if (!isAuthorized)
    throwForbiddenError(
      "You do not have permission to add a payment to this expense.",
    );

  if (!expenseData!.contractAmount)
    throwForbiddenError(
      "Set a contract amount on the expense before adding payments.",
    );

  const totalScheduled = await Budget.getTotalScheduledPayments(expenseId);
  if (totalScheduled + input.amount > Number(expenseData!.contractAmount))
    throwForbiddenError(
      `Total payments would exceed contract amount of ${expenseData!.contractAmount}`,
    );

  if (input.status === "cleared" && input.paidOn > new Date())
    throwForbiddenError("A cleared payment cannot have a future date.");

  const newPayment = await Budget.createPayment({ ...input, expenseId });

  if (!newPayment) throw new Error("Failed to create payment");
  return PaymentResource.toJson(newPayment);
};

const getPayment = async (paymentId: number, userId: number) => {
  const paymentData = await Budget.getPaymentById(paymentId);
  if (!paymentData) throwNotFoundError("Payment");

  const expenseData = await Budget.getExpenseById(paymentData!.expenseId);
  const category = await Budget.getBudgetCategoryById(
    expenseData?.categoryId as number,
  );
  const isAuthorized = await EventModel.isUserEventAdmin(
    category?.eventId as number,
    userId,
  );
  if (!isAuthorized)
    throwForbiddenError("You do not have permission to view this payment.");

  return PaymentResource.toJson(paymentData!);
};

const getAllPaymentsByExpense = async (expenseId: number, userId: number) => {
  const expenseData = await Budget.getExpenseById(expenseId);
  if (!expenseData) throwNotFoundError("Expense");

  const category = await Budget.getBudgetCategoryById(
    expenseData?.categoryId as number,
  );
  const isAuthorized = await EventModel.isUserEventAdmin(
    category?.eventId as number,
    userId,
  );
  if (!isAuthorized)
    throwForbiddenError(
      "You do not have permission to view payments for this expense.",
    );

  const payments = await Budget.getAllPaymentsByExpense(expenseId);
  return PaymentResource.collection(payments);
};

const updatePayment = async (
  paymentId: number,
  input: UpdatePaymentInput,
  userId: number,
) => {
  const paymentData = await Budget.getPaymentById(paymentId);
  if (!paymentData) throwNotFoundError("Payment");

  const expenseData = await Budget.getExpenseById(paymentData!.expenseId);
  const category = await Budget.getBudgetCategoryById(
    expenseData?.categoryId as number,
  );
  const isAuthorized = await EventModel.isUserEventAdmin(
    category?.eventId as number,
    userId,
  );
  if (!isAuthorized)
    throwForbiddenError("You do not have permission to update this payment.");

  if (input.amount) {
    const totalScheduled = await Budget.getTotalScheduledPayments(
      paymentData!.expenseId,
    );
    const newTotal =
      totalScheduled - Number(paymentData!.amount) + input.amount;
    if (newTotal > Number(expenseData!.contractAmount))
      throwForbiddenError(
        `Updated amount would push total payments over contract amount of ${expenseData!.contractAmount}`,
      );
  }

  if (input.status === "cleared") {
    const dateToCheck = input.paidOn ?? new Date(paymentData!.paidOn);
    if (dateToCheck > new Date())
      throwForbiddenError("A cleared payment cannot have a future date.");
  }

  const updated = await Budget.updatePayment(paymentId, input);
  return PaymentResource.toJson(updated!);
};

const deletePayment = async (paymentId: number, userId: number) => {
  const paymentData = await Budget.getPaymentById(paymentId);
  if (!paymentData) throwNotFoundError("Payment");

  const expenseData = await Budget.getExpenseById(paymentData!.expenseId);
  const category = await Budget.getBudgetCategoryById(
    expenseData?.categoryId as number,
  );
  const isAuthorized = await EventModel.isUserEventAdmin(
    category?.eventId as number,
    userId,
  );
  if (!isAuthorized)
    throwForbiddenError("You do not have permission to delete this payment.");

  return await Budget.deletePayment(paymentId);
};

export default {
  createBudgetCategory,
  getBudgetCategory,
  getAllBudgetCategories,
  updateBudgetCategory,
  deleteBudgetCategory,
  getBudgetSummary,
  addExpenseToCategory,
  getExpense,
  getAllExpensesByCategory,
  updateExpense,
  deleteExpense,
  addPaymentToExpense,
  getPayment,
  getAllPaymentsByExpense,
  updatePayment,
  deletePayment,
};
