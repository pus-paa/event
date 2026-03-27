import { eq, sum } from "drizzle-orm";
import { budget_category, expense, payment } from "./schema";
import event from "../event/schema";
import db from "@/config/db";
import {
  AddExpenseToCategoryInput,
  AddPaymentToExpenseInput,
  CreateBudgetCategoryInput,
  UpdateExpenseInput,
  UpdatePaymentInput,
} from "./validators";
import Repository from "./repository";

class Budget {
  static async totalAllocatedAndRemainingBudget(eventId: number) {
    const result = await db
      .select(Repository.budgetCategorySelectQuery)
      .from(budget_category)
      .where(eq(budget_category.eventId, eventId));

    const totalAllocated = result.reduce(
      (total, category) => total + Number(category.allocatedBudget),
      0,
    );

    const totalBudget = await db
      .select({ budget: event.budget })
      .from(event)
      .where(eq(event.id, eventId));

    const remainingBudgetToAllocate =
      (totalBudget[0]?.budget ?? 0) - totalAllocated;

    return { totalAllocated, remainingBudgetToAllocate };
  }

  static async createBudgetCategory(
    params: CreateBudgetCategoryInput & { eventId: number },
  ) {
    const result = await db
      .insert(budget_category)
      .values({ ...params, allocatedBudget: params.allocatedBudget.toString() })
      .returning();
    return result[0];
  }

  static async getBudgetCategoryById(categoryId: number) {
    const rows = await db
      .select(Repository.expenseWithCategorySelectQuery)
      .from(budget_category)
      .leftJoin(expense, eq(expense.categoryId, budget_category.id))
      .where(eq(budget_category.id, categoryId));

    if (rows.length === 0) return null;

    const category = {
      id: rows[0]?.categoryId,
      name: rows[0]?.categoryName,
      eventId: rows[0]?.eventId,
      allocatedBudget: Number(rows[0]?.allocatedBudget),
      createdAt: rows[0]?.categoryCreatedAt,
      updatedAt: rows[0]?.categoryUpdatedAt,
      expenses: [] as any[],
    };

    const expenseMap = new Map<number, any>();

    for (const row of rows) {
      if (row.expenseId) {
        if (!expenseMap.has(row.expenseId)) {
          const expenseObj = {
            id: row.expenseId,
            categoryId: row.categoryId,
            name: row.expenseName,
            businessId: row.businessId,
            estimatedCost: Number(row.estimatedCost),
            contractAmount: row.contractAmount
              ? Number(row.contractAmount)
              : null,
            nextDueDate: row.nextDueDate,
            notes: row.expenseNotes,
            createdAt: row.expenseCreatedAt,
            updatedAt: row.expenseUpdatedAt,
          };

          expenseMap.set(row.expenseId, expenseObj);
          category.expenses.push(expenseObj);
        }
      }
    }

    return category;
  }

  static async getAllBudgetCategories(eventId: number) {
    const result = await db
      .select(Repository.budgetCategorySelectQuery)
      .from(budget_category)
      .where(eq(budget_category.eventId, eventId));
    return result;
  }

  static async updateBudgetCategory(
    categoryId: number,
    params: Partial<CreateBudgetCategoryInput>,
  ) {
    const updateData: any = {};
    if (params.name) updateData.name = params.name;
    if (params.allocatedBudget)
      updateData.allocatedBudget = params.allocatedBudget.toString();

    const result = await db
      .update(budget_category)
      .set(updateData)
      .where(eq(budget_category.id, categoryId))
      .returning();
    return result[0] || null;
  }

  static async deleteBudgetCategory(categoryId: number) {
    const result = await db
      .delete(budget_category)
      .where(eq(budget_category.id, categoryId))
      .returning();
    return result[0] || null;
  }

  static async createExpense(
    params: AddExpenseToCategoryInput & { categoryId: number },
  ) {
    const result = await db
      .insert(expense)
      .values({
        categoryId: params.categoryId,
        name: params.name,
        estimatedCost: params.estimatedCost.toString(),
        contractAmount: params.contractAmount?.toString() ?? null,
        nextDueDate: params.nextDueDate?.toISOString().split("T")[0] ?? null,
        notes: params.notes ?? null,
        businessId: params.businessId ?? null,
      })
      .returning();
    return result[0];
  }

