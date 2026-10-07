// Async server components for each dashboard card. Each one fetches its own
// data inside a Suspense boundary, so cards stream in independently. Shared
// queries are memoised per request in lib/server/data, so nothing runs twice.
import BalanceCard from "@/components/balance-card";
import DashboardBudget from "@/components/dashboard-budget";
import { ExpenseChart } from "@/components/expense-chart";
import { PastWeekChart } from "@/components/past-week-chart";
import { RatesNotice } from "@/components/rates-notice";
import { ALL_CATEGORIES } from "@/lib/categories";
import {
  addDays,
  daysLeftInMonth,
  formatMonth,
  monthBounds,
  monthOf,
} from "@/lib/dates";
import { getExchangeRates } from "@/lib/server/exchange-rates";
import {
  dailyTotals,
  getBalance,
  getPinnedBudget,
  getTransactionsInRange,
  summarize,
  withUsage,
} from "@/lib/server/data";

interface SectionProps {
  userId: string;
  /** "YYYY-MM" being viewed. */
  month: string;
  /** Today in the user's timezone. */
  today: string;
}

async function monthSummary(userId: string, month: string) {
  const { start, end } = monthBounds(month);
  return summarize(await getTransactionsInRange(userId, start, end));
}

const periodLabel = (month: string, today: string) =>
  month === monthOf(today) ? "this month" : `in ${formatMonth(month)}`;

export async function BalanceSection({ userId, month, today }: SectionProps) {
  const [balance, summary] = await Promise.all([
    getBalance(userId),
    monthSummary(userId, month),
  ]);
  return (
    <BalanceCard
      balance={balance}
      income={summary.income}
      expense={summary.expense}
      periodLabel={periodLabel(month, today)}
      today={today}
    />
  );
}

export async function PinnedBudgetSection({
  userId,
  month,
  today,
}: SectionProps) {
  const [pinned, summary] = await Promise.all([
    getPinnedBudget(userId),
    monthSummary(userId, month),
  ]);
  return (
    <DashboardBudget
      budget={pinned ? withUsage(pinned, summary) : null}
      // A daily allowance only makes sense for the month in progress.
      daysLeft={month === monthOf(today) ? daysLeftInMonth(today) : undefined}
    />
  );
}

export async function CategorySection({ userId, month }: SectionProps) {
  const summary = await monthSummary(userId, month);
  const data = Object.entries(summary.expenseByCategory)
    .filter(([category]) => category !== ALL_CATEGORIES)
    .map(([category, amount]) => ({ category, amount }));
  return <ExpenseChart data={data} monthLabel={formatMonth(month)} />;
}

export async function WeekSection({ userId, today }: SectionProps) {
  const start = addDays(today, -6);
  const transactions = await getTransactionsInRange(userId, start, today);
  return <PastWeekChart data={dailyTotals(transactions, start, today)} />;
}

export async function RatesNoticeSection() {
  const { stale } = await getExchangeRates();
  return <RatesNotice stale={stale} />;
}
