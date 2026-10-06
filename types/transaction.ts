export type TransactionType = "expense" | "income";

export interface Transaction {
  id: string;
  name: string;
  /** Amount in the currency the user entered it in. */
  amount: number;
  currency: string;
  /** Amount converted to BASE_CURRENCY at the rate captured when it was saved. */
  baseAmount: number;
  /** Units of `currency` per 1 BASE_CURRENCY, frozen at save time. */
  exchangeRate: number;
  category: string;
  /** Calendar date, "YYYY-MM-DD". */
  date: string;
  type: TransactionType;
  notes?: string;
  /** ISO timestamp. */
  createdAt: string;
}
