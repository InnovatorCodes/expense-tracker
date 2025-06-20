"use client"

import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"

export const description = "A pie chart with a label"

const chartData = [
  { name: "Food", amount: 600, fill: "var(--chart-1)" },
  { name: "Travel", amount: 400, fill: "var(--chart-2)"},
  { name: "Shopping", amount: 300, fill: "var(--chart-3)"},
  { name: "Entertainment", amount: 900, fill: "var(--chart-4)"},
  { name: "Other", amount: 500, fill: "var(--chart-5)"},
]

const chartConfig = chartData.reduce((acc, item) => {
  acc[item.name] = {
    label: item.name,
    color: item.fill,
  };
  return acc;
}, {} as ChartConfig);

export function ExpenseChart() {
  return (
    <Card className="flex flex-col bg-gray-800">
      <CardHeader className="items-center pb-0">
        <CardTitle>This Month</CardTitle>
        <CardDescription>June 2025</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[300px] pb-0 w-full mb-12"
        >
          <PieChart>
            <ChartTooltip viewBox={ {x: 0, y: 0, width: 1200, height: 1200 }} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} outerRadius={"70%"} dataKey="amount" label nameKey="name" />
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              align="right"
              verticalAlign="middle"
              layout="vertical"
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

