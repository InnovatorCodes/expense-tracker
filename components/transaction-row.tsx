import type { ReactNode } from "react";
import type { Transaction } from "@/types/transaction";
import { CategoryIcon } from "@/components/category-icon";
import { getCategoryColor } from "@/lib/categories";
import { formatDate } from "@/lib/dates";
import { BASE_CURRENCY, formatMoney } from "@/lib/money";

/** One transaction line, shared by the dashboard and the transactions page. */
export function TransactionRow({
  transaction: t,
  actions,
  showDate = true,
}: {
  transaction: Transaction;
  actions?: ReactNode;
  /** Hidden when rows are already grouped under a date heading. */
  showDate?: boolean;
}) {
  const income = t.type === "income";
  const color = getCategoryColor(t.category);
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/60 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="p-2 rounded-full shrink-0"
          // The category's own colour, so it matches the charts.
          style={{ backgroundColor: `${color}26`, color }}
        >
          <CategoryIcon category={t.category} size={18} />
        </div>
        <div className="flex flex-col min-w-0">
          <p className="font-medium text-sm line-clamp-2 break-words">
            {t.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {t.category}
            {showDate && <> • {formatDate(t.date)}</>}
            {t.notes && <> • {t.notes}</>}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <div className="text-right">
          <p
            className={`text-sm font-semibold whitespace-nowrap tabular-nums ${income ? "text-constructive" : "text-destructive"}`}
          >
            {income ? "+" : "-"}
            {formatMoney(t.amount, t.currency)}
          </p>
          {t.currency !== BASE_CURRENCY && (
            <p
              className="text-xs text-muted-foreground whitespace-nowrap tabular-nums"
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
