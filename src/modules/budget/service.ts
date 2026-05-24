import {
  AddExpenseToCategoryInput,
  AddPaymentToExpenseInput,
  CreateBudgetCategoryInput,
  UpdateExpenseInput,
  UpdatePaymentInput,
} from "./validators";
import EventService from "@/modules/event/service"
import { throwForbiddenError, throwNotFoundError } from "@/utils/error";
import Budget from "./model";
import {
  BudgetCategoryResource,
  ExpenseResource,
  PaymentResource,
} from "./resource";

const withExpenseComputed = async (expenseData: any) => {
  const spent = await Budget.getTotalClearedPayments(expenseData.id);
  const allocated = Number(expenseData.allocatedAmount);
  const balance = allocated - spent;
  return ExpenseResource.toJson({ ...expenseData, spent, balance });
};

const createBudgetCategory = async (
  input: CreateBudgetCategoryInput,
  userId: number,
  eventId: number,
) => {
  const isAuthorized = await EventService.checkAuthorized(eventId, userId);
  let budgeteventId: number = eventId;
  if (!isAuthorized)
    throwForbiddenError(
      "You do not have permission to create a budget category.",
    );
  //CHeck if there is the sub event then this operaion will be done to that sub event id 

  const info = await Budget.totalAllocatedAndRemainingBudget(budgeteventId);
  if (input.allocatedBudget > info.remainingBudgetToAllocate)
    throwForbiddenError(
      `Allocated budget exceeds remaining budget. Remaining: ${info.remainingBudgetToAllocate}`,
    );
  //EventId will be overridden by the sub event id 
  const category = await Budget.createBudgetCategory({ ...input, eventId: budgeteventId });

  if (!category) throw new Error("Failed to create budget category");
  return BudgetCategoryResource.toJson(category);
};

const getBudgetCategory = async (categoryId: number, userId: number) => {
  const category = await Budget.getBudgetCategoryById(categoryId);
  if (!category) throwNotFoundError("Budget Category");

  const isAuthorized = await EventService.checkAuthorized(
    category?.eventId as number,
    userId,
  );
  if (!isAuthorized)
    throwForbiddenError(
      "You do not have permission to view this budget category.",
    );

  const allocated = await Budget.getTotalAllocatedAmountByCategory(categoryId);
  const expenses = await Budget.getAllExpensesByCategory(categoryId);
  const spent = await Promise.all(
    expenses.map((e) => Budget.getTotalClearedPayments(e.id)),
  );
  const totalSpent = spent.reduce((a, s) => a + s, 0);
  const pending = allocated - totalSpent;
  const remaining = Number(category?.allocatedBudget) - allocated;

  return BudgetCategoryResource.toJson({
    ...category,
    allocated,
    spent: totalSpent,
    pending,
    remaining,
  });
};

const getAllBudgetCategories = async (eventId: number, userId: number) => {
  const isAuthorized = await EventService.checkAuthorized(eventId, userId);
  if (!isAuthorized)
    throwForbiddenError(
      "You do not have permission to view budget categories.",
    );

  const categories = await Budget.getAllBudgetCategories(eventId);

  const result = await Promise.all(
    categories.map(async (cat) => {
      const allocated = await Budget.getTotalAllocatedAmountByCategory(cat.id);
      const expenses = await Budget.getAllExpensesByCategory(cat.id);
      const spends = await Promise.all(
        expenses.map((e) => Budget.getTotalClearedPayments(e.id)),
      );
      const totalSpent = spends.reduce((a, s) => a + s, 0);
      const remaining = allocated - totalSpent;

      return BudgetCategoryResource.toJson({
        ...cat,
        allocated,
        spent: totalSpent,
        pending: 0,
        remaining,
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

  const isAuthorized = await EventService.checkAuthorized(
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

    const totalAllocated =
      await Budget.getTotalAllocatedAmountByCategory(categoryId);
    if (input.allocatedBudget < totalAllocated)
      throwForbiddenError(
        `Allocated budget cannot be less than total allocated expenses: ${totalAllocated}`,
      );
  }

  const updated = await Budget.updateBudgetCategory(categoryId, input);
  return BudgetCategoryResource.toJson(updated!);
};

const deleteBudgetCategory = async (categoryId: number, userId: number) => {
  const category = await Budget.getBudgetCategoryById(categoryId);
  if (!category) throwNotFoundError("Budget Category");

  const isAuthorized = await EventService.checkAuthorized(
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
  const isAuthorized = await EventService.checkAuthorized(eventId, userId);
  if (!isAuthorized)
    throwForbiddenError(
      "You do not have permission to view this event's budget.",
    );

  const categories = await Budget.getBudgetSummary(eventId);

  const budgetInfo = await Budget.totalAllocatedAndRemainingBudget(eventId);

  let totalAllocated = 0;
  let totalSpent = 0;

  categories.forEach((cat: any) => {
    totalAllocated += cat.allocated;
    totalSpent += cat.spent;
  });

  return {
    summary: {
      allocated: totalAllocated,
      totalSpend: totalSpent,
      totalBudget:
        budgetInfo.remainingBudgetToAllocate + budgetInfo.totalAllocated,
      totalAllocated: budgetInfo.totalAllocated,
      remaining: budgetInfo.remainingBudgetToAllocate,
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

  const isAuthorized = await EventService.checkAuthorized(
    category?.eventId as number,
    userId,
  );
  if (!isAuthorized)
    throwForbiddenError(
      "You do not have permission to add an expense to this category.",
    );

  const totalAllocated =
    await Budget.getTotalAllocatedAmountByCategory(categoryId);
  const willExceedBudget =
    totalAllocated + input.allocatedAmount > Number(category!.allocatedBudget);

  const newExpense = await Budget.createExpense({ ...input, categoryId });

  return {
    expense: ExpenseResource.toJson({
      ...newExpense,
      spent: 0,
      balance: Number(newExpense?.allocatedAmount),
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
  const isAuthorized = await EventService.checkAuthorized(
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

  const isAuthorized = await EventService.checkAuthorized(
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
  if (expenseData?.cateringId) {
    //update input.expenseData has

  }

  if (!expenseData) throwNotFoundError("Expense");

  const category = await Budget.getBudgetCategoryById(
    expenseData?.categoryId as number,
  );
  const isAuthorized = await EventService.checkAuthorized(
    category?.eventId as number,
    userId,
  );
  if (!isAuthorized)
    throwForbiddenError("You do not have permission to update this expense.");

  const updated = await Budget.updateExpense(expenseId, input);
  return await withExpenseComputed(updated);
};

const deleteExpense = async (expenseId: number, userId: number) => {
  const expenseData = await Budget.getExpenseById(expenseId);
  if (!expenseData) throwNotFoundError("Expense");

  const category = await Budget.getBudgetCategoryById(
    expenseData?.categoryId as number,
  );
  const isAuthorized = await EventService.checkAuthorized(
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
  const isAuthorized = await EventService.checkAuthorized(
    category?.eventId as number,
    userId,
  );
  if (!isAuthorized)
    throwForbiddenError(
      "You do not have permission to add a payment to this expense.",
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
  const isAuthorized = await EventService.checkAuthorized(
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
  const isAuthorized = await EventService.checkAuthorized(
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
  const isAuthorized = await EventService.checkAuthorized(
    category?.eventId as number,
    userId,
  );
  if (!isAuthorized)
    throwForbiddenError("You do not have permission to update this payment.");

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
  const isAuthorized = await EventService.checkAuthorized(
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
