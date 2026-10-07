import { Suspense } from "react";
import RecentTransactions from "@/components/recent-transactions";
import { FloatingActions } from "@/components/floating-actions";
import { PageHeader } from "@/components/page-header";
import { PanelSkeleton } from "@/components/panel";
import { MonthSwitcher, resolveMonth } from "@/components/month-switcher";
import { WelcomeCard } from "@/components/welcome-card";
import {
  BalanceSection,
  CategorySection,
  PinnedBudgetSection,
  RatesNoticeSection,
  WeekSection,
} from "@/components/dashboard-sections";
import { monthOf } from "@/lib/dates";
import { getRecentTransactions } from "@/lib/server/data";
import { getUserName, getUserToday, requireUserId } from "@/lib/server/session";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  const userId = await requireUserId();
  const today = await getUserToday();
  const currentMonth = monthOf(today);
  const month = resolveMonth((await searchParams).month, currentMonth);

  // One quick query decides between the first-run welcome and the full dashboard.
  const recent = await getRecentTransactions(userId, 5);

  if (recent.length === 0) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <WelcomeCard name={await getUserName()} />
        <FloatingActions actions={["income", "expense", "budget"]} />
      </>
    );
  }

  const props = { userId, month, today };
  return (
    <>
      <PageHeader
        title="Dashboard"
        actions={
          <MonthSwitcher
            month={month}
            currentMonth={currentMonth}
            basePath="/dashboard"
          />
        }
      />
      <Suspense fallback={null}>
        <RatesNoticeSection />
      </Suspense>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6 min-w-0">
          <Suspense fallback={<PanelSkeleton rows={2} />}>
            <BalanceSection {...props} />
          </Suspense>
          <RecentTransactions transactions={recent} />
          <Suspense fallback={<PanelSkeleton rows={1} />}>
            <PinnedBudgetSection {...props} />
          </Suspense>
        </div>
        <div className="flex flex-col gap-6 min-w-0">
          <Suspense fallback={<PanelSkeleton chart />}>
            <CategorySection {...props} />
          </Suspense>
          <Suspense fallback={<PanelSkeleton chart />}>
            <WeekSection {...props} />
          </Suspense>
        </div>
      </div>
      <FloatingActions actions={["income", "expense", "budget"]} />
    </>
  );
}
