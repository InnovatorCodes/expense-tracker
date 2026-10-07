import { Suspense } from "react";
import TransactionList from "@/components/transactions-list";
import { FloatingActions } from "@/components/floating-actions";
import { PageHeader } from "@/components/page-header";
import { Panel, PanelSkeleton } from "@/components/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { MonthSwitcher, resolveMonth } from "@/components/month-switcher";
import {
  BalanceSection,
  RatesNoticeSection,
} from "@/components/dashboard-sections";
import { formatMonth, monthBounds, monthOf } from "@/lib/dates";
import { getUserToday, requireUserId } from "@/lib/server/session";
import { getTransactionsInRange } from "@/lib/server/data";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  const userId = await requireUserId();
  const today = await getUserToday();
  const currentMonth = monthOf(today);
  const month = resolveMonth((await searchParams).month, currentMonth);

  return (
    <>
      <PageHeader
        title="Transactions"
        description={`Income and expenses for ${formatMonth(month)}.`}
        actions={
          <MonthSwitcher
            month={month}
            currentMonth={currentMonth}
            basePath="/transactions"
          />
        }
      />
      <Suspense fallback={null}>
        <RatesNoticeSection />
      </Suspense>
      <div className="space-y-6">
        <Suspense fallback={<PanelSkeleton rows={2} />}>
          <BalanceSection userId={userId} month={month} today={today} />
        </Suspense>
        <Panel>
          <Suspense key={month} fallback={<ListSkeleton />}>
            <MonthTransactions userId={userId} month={month} />
          </Suspense>
        </Panel>
      </div>
      <FloatingActions actions={["income", "expense"]} />
    </>
  );
}

async function MonthTransactions({
  userId,
  month,
}: {
  userId: string;
  month: string;
}) {
  const { start, end } = monthBounds(month);
  const transactions = await getTransactionsInRange(userId, start, end);
  // Keyed by month so search and filters reset when the month changes.
  return <TransactionList key={month} transactions={transactions} />;
}

function ListSkeleton() {
  return (
    <div aria-hidden className="space-y-3">
      <Skeleton className="h-9 w-full" />
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
