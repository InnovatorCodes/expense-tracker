"use client";

import { Cell, Pie, PieChart } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { EmptyState, Panel } from "@/components/panel";
import { getCategoryColor, OTHER_COLOR } from "@/lib/categories";
import { formatMoney } from "@/lib/money";

/** Slices beyond this are grouped as "Other" so small ones stay readable. */
const MAX_SLICES = 7;

export interface CategoryAmount {
  category: string;
  amount: number;
}

export function ExpenseChart({
  data,
  monthLabel,
}: {
  data: CategoryAmount[];
  monthLabel: string;
}) {
  const sorted = data
    .filter((d) => d.amount > 0)
    .sort((a, b) => b.amount - a.amount);
  const slices = sorted.slice(0, MAX_SLICES).map((d) => ({
    name: d.category,
    amount: d.amount,
    // Fixed per category, so colours don't reshuffle from month to month.
    fill: getCategoryColor(d.category),
  }));
  const rest = sorted.slice(MAX_SLICES).reduce((s, d) => s + d.amount, 0);
  if (rest > 0) slices.push({ name: "Other", amount: rest, fill: OTHER_COLOR });

  const total = slices.reduce((s, d) => s + d.amount, 0);
  const chartConfig: ChartConfig = Object.fromEntries(
    slices.map((s) => [s.name, { label: s.name, color: s.fill }]),
  );

  return (
    <Panel
      title="Spending by Category"
      description={monthLabel}
      className="flex flex-col"
    >
      {slices.length === 0 ? (
        <EmptyState
          title="No expenses recorded for this month."
          hint="Add some transactions to see your spending breakdown."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-[minmax(180px,2fr)_minmax(0,3fr)] items-center">
          <div className="relative mx-auto w-full max-w-[240px]">
            <ChartContainer
              config={chartConfig}
              className="aspect-square w-full"
            >
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, name) =>
                        `${name}: ${formatMoney(Number(value))}`
                      }
                    />
                  }
                />
                <Pie
                  data={slices}
                  dataKey="amount"
                  nameKey="name"
                  innerRadius="64%"
                  outerRadius="95%"
                  paddingAngle={slices.length > 1 ? 2 : 0}
                  stroke="var(--card)"
                  strokeWidth={2}
                >
                  {slices.map((s) => (
                    <Cell key={s.name} fill={s.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            {/* Total in the middle of the donut. */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="text-sm font-bold tabular-nums">
                {formatMoney(total)}
              </span>
            </div>
          </div>
          <ul className="space-y-2.5 text-sm" aria-label="Spending by category">
            {slices.map((s) => (
              <li key={s.name} className="flex items-center gap-2.5 min-w-0">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: s.fill }}
                />
                <span className="truncate mr-auto">{s.name}</span>
                <span className="font-medium tabular-nums">
                  {formatMoney(s.amount)}
                </span>
                <span className="w-10 text-right text-muted-foreground tabular-nums">
                  {Math.round((s.amount / total) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}
