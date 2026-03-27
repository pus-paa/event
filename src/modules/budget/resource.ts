export interface BudgetCategoryColumn {
  id: number;
  name: string;
  eventId: number;
  allocatedBudget: string | number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface BudgetCategoryWithComputed extends BudgetCategoryColumn {
  estimatedTotal?: number;
  spend?: number;
  pending?: number;
  budgetBalance?: number;
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
      ...(category.estimatedTotal !== undefined && {
        estimatedTotal: category.estimatedTotal,
      }),
      ...(category.spend !== undefined && { spend: category.spend }),
      ...(category.pending !== undefined && { pending: category.pending }),
      ...(category.budgetBalance !== undefined && {
        budgetBalance: category.budgetBalance,
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
  estimatedCost: string | number;
  contractAmount: string | number | null;
  nextDueDate: string | null;
  notes: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  payments: Partial<PaymentColumn>[];
}

export interface ExpenseWithComputed extends ExpenseColumn {
  spend?: number;
  pending?: number;
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
      estimatedCost: Number(expenseData.estimatedCost),
      contractAmount:
        expenseData.contractAmount !== undefined
          ? Number(expenseData.contractAmount)
          : null,
      nextDueDate: expenseData.nextDueDate ?? null,
      notes: expenseData.notes ?? null,
      // computed — only present if passed in
      ...(expenseData.spend !== undefined && { spend: expenseData.spend }),
      ...(expenseData.pending !== undefined && {
        pending: expenseData.pending,
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