  static async getExpenseById(expenseId: number) {
    const rows = await db
      .select()
      .from(expense)
      .leftJoin(payment, eq(payment.expenseId, expense.id))
      .where(eq(expense.id, expenseId));

    console.log(rows);

    if (rows.length === 0) return null;

    const expenseData = {
      id: rows[0]?.expense.id,
      categoryId: rows[0]?.expense.categoryId,
      name: rows[0]?.expense.name,
      businessId: rows[0]?.expense.businessId,
      estimatedCost: Number(rows[0]?.expense.estimatedCost),
      contractAmount: Number(rows[0]?.expense.contractAmount),
      nextDueDate: rows[0]?.expense.nextDueDate,
      notes: rows[0]?.expense.notes,
      createdAt: rows[0]?.expense.createdAt,
      updatedAt: rows[0]?.expense.updatedAt,
      payments: [] as any[],
    };

    const paymentMap = new Map<number, any>();

    for (const row of rows) {
      if (row.payment?.id) {
        if (!paymentMap.has(row.payment.id)) {
          const paymentObj = {
            id: row.payment.id,
            expenseId: row.payment.expenseId,
            name: row.payment.name,
            amount: Number(row.payment.amount),
            paidOn: row.payment.paidOn,
            mode: row.payment.mode,
            status: row.payment.status,
            notes: row.payment.notes,
            createdAt: row.payment.createdAt,
            updatedAt: row.payment.updatedAt,
          };

          paymentMap.set(row.payment.id, paymentObj);
          expenseData.payments.push(paymentObj);
        }
      }
    }

    console.log(expenseData);

    return expenseData;
  }

  static async getAllExpensesByCategory(categoryId: number) {
    const result = await db
      .select(Repository.expenseSelectQuery)
      .from(expense)
      .where(eq(expense.categoryId, categoryId));
    return result;
  }

  static async updateExpense(expenseId: number, params: UpdateExpenseInput) {
    const updateData: any = {};
    if (params.name) updateData.name = params.name;
    if (params.estimatedCost)
      updateData.estimatedCost = params.estimatedCost.toString();
    if (params.contractAmount)
      updateData.contractAmount = params.contractAmount.toString();
    if (params.nextDueDate)
      updateData.nextDueDate = params.nextDueDate.toISOString().split("T")[0];
    if (params.notes !== undefined) updateData.notes = params.notes;
    if (params.businessId !== undefined)
      updateData.businessId = params.businessId;

    const result = await db
      .update(expense)
      .set(updateData)
      .where(eq(expense.id, expenseId))
      .returning();
    return result[0] || null;
  }

  static async deleteExpense(expenseId: number) {
    const result = await db
      .delete(expense)
      .where(eq(expense.id, expenseId))
      .returning();
    return result[0] || null;
  }

  static async getTotalClearedPayments(expenseId: number): Promise<number> {
    const result = await db
      .select({ total: sum(payment.amount) })
      .from(payment)
      .where(eq(payment.expenseId, expenseId));
    return Number(result[0]?.total ?? 0);
  }

  static async getTotalEstimatedCostByCategory(
    categoryId: number,
  ): Promise<number> {
    const result = await db
      .select({ total: sum(expense.estimatedCost) })
      .from(expense)
      .where(eq(expense.categoryId, categoryId));
    return Number(result[0]?.total ?? 0);
  }

  static async getTotalScheduledPayments(expenseId: number): Promise<number> {
    const result = await db
      .select({ total: sum(payment.amount) })
      .from(payment)
      .where(eq(payment.expenseId, expenseId));
    return Number(result[0]?.total ?? 0);
  }

  static async createPayment(
    params: AddPaymentToExpenseInput & { expenseId: number },
  ) {
    const paymentData: Record<string, any> = {
      expenseId: params.expenseId,
      name: params.name,
      amount: params.amount.toString(),
      paidOn: params.paidOn.toISOString().split("T")[0],
      mode: params.mode,
    };

    if (params.status !== undefined) {
      paymentData.status = params.status;
    }
    if (params.notes !== undefined) {
      paymentData.notes = params.notes;
    }

    const result = await db
      .insert(payment)
      .values(paymentData as any)
      .returning();
    return result[0];
  }

