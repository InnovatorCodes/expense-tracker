"use client";

import { Pie, PieChart } from "recharts";
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
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { formatMoney } from "@/lib/money";

const COLORS = [
  "#10B981",
  "#F43F5E",
  "#3B82F6",
  "#F59E0B",
  "#8B5CF6",
  "#06B6D4",
  "#D946EF",
  "#84CC16",
  "#E11D48",
  "#14B8A6",
];
const MAX_SLICES = 9;

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
  // Largest categories first; anything beyond MAX_SLICES is grouped as "Other".
  const sorted = data
    .filter((d) => d.amount > 0)
    .sort((a, b) => b.amount - a.amount);
  const slices = sorted.slice(0, MAX_SLICES).map((d, i) => ({
    name: d.category,
    amount: d.amount,
    fill: COLORS[i % COLORS.length],
  }));
  const rest = sorted.slice(MAX_SLICES).reduce((s, d) => s + d.amount, 0);
  if (rest > 0) {
    slices.push({
      name: "Other",
      amount: rest,
      fill: COLORS[MAX_SLICES % COLORS.length],
    });
  }
  const chartConfig: ChartConfig = Object.fromEntries(
    slices.map((s) => [s.name, { label: s.name, color: s.fill }]),
  );

  return (
    <Card className="flex flex-col shadow-xl rounded-lg">
      <CardHeader className="pb-0">
        <CardTitle className="text-xl font-bold">
          Expenses for {monthLabel}
        </CardTitle>
        <CardDescription>Categorized spending overview</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 px-4">
        {slices.length === 0 ? (
          <div className="flex flex-col items-center p-8 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md m-4">
            <Info className="h-8 w-8 mb-3" />
            <p className="font-semibold">
              No expenses recorded for this month.
            </p>
            <p className="text-sm">
              Add some transactions to see your spending breakdown!
            </p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[340px] pb-0"
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
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                outerRadius="75%"
                stroke="var(--card)"
                strokeWidth={2}
              />
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="flex-wrap gap-2"
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
