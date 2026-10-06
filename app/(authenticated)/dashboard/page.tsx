import BalanceCard from "@/components/balance-card";
import RecentTransactions from "@/components/recent-transactions";
import DashboardBudget from "@/components/dashboard-budget";
import { ExpenseChart } from "@/components/expense-chart";
import { PastWeekChart } from "@/components/past-week-chart";
import { FloatingActions } from "@/components/floating-actions";
import { RatesNotice } from "@/components/rates-notice";
import { ALL_CATEGORIES } from "@/lib/categories";
import { addDays, formatMonth, monthBounds, monthOf } from "@/lib/dates";
import { getUserToday, requireUserId } from "@/lib/server/session";
import { getExchangeRates } from "@/lib/server/exchange-rates";
import {
  dailyTotals,
  getBalance,
  getPinnedBudget,
  getRecentTransactions,
  getTransactionsInRange,
  summarize,
  withUsage,
} from "@/lib/server/data";

export default async function DashboardPage() {
  const userId = await requireUserId();
  const today = await getUserToday();
  const month = monthOf(today);
  const { start: monthStart, end: monthEnd } = monthBounds(month);
  const weekStart = addDays(today, -6);

  // One range query covers both this month and the last 7 days.
  const rangeStart = weekStart < monthStart ? weekStart : monthStart;
  const [transactions, balance, recent, pinned, { stale }] = await Promise.all([
    getTransactionsInRange(userId, rangeStart, monthEnd),
    getBalance(userId),
    getRecentTransactions(userId, 5),
    getPinnedBudget(userId),
    getExchangeRates(),
  ]);

  const monthSummary = summarize(
    transactions.filter((t) => t.date >= monthStart),
  );
  const categoryData = Object.entries(monthSummary.expenseByCategory)
    .filter(([category]) => category !== ALL_CATEGORIES)
    .map(([category, amount]) => ({ category, amount }));

  return (
    <section>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <RatesNotice stale={stale} />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6 min-w-0">
          <BalanceCard
            balance={balance}
            income={monthSummary.income}
            expense={monthSummary.expense}
            periodLabel="this Month"
            today={today}
          />
          <RecentTransactions transactions={recent} />
          <DashboardBudget
            budget={pinned ? withUsage(pinned, monthSummary) : null}
          />
        </div>
        <div className="flex flex-col gap-6 min-w-0">
          <ExpenseChart data={categoryData} monthLabel={formatMonth(month)} />
          <PastWeekChart data={dailyTotals(transactions, weekStart, today)} />
        </div>
      </div>
      <FloatingActions actions={["income", "expense", "budget"]} />
    </section>
  );
}
