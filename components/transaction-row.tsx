import type { ReactNode } from "react";
import type { Transaction } from "@/types/transaction";
import { CategoryIcon } from "@/components/category-icon";
import { formatDate } from "@/lib/dates";
import { BASE_CURRENCY, formatMoney } from "@/lib/money";

/** One transaction line, shared by the dashboard and the transactions page. */
export function TransactionRow({
  transaction: t,
  actions,
}: {
  transaction: Transaction;
  actions?: ReactNode;
}) {
  const income = t.type === "income";
  const sign = income ? "+" : "-";
  return (
    <div
      className={`flex items-center justify-between gap-3 p-3 rounded-lg shadow-sm border ${
        income
          ? "bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-800/50"
          : "bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-800/50"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`p-2 rounded-full shrink-0 ${income ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
        >
          <CategoryIcon
            category={t.category}
            size={18}
            className={
              income
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }
          />
        </div>
        <div className="flex flex-col min-w-0">
          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
            {t.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t.category} • {formatDate(t.date)}
          </p>
          {t.notes && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">
              {t.notes}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right">
          <p
            className={`text-base font-bold whitespace-nowrap ${income ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          >
            {sign}
            {formatMoney(t.amount, t.currency)}
          </p>
          {t.currency !== BASE_CURRENCY && (
            <p
              className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap"
              title="Converted at the exchange rate when this was recorded"
            >
              ≈ {formatMoney(t.baseAmount)}
            </p>
          )}
        </div>
        {actions}
      </div>
    </div>
  );
}
