import type { ReactNode } from "react";
import type { BudgetWithUsage } from "@/types/budget";
import { CategoryIcon } from "@/components/category-icon";
import { formatMoney } from "@/lib/money";

/** A budget's name, spend-vs-limit and progress bar. */
export function BudgetProgress({
  budget,
  actions,
}: {
  budget: BudgetWithUsage;
  actions?: ReactNode;
}) {
  const percentage =
    budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
  const over = percentage > 100;
  const barColor = over
    ? "bg-red-600"
    : percentage >= 80
      ? "bg-amber-500"
      : "bg-indigo-600";

  return (
    <div className="rounded-xl bg-gray-100 dark:bg-gray-700 p-4">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-lg font-bold flex items-center gap-2 mr-auto">
          <CategoryIcon category={budget.category} className="h-5 w-5" />
          {budget.category}
        </h3>
        {actions}
      </div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="font-medium">Used</span>
        <span className="font-semibold">
          {formatMoney(budget.spent)} / {formatMoney(budget.amount)}
        </span>
      </div>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-white dark:bg-gray-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(Math.min(100, percentage))}
        aria-label={`${budget.category} budget used`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
        />
      </div>
      <p
        className={`text-xs mt-1 text-right ${over ? "text-red-600 dark:text-red-400 font-semibold" : ""}`}
      >
        {over
          ? `${formatMoney(budget.spent - budget.amount)} over budget`
          : `${percentage.toFixed(0)}% used`}
      </p>
    </div>
  );
}