  static async getPaymentById(paymentId: number) {
    const result = await db
      .select(Repository.paymentSelectQuery)
      .from(payment)
      .where(eq(payment.id, paymentId));
    return result[0] || null;
  }

  static async getAllPaymentsByExpense(expenseId: number) {
    const result = await db
      .select(Repository.paymentSelectQuery)
      .from(payment)
      .where(eq(payment.expenseId, expenseId));
    return result;
  }

  static async updatePayment(paymentId: number, params: UpdatePaymentInput) {
    const updateData: any = {};
    if (params.name) updateData.name = params.name;
    if (params.amount) updateData.amount = params.amount.toString();
    if (params.paidOn)
      updateData.paidOn = params.paidOn.toISOString().split("T")[0];
    if (params.mode) updateData.mode = params.mode;
    if (params.status) updateData.status = params.status;
    if (params.notes !== undefined) updateData.notes = params.notes;

    const result = await db
      .update(payment)
      .set(updateData)
      .where(eq(payment.id, paymentId))
      .returning();
    return result[0] || null;
  }

  static async deletePayment(paymentId: number) {
    const result = await db
      .delete(payment)
      .where(eq(payment.id, paymentId))
      .returning();
    return result[0] || null;
  }

  static async getBudgetSummary(eventId: number) {
    const rows = await db
      .select({
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

        paymentId: payment.id,
        paymentName: payment.name,
        paymentAmount: payment.amount,
        paymentPaidOn: payment.paidOn,
        paymentMode: payment.mode,
        paymentStatus: payment.status,
        paymentNotes: payment.notes,
        paymentExpenseId: payment.expenseId,
        paymentCreatedAt: payment.createdAt,
        paymentUpdatedAt: payment.updatedAt,
      })
      .from(budget_category)
      .leftJoin(expense, eq(expense.categoryId, budget_category.id))
      .leftJoin(payment, eq(payment.expenseId, expense.id))
      .where(eq(budget_category.eventId, eventId));

    const categoryMap = new Map<number, any>();
    const expenseMap = new Map<number, any>();

    for (const row of rows) {
      if (!categoryMap.has(row.categoryId)) {
        categoryMap.set(row.categoryId, {
          id: row.categoryId,
          name: row.categoryName,
          eventId: row.eventId,
          allocatedBudget: Number(row.allocatedBudget),
          estimated: 0,
          spend: 0,
          remaining: 0,
          createdAt: row.categoryCreatedAt,
          updatedAt: row.categoryUpdatedAt,
          expenses: [],
        });
      }

      const category = categoryMap.get(row.categoryId);

      if (row.expenseId) {
        if (!expenseMap.has(row.expenseId)) {
          const expenseObj = {
            id: row.expenseId,
            categoryId: row.categoryId,
            name: row.expenseName,
            businessId: row.businessId,
            estimatedCost: Number(row.estimatedCost),
            contractAmount: row.contractAmount
              ? Number(row.contractAmount)
              : null,
            spend: 0,
            remaining: 0,
            nextDueDate: row.nextDueDate,
            notes: row.expenseNotes,
            createdAt: row.expenseCreatedAt,
            updatedAt: row.expenseUpdatedAt,
            payments: [],
          };

          expenseMap.set(row.expenseId, expenseObj);
          category.expenses.push(expenseObj);

          // add to category estimated
          category.estimated += expenseObj.estimatedCost;
        }

        const expenseObj = expenseMap.get(row.expenseId);

        if (row.paymentId) {
          const paymentObj = {
            id: row.paymentId,
            expenseId: row.paymentExpenseId,
            amount: Number(row.paymentAmount),
            status: row.paymentStatus,
          };

          expenseObj.payments.push(paymentObj);

          if (row.paymentStatus === "cleared") {
            expenseObj.spend += paymentObj.amount;
          }
        }
      }
    }

    for (const category of categoryMap.values()) {
      for (const expense of category.expenses) {
        if (expense.contractAmount !== null) {
          expense.remaining = expense.contractAmount - expense.spend;
          category.remaining += expense.remaining;
        }

        category.spend += expense.spend;
      }
    }

    return Array.from(categoryMap.values());
  }
}

export default Budget;
