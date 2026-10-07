import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, formatMonth, isMonthString } from "@/lib/dates";

/** Previous / next month links that keep the month in the URL (?month=). */
export function MonthSwitcher({
  month,
  currentMonth,
  basePath,
}: {
  month: string;
  currentMonth: string;
  basePath: string;
}) {
  const href = (m: string) =>
    m === currentMonth ? basePath : `${basePath}?month=${m}`;
  const isCurrent = month >= currentMonth;
  const button =
    "h-8 w-8 flex items-center justify-center rounded-md transition-colors";

  return (
    <nav
      aria-label="Choose month"
      className="flex items-center gap-1 rounded-lg bg-card border border-border/40 shadow-sm p-1 self-start sm:self-auto"
    >
      <Link
        href={href(addMonths(month, -1))}
        aria-label="Previous month"
        className={`${button} hover:bg-muted`}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      <span className="text-sm font-semibold min-w-[124px] text-center select-none">
        {formatMonth(month)}
      </span>
      {isCurrent ? (
        <span className={`${button} opacity-30`} aria-hidden>
          <ChevronRight className="h-4 w-4" />
        </span>
      ) : (
        <Link
          href={href(addMonths(month, 1))}
          aria-label="Next month"
          className={`${button} hover:bg-muted`}
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
      {!isCurrent && (
        <Link
          href={basePath}
          className="text-xs font-medium px-2 text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Today
        </Link>
      )}
    </nav>
  );
}

/** Reads ?month=YYYY-MM, falling back to the current month (no future months). */
export function resolveMonth(
  requested: string | string[] | undefined,
  currentMonth: string,
): string {
  return typeof requested === "string" &&
    isMonthString(requested) &&
    requested <= currentMonth
    ? requested
    : currentMonth;
}
