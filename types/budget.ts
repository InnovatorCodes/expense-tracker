export interface Budget {
  id: string;
  /** An expense category, or "All" for total monthly spending. */
  category: string;
  /** Monthly limit in BASE_CURRENCY. */
  amount: number;
  /** ISO timestamp. */
  createdAt: string;
}

/** A budget together with how much has been spent against it this month. */
export interface BudgetWithUsage extends Budget {
  spent: number;
}
