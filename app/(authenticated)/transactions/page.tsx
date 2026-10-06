import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BalanceCard from "@/components/balance-card";
import TransactionList from "@/components/transactions-list";
import { FloatingActions } from "@/components/floating-actions";
import { RatesNotice } from "@/components/rates-notice";
import {
  addMonths,
  formatMonth,
  isMonthString,
  monthBounds,
  monthOf,
} from "@/lib/dates";
import { getUserToday, requireUserId } from "@/lib/server/session";
import { getExchangeRates } from "@/lib/server/exchange-rates";
import {
  getBalance,
  getTransactionsInRange,
  summarize,
} from "@/lib/server/data";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  const userId = await requireUserId();
  const today = await getUserToday();
  const currentMonth = monthOf(today);
  const requested = (await searchParams).month;
  const month =
    typeof requested === "string" && isMonthString(requested)
      ? requested
      : currentMonth;
  const { start, end } = monthBounds(month);

  const [transactions, balance, { stale }] = await Promise.all([
    getTransactionsInRange(userId, start, end),
    getBalance(userId),
    getExchangeRates(),
  ]);
  const summary = summarize(transactions);
  const isCurrent = month === currentMonth;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Your Transactions</h1>
      <RatesNotice stale={stale} />
      <BalanceCard
        balance={balance}
        income={summary.income}
        expense={summary.expense}
        periodLabel={isCurrent ? "this Month" : `in ${formatMonth(month)}`}
        today={today}
      />
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Transactions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Income and expenses for the selected month.
            </p>
          </div>
          <nav
            aria-label="Choose month"
            className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg p-1 self-end sm:self-auto"
          >
            <MonthLink month={addMonths(month, -1)} label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </MonthLink>
            <span className="text-sm font-semibold min-w-[120px] text-center select-none">
              {formatMonth(month)}
            </span>
            {isCurrent ? (
              <span className="h-8 w-8 flex items-center justify-center opacity-30">
                <ChevronRight className="h-4 w-4" />
              </span>
            ) : (
              <MonthLink month={addMonths(month, 1)} label="Next month">
                <ChevronRight className="h-4 w-4" />
              </MonthLink>
            )}
          </nav>
        </div>
        <TransactionList transactions={transactions} />
      </div>
      <FloatingActions actions={["income", "expense"]} />
    </div>
  );
}

function MonthLink({
  month,
  label,
  children,
}: {
  month: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={`/transactions?month=${month}`}
      aria-label={label}
      className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-gray-600"
    >
      {children}
    </Link>
  );
}
