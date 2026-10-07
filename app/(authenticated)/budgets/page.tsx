import { Suspense } from "react";
import BudgetsList from "@/components/budget-list";
import { FloatingActions } from "@/components/floating-actions";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  daysLeftInMonth,
  formatMonth,
  monthBounds,
  monthOf,
} from "@/lib/dates";
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
  const today = await getUserToday();

  return (
    <>
      <PageHeader
        title="Budgets"
        description={`Spending for ${formatMonth(monthOf(today))}. Pin one budget to show it on your dashboard.`}
      />
      <Suspense fallback={<BudgetsSkeleton />}>
        <Budgets userId={userId} today={today} />
      </Suspense>
      <FloatingActions actions={["budget"]} />
    </>
  );
}

async function Budgets({ userId, today }: { userId: string; today: string }) {
  const { start, end } = monthBounds(monthOf(today));
  const [budgets, pinnedId, transactions] = await Promise.all([
    getBudgets(userId),
    getPinnedBudgetId(userId),
    getTransactionsInRange(userId, start, end),
  ]);
  const summary = summarize(transactions);
  return (
    <BudgetsList
      budgets={budgets.map((b) => withUsage(b, summary))}
      pinnedId={pinnedId}
      daysLeft={daysLeftInMonth(today)}
    />
  );
}

function BudgetsSkeleton() {
  return (
    <div aria-hidden className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-xl" />
      ))}
    </div>
  );
}
