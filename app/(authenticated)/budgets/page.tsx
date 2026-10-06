import BudgetsList from "@/components/budget-list";
import { FloatingActions } from "@/components/floating-actions";
import { formatMonth, monthBounds, monthOf } from "@/lib/dates";
import { getUserToday, requireUserId } from "@/lib/server/session";
import {
  getBudgets,
  getPinnedBudgetId,
  getTransactionsInRange,
  summarize,
  withUsage,
} from "@/lib/server/data";

export default async function BudgetsPage() {
  const userId = await requireUserId();
  const month = monthOf(await getUserToday());
  const { start, end } = monthBounds(month);

  const [budgets, pinnedId, transactions] = await Promise.all([
    getBudgets(userId),
    getPinnedBudgetId(userId),
    getTransactionsInRange(userId, start, end),
  ]);
  const summary = summarize(transactions);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Your Budgets</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Spending for {formatMonth(month)}. Pin one budget to show it on your
          dashboard.
        </p>
      </div>
      <BudgetsList
        budgets={budgets.map((b) => withUsage(b, summary))}
        pinnedId={pinnedId}
      />
      <FloatingActions actions={["budget"]} />
    </div>
  );
}
