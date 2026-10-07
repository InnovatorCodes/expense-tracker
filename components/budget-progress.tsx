import type { ReactNode } from "react";
import type { BudgetWithUsage } from "@/types/budget";
import { CategoryIcon } from "@/components/category-icon";
import { getCategoryColor } from "@/lib/categories";
import { formatMoney } from "@/lib/money";

/**
 * A budget's spend vs. limit, with what is left and a daily allowance.
 * `daysLeft` is only passed for the current month; past months have no
 * allowance to spread.
 */
export function BudgetProgress({
  budget,
  daysLeft,
  actions,
  elevated = false,
}: {
  budget: BudgetWithUsage;
  daysLeft?: number;
  actions?: ReactNode;
  /** Card styling for when it sits directly on the page, not inside a panel. */
  elevated?: boolean;
}) {
  const percentage =
    budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
  const remaining = budget.amount - budget.spent;
  const over = remaining < 0;
  const barColor = over
    ? "bg-destructive"
    : percentage >= 80
      ? "bg-amber-500"
      : "bg-indigo-600 dark:bg-indigo-500";
  const color = getCategoryColor(budget.category);
  const label = budget.category === "All" ? "All spending" : budget.category;

  return (
    <div
      className={
        elevated
          ? "rounded-xl border border-border/40 bg-card shadow-sm p-4"
          : "rounded-xl bg-muted/50 p-4"
      }
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="p-1.5 rounded-full shrink-0"
          style={{ backgroundColor: `${color}26`, color }}
        >
          <CategoryIcon category={budget.category} className="h-4 w-4" />
        </div>
        <h3 className="font-semibold mr-auto truncate">{label}</h3>
        {actions}
      </div>
      <div className="flex items-baseline justify-between text-sm mb-1.5 tabular-nums">
        <span className="font-semibold">{formatMoney(budget.spent)}</span>
        <span className="text-muted-foreground">
          of {formatMoney(budget.amount)}
        </span>
      </div>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-foreground/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(Math.min(100, percentage))}
        aria-label={`${label} budget used`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
        />
      </div>
      <p
        className={`text-xs mt-2 tabular-nums ${over ? "text-destructive font-semibold" : "text-muted-foreground"}`}
      >
        {over ? (
          `${formatMoney(-remaining)} over budget`
        ) : (
          <>
            <span className="font-medium text-foreground">
              {formatMoney(remaining)} left
            </span>
            {daysLeft !== undefined && daysLeft > 0 && (
              <>
                {" "}
                · about {formatMoney(remaining / daysLeft)}/day for {daysLeft}{" "}
                {daysLeft === 1 ? "day" : "days"}
              </>
            )}{" "}
            · {percentage.toFixed(0)}% used
          </>
        )}
      </p>
    </div>
  );
}
