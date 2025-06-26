export type BudgetRecurrence = 'monthly' | 'weekly' | 'yearly';

export interface Budget {
  id: string; // Firestore document ID
  category: string; // The category this budget applies to (e.g., 'Food', 'Transport')
  amount: number; // The budgeted amount for the given recurrence
  recurrence: BudgetRecurrence; // How often the budget resets (e.g., 'monthly', 'weekly')
  startDate: string; // The date from which this budget starts (YYYY-MM-DD)
  createdAt: Date; // Timestamp of when the budget was created
}
