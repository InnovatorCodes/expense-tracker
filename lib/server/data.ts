// Read-side data access. Only ever imported by server components and server actions.
import { cache } from "react";
import {
  AggregateField,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import {
  budgetsCol,
  getDb,
  transactionsCol,
  userDoc,
} from "@/lib/server/firebase-admin";
import {
  getExchangeRates,
  type ExchangeRates,
} from "@/lib/server/exchange-rates";
import { ALL_CATEGORIES } from "@/lib/categories";
import { addDays } from "@/lib/dates";
import { BASE_CURRENCY, roundMoney } from "@/lib/money";
import type { Transaction, TransactionType } from "@/types/transaction";
import type { Budget, BudgetWithUsage } from "@/types/budget";

/**
 * v2 stores `baseAmount` and `exchangeRate` on every transaction and derives
 * the balance from them instead of keeping a running `currentBalance`.
 */
export const SCHEMA_VERSION = 2;

function isoOrEmpty(value: unknown): string {
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return "";
}

/**
 * Legacy documents (written before v2) lack `baseAmount`. Those are converted
 * with current rates so they still display sensibly until they are migrated.
 */
function toTransaction(
  doc: QueryDocumentSnapshot | DocumentSnapshot,
  rates?: ExchangeRates,
): Transaction {
  const d = doc.data() ?? {};
  const amount = Number(d.amount) || 0;
  const currency = typeof d.currency === "string" ? d.currency : BASE_CURRENCY;
  const exchangeRate =
    typeof d.exchangeRate === "number"
      ? d.exchangeRate
      : (rates?.[currency] ?? 1);
  const baseAmount =
    typeof d.baseAmount === "number"
      ? d.baseAmount
      : roundMoney(amount / exchangeRate);
  return {
    id: doc.id,
    name: String(d.name ?? ""),
    amount,
    currency,
    baseAmount,
    exchangeRate,
    category: String(d.category ?? ""),
    date: String(d.date ?? ""),
    type: d.type === "income" ? "income" : "expense",
    notes: d.notes ? String(d.notes) : undefined,
    createdAt: isoOrEmpty(d.createdAt),
  };
}

/**
 * One-time, per-user upgrade of legacy transactions to the v2 shape.
 * Runs at most once per request (React `cache`) and is idempotent, so two
 * concurrent requests doing it at the same time is harmless.
 * Resolves to whether the user's data is on the current schema.
 */
export const ensureUserMigrated = cache(async (userId: string) => {
  const user = await userDoc(userId).get();
  if ((user.get("schemaVersion") ?? 0) >= SCHEMA_VERSION) return true;

  const { rates, stale } = await getExchangeRates();
  // Never freeze approximate fallback rates into history; retry on a later request.
  if (stale) return false;

  const snapshot = await transactionsCol(userId).get();
  const db = getDb();
  let batch = db.batch();
  let pending = 0;
  for (const doc of snapshot.docs) {
    const d = doc.data();
    if (
      typeof d.baseAmount === "number" &&
      typeof d.exchangeRate === "number"
    ) {
      continue;
    }
    const amount = roundMoney(Number(d.amount) || 0);
    const currency = rates[d.currency] ? d.currency : BASE_CURRENCY;
    const exchangeRate = rates[currency];
    batch.update(doc.ref, {
      amount,
      currency,
      baseAmount: roundMoney(amount / exchangeRate),
      exchangeRate,
      rateCapturedAt: "migration",
    });
    if (++pending === 450) {
      await batch.commit();
      batch = db.batch();
      pending = 0;
    }
  }
  if (pending) await batch.commit();
  await userDoc(userId).set({ schemaVersion: SCHEMA_VERSION }, { merge: true });
  return true;
});

/** Rates for legacy fallback conversion, only fetched when actually needed. */
async function ratesIfUnmigrated(userId: string) {
  return (await ensureUserMigrated(userId))
    ? undefined
    : (await getExchangeRates()).rates;
}

/** Transactions with dates in [start, end], newest first. */
export const getTransactionsInRange = cache(
  async function getTransactionsInRange(
    userId: string,
    start: string,
    end: string,
  ): Promise<Transaction[]> {
    const rates = await ratesIfUnmigrated(userId);
    const snapshot = await transactionsCol(userId)
      .where("date", ">=", start)
      .where("date", "<=", end)
      .orderBy("date", "desc")
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map((doc) => toTransaction(doc, rates));
  },
);

export const getRecentTransactions = cache(async function getRecentTransactions(
  userId: string,
  limit = 5,
): Promise<Transaction[]> {
  const rates = await ratesIfUnmigrated(userId);
  const snapshot = await transactionsCol(userId)
    .orderBy("date", "desc")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return snapshot.docs.map((doc) => toTransaction(doc, rates));
});

const signed = (t: Transaction) =>
  t.type === "income" ? t.baseAmount : -t.baseAmount;

/**
 * Current balance in BASE_CURRENCY: total income minus total expenses.
 * Derived from the stored base amounts every time, so it can never drift.
 */
export const getBalance = cache(async function getBalance(
  userId: string,
): Promise<number> {
  const rates = await ratesIfUnmigrated(userId);
  if (rates) {
    // Not migrated yet: legacy docs have no baseAmount to aggregate on.
    const snapshot = await transactionsCol(userId).get();
    const total = snapshot.docs
      .map((doc) => toTransaction(doc, rates))
      .reduce((sum, t) => sum + signed(t), 0);
    return roundMoney(total);
  }
  const sumOf = async (type: TransactionType) => {
    const result = await transactionsCol(userId)
      .where("type", "==", type)
      .aggregate({ total: AggregateField.sum("baseAmount") })
      .get();
    return result.data().total ?? 0;
  };
  const [income, expense] = await Promise.all([
    sumOf("income"),
    sumOf("expense"),
  ]);
  return roundMoney(income - expense);
});

export interface PeriodSummary {
  income: number;
  expense: number;
  /** Expense totals per category, plus an "All" total. */
  expenseByCategory: Record<string, number>;
}

export function summarize(transactions: Transaction[]): PeriodSummary {
  let income = 0;
  let expense = 0;
  const expenseByCategory: Record<string, number> = {};
  for (const t of transactions) {
    if (t.type === "income") {
      income += t.baseAmount;
    } else {
      expense += t.baseAmount;
      expenseByCategory[t.category] =
        (expenseByCategory[t.category] ?? 0) + t.baseAmount;
    }
  }
  for (const key of Object.keys(expenseByCategory)) {
    expenseByCategory[key] = roundMoney(expenseByCategory[key]);
  }
  expenseByCategory[ALL_CATEGORIES] = roundMoney(expense);
  return {
    income: roundMoney(income),
    expense: roundMoney(expense),
    expenseByCategory,
  };
}

export interface DailyTotals {
  date: string;
  income: number;
  expense: number;
}

/** Per-day income and expense for every day in [start, end], oldest first. */
export function dailyTotals(
  transactions: Transaction[],
  start: string,
  end: string,
): DailyTotals[] {
  const days = new Map<string, DailyTotals>();
  for (let d = start; d <= end; d = addDays(d, 1)) {
    days.set(d, { date: d, income: 0, expense: 0 });
  }
  for (const t of transactions) {
    const day = days.get(t.date);
    if (day) day[t.type] = roundMoney(day[t.type] + t.baseAmount);
  }
  return [...days.values()];
}

function toBudget(doc: QueryDocumentSnapshot | DocumentSnapshot): Budget {
  const d = doc.data() ?? {};
  return {
    id: doc.id,
    category: String(d.category ?? ""),
    amount: Number(d.amount) || 0,
    createdAt: isoOrEmpty(d.createdAt),
  };
}

export const getBudgets = cache(async function getBudgets(
  userId: string,
): Promise<Budget[]> {
  const snapshot = await budgetsCol(userId).orderBy("createdAt").get();
  return snapshot.docs.map(toBudget);
});

export const getPinnedBudgetId = cache(async function getPinnedBudgetId(
  userId: string,
): Promise<string | null> {
  const user = await userDoc(userId).get();
  const id = user.get("pinnedBudget");
  return typeof id === "string" && id ? id : null;
});

export const getPinnedBudget = cache(async function getPinnedBudget(
  userId: string,
): Promise<Budget | null> {
  const id = await getPinnedBudgetId(userId);
  if (!id) return null;
  const doc = await budgetsCol(userId).doc(id).get();
  return doc.exists ? toBudget(doc) : null;
});

export function withUsage(
  budget: Budget,
  summary: PeriodSummary,
): BudgetWithUsage {
  return { ...budget, spent: summary.expenseByCategory[budget.category] ?? 0 };
}
