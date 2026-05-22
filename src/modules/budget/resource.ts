export interface BudgetCategoryColumn {
  id: number;
  name: string;
  eventId: number;
  allocatedBudget: string | number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface BudgetCategoryWithComputed extends BudgetCategoryColumn {
  allocated?: number;
  spent?: number;
  pending?: number;
  remaining?: number;
  expenses?: Partial<ExpenseColumn>[];
}

class BudgetCategoryResource {
  static toJson(
    category: Partial<BudgetCategoryWithComputed>,
  ): Partial<BudgetCategoryWithComputed> | null {
    if (!category) return null;
    return {
      id: category.id,
      name: category.name,
      eventId: category.eventId,
      allocatedBudget: Number(category.allocatedBudget),
      ...(category.allocated !== undefined && {
        allocated: category.allocated,
      }),
      ...(category.spent !== undefined && { spent: category.spent }),
      ...(category.pending !== undefined && { pending: category.pending }),
      ...(category.remaining !== undefined && {
        remaining: category.remaining,
      }),
      ...(category.expenses !== undefined && { expenses: category.expenses }),
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  static collection(categories: Partial<BudgetCategoryWithComputed>[]) {
    return categories.map((cat) => this.toJson(cat));
  }
}

export interface ExpenseColumn {
  id: number;
  categoryId: number;
  name: string;
  businessId: number | null;
  subEventid: number | null;
  cateringId?: number | null;
  allocatedAmount: string | number;
  nextDueDate: string | null;
  notes: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  payments: Partial<PaymentColumn>[];
}

export interface ExpenseWithComputed extends ExpenseColumn {
  spent?: number;
  balance?: number;
}

class ExpenseResource {
  static toJson(
    expenseData: Partial<ExpenseWithComputed>,
  ): Partial<ExpenseWithComputed> | null {
    if (!expenseData) return null;
    return {
      id: expenseData.id,
      categoryId: expenseData.categoryId,
      name: expenseData.name,
      businessId: expenseData.businessId ?? null,
      subEventid: expenseData.subEventid ?? null,
      cateringId: expenseData.cateringId ?? null,
      allocatedAmount: Number(expenseData.allocatedAmount),
      nextDueDate: expenseData.nextDueDate ?? null,
      notes: expenseData.notes ?? null,
      // computed — only present if passed in
      ...(expenseData.spent !== undefined && { spent: expenseData.spent }),
      ...(expenseData.balance !== undefined && {
        balance: expenseData.balance,
      }),
      ...(expenseData.payments !== undefined && {
        payments: expenseData.payments,
      }),
      createdAt: expenseData.createdAt,
      updatedAt: expenseData.updatedAt,
    };
  }

  static collection(expenses: Partial<ExpenseWithComputed>[]) {
    return expenses.map((exp) => this.toJson(exp));
  }
}

export interface PaymentColumn {
  id: number;
  expenseId: number;
  name: string;
  amount: string | number;
  paidOn: string;
  mode: "cash" | "bank_transfer" | "credit_card" | "upi" | "cheque";
  status: "cleared" | "pending" | "cancelled";
  notes: string | null;
  createdAt: Date | null;
}

class PaymentResource {
  static toJson(
    paymentData: Partial<PaymentColumn>,
  ): Partial<PaymentColumn> | null {
    if (!paymentData) return null;
    return {
      id: paymentData.id,
      expenseId: paymentData.expenseId,
      name: paymentData.name,
      amount: Number(paymentData.amount),
      paidOn: paymentData.paidOn,
      mode: paymentData.mode,
      status: paymentData.status,
      notes: paymentData.notes ?? null,
      createdAt: paymentData.createdAt,
    };
  }

  static collection(payments: Partial<PaymentColumn>[]) {
    return payments.map((pay) => this.toJson(pay));
  }
}

export { BudgetCategoryResource, ExpenseResource, PaymentResource };
