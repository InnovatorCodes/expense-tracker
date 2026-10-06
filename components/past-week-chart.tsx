"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "@/components/ui/chart";
import { formatShortDate } from "@/lib/dates";
import { currencySymbol, formatMoney } from "@/lib/money";

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
  const symbol = currencySymbol("INR");

  return (
    <Card className="w-full shadow-xl rounded-lg flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle className="text-xl font-bold">
          Last 7 Days Overview
        </CardTitle>
        <CardDescription>{range}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {!hasData ? (
          <div className="text-center p-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-md flex flex-col items-center justify-center">
            <Info className="h-8 w-8 mx-auto mb-3" />
            <p className="font-semibold">No data for the last 7 days.</p>
            <p className="text-sm">
              Record some transactions to see the trend.
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="w-full h-64 md:h-80">
            <BarChart accessibilityLayer data={data} margin={{ bottom: 8 }}>
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
                cursor={{ fill: "rgba(0,0,0,0.08)" }}
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
      </CardContent>
    </Card>
  );
}
