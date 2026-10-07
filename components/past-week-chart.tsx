"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "@/components/ui/chart";
import { EmptyState, Panel } from "@/components/panel";
import { formatShortDate } from "@/lib/dates";
import { BASE_CURRENCY, currencySymbol, formatMoney } from "@/lib/money";

export interface DailyTotals {
  /** "YYYY-MM-DD" */
  date: string;
  income: number;
  expense: number;
}

const chartConfig = {
  income: { label: "Income", color: "var(--constructive)" },
  expense: { label: "Expense", color: "var(--destructive)" },
} satisfies ChartConfig;

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function PastWeekChart({ data }: { data: DailyTotals[] }) {
  const hasData = data.some((d) => d.income > 0 || d.expense > 0);
  const range =
    data.length > 0
      ? `${formatShortDate(data[0].date)} – ${formatShortDate(data[data.length - 1].date)}`
      : "";
  const symbol = currencySymbol(BASE_CURRENCY);

  return (
    <Panel title="Last 7 Days" description={range}>
      {!hasData ? (
        <EmptyState
          title="No activity in the last 7 days."
          hint="Record some transactions to see the trend."
        />
      ) : (
        <ChartContainer config={chartConfig} className="w-full h-64 md:h-72">
          <BarChart accessibilityLayer data={data} margin={{ bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={formatShortDate}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={(v: number) => `${symbol}${compact.format(v)}`}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.5 }}
              content={
                <ChartTooltipContent
                  indicator="dashed"
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.date
                      ? formatShortDate(payload[0].payload.date)
                      : ""
                  }
                  formatter={(value, name) =>
                    `${chartConfig[name as keyof typeof chartConfig]?.label ?? name}: ${formatMoney(Number(value))}`
                  }
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="income"
              fill="var(--color-income)"
              radius={[5, 5, 0, 0]}
            />
            <Bar
              dataKey="expense"
              fill="var(--color-expense)"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      )}
    </Panel>
  );
}
