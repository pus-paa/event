import { eq, or, sum } from "drizzle-orm";
import { budgetCategory, expense, payment } from "./schema";
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
      .from(budgetCategory).leftJoin(event, eq(budgetCategory.eventId, event.id))
      .where(
        or(
          eq(budgetCategory.eventId, eventId),
          eq(budgetCategory.eventId, event.parentId)
        )
      );

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
      .insert(budgetCategory)
      .values({ ...params, allocatedBudget: params.allocatedBudget.toString() })
      .returning();
    return result[0];
  }

  static async getBudgetCategoryById(categoryId: number) {
    const rows = await db
      .select(Repository.expenseWithCategorySelectQuery)
      .from(budgetCategory)
      .leftJoin(expense, eq(expense.categoryId, budgetCategory.id))
      .where(eq(budgetCategory.id, categoryId));

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
            cateringId: row.cateringId,
            allocatedAmount: Number(row.allocatedAmount),
            subEventid: row.subEventid,
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
      .from(budgetCategory)
      .leftJoin(event, eq(budgetCategory.eventId, event.id))
      .where(
        or(
          eq(event.id, eventId),
          eq(event.parentId, eventId)
        )
      );
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
      .update(budgetCategory)
      .set(updateData)
      .where(eq(budgetCategory.id, categoryId))
      .returning();
    return result[0] || null;
  }

  static async deleteBudgetCategory(categoryId: number) {
    const result = await db
      .delete(budgetCategory)
      .where(eq(budgetCategory.id, categoryId))
      .returning();
    return result[0] || null;
  }

  static async createExpense(
    params: AddExpenseToCategoryInput & { categoryId: number },
  ) {
    const result = await db
      .insert(expense)
      .values({
        allocatedAmount: params.allocatedAmount.toString(),
        nextDueDate: params.nextDueDate?.toISOString().split("T")[0] ?? null,
        notes: params.notes ?? undefined,
        businessId: params.businessId ?? undefined,
        categoryId: params.categoryId,
        name: params.name,
        subEventid: params.subEventid,
        cateringId: params.cateringId,
        giftId: params.giftId ?? undefined,
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
      allocatedAmount: Number(rows[0]?.expense.allocatedAmount),
      cateringId: Number(rows[0]?.expense.cateringId),
      nextDueDate: rows[0]?.expense.nextDueDate,
      notes: rows[0]?.expense.notes,
      subEventid: rows[0]?.expense.subEventid,
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
  static async getExpenseWithCateringId(cateringId: number) {
    const result = await db.select().from(expense).where(eq(expense.cateringId, cateringId));
    return result[0];
  }

  static async getExpensesByGiftId(giftId: number) {
    const result = await db
      .select()
      .from(expense)
      .where(eq(expense.giftId, giftId));
    return result;
  }

  static async getExpenseByNotes(notes: string) {
    const result = await db
      .select()
      .from(expense)
      .where(eq(expense.notes, notes));
    return result[0];
  }

  static async updateExpense(expenseId: number, params: UpdateExpenseInput) {
    const updateData: {
      name?: string;
      allocatedAmount?: string;
      nextDueDate?: string;
      cateringId?: number;
      notes?: string | null;
      businessId?: number | null;
      subEventid?: number | null;
      giftId?: number | null;
    } = {};
    if (params.subEventid !== undefined) updateData.subEventid = params.subEventid;
    if (params.name) updateData.name = params.name;
    if (params.allocatedAmount)
      updateData.allocatedAmount = params.allocatedAmount.toString();
    if (params.nextDueDate)
      updateData.nextDueDate = params.nextDueDate.toISOString().split("T")[0];
    if (params.notes !== undefined) updateData.notes = params.notes;
    if (params.businessId !== undefined)
      updateData.businessId = params.businessId;
    if (params.cateringId !== undefined) {
      updateData.cateringId = params.cateringId;
    }
    if (params.giftId !== undefined) {
      updateData.giftId = params.giftId;
    }
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

  static async getTotalPendingPayments(expenseId: number): Promise<number> {
    const result = await db
      .select({ total: sum(payment.amount) })
      .from(payment)
      .where(eq(payment.expenseId, expenseId));
    return Number(result[0]?.total ?? 0);
  }

  static async getTotalAllocatedAmountByCategory(
    categoryId: number,
  ): Promise<number> {
    const result = await db
      .select({ total: sum(expense.allocatedAmount) })
      .from(expense)
      .where(eq(expense.categoryId, categoryId));
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
        categoryId: budgetCategory.id,
        categoryName: budgetCategory.name,
        eventId: budgetCategory.eventId,
        allocatedBudget: budgetCategory.allocatedBudget,
        categoryCreatedAt: budgetCategory.createdAt,
        categoryUpdatedAt: budgetCategory.updatedAt,
        expenseId: expense.id,
        subEventid: expense.subEventid,
        expenseCateringId: expense.cateringId,
        expenseName: expense.name,
        allocatedAmount: expense.allocatedAmount,
        paymentId: payment.id,
        paymentName: payment.name,
        paymentAmount: payment.amount,
        paymentStatus: payment.status,
        paymentExpenseId: payment.expenseId,
      })
      .from(budgetCategory)
      .leftJoin(expense, eq(expense.categoryId, budgetCategory.id))
      .leftJoin(payment, eq(payment.expenseId, expense.id))
      .where(eq(budgetCategory.eventId, eventId));

    const categoryMap = new Map<number, any>();
    const expenseMap = new Map<number, any>();

    for (const row of rows) {
      if (!categoryMap.has(row.categoryId)) {
        categoryMap.set(row.categoryId, {
          id: row.categoryId,
          name: row.categoryName,
          allocatedBudget: Number(row.allocatedBudget),
          allocated: 0,
          spent: 0,
          remaining: 0,
          expenses: [],
        });
      }

      const category = categoryMap.get(row.categoryId);

      if (row.expenseId) {
        if (!expenseMap.has(row.expenseId)) {
          const expenseObj = {
            id: row.expenseId,
            subEventid: row.subEventid,
            categoryId: row.categoryId,
            cateringId: row.expenseCateringId,
            allocated: Number(row.allocatedAmount),
            spent: 0,
            balance: 0,
            payments: [],
          };

          expenseMap.set(row.expenseId, expenseObj);
          category.expenses.push(expenseObj);

          category.allocated += expenseObj.allocated;
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
            expenseObj.spent += paymentObj.amount;
          }
        }
      }
    }

    for (const category of categoryMap.values()) {
      for (const expense of category.expenses) {
        expense.balance = expense.allocated - expense.spent;
        category.spent += expense.spent;
        category.remaining = category.allocated - category.spent;
      }
    }

    return Array.from(categoryMap.values());
  }
}

export default Budget;
