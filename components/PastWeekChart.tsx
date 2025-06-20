"use client"

import { Bar, BarChart, XAxis } from "recharts"

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

export const description = "A multiple bar chart"

const chartData = [
  { date: "14/6", income: 186, expense: 80 },
  { date: "15/6", income: 305, expense: 200 },
  { date: "16/6", income: 237, expense: 120 },
  { date: "17/6", income: 73, expense: 190 },
  { date: "18/6", income: 209, expense: 130 },
  { date: "19/6", income: 214, expense: 140 },
]

const chartConfig = {
  income: {
    label: "Income",
    color: "var(--chart-2)",
  },
  expense: {
    label: "Expense",
    color: "var(--destructive)",
  },
} satisfies ChartConfig

export function PastWeekChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Past Week</CardTitle>
        <CardDescription>June 14 - June 19</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData} margin={{bottom:20}}>
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="income" fill="var(--color-income)" radius={4} />
            <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
