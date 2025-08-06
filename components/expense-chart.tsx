"use client"; // This component needs to be a Client Component to use hooks

import React, { useState, useEffect } from "react";
import { Pie, PieChart } from "recharts";
import { useSession } from "next-auth/react"; // To get the user session
// Updated import: will use getMonthlyCategorizedExpenses instead of subscribeToMonthlyCategorizedExpenses
import { subscribeToMonthlyCategorizedExpenses } from "@/utils/firebase"; // Updated import
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Loader2, Info } from "lucide-react"; // Added RefreshCw for refresh button

// Define the structure for aggregated chart data
interface CategoryExpenseData {
  name: string;
  amount: number;
  fill: string; // Color for the pie slice
}

// Function to generate consistent colors for categories
const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
  "var(--chart-9)",
  "var(--chart-10)",
];

export function ExpenseChart({
  currency,
  exchangeRates,
}: {
  currency: string;
  exchangeRates: Record<string, number>;
}) {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [chartData, setChartData] = useState<CategoryExpenseData[]>([]);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [currentMonthName, setCurrentMonthName] = useState("");

  const getCurrencySymbol = () => {
    switch (currency) {
      case "INR":
        return "₹";
      case "USD":
        return "$";
      default:
        return "";
    }
  };

  useEffect(() => {
    // Clear previous errors if userId becomes available
    setError("");

    const now = new Date();
    setCurrentMonthName(now.toLocaleString("default", { month: "long" }));
    setLoading(true);
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // Month is 1-indexed

    setLoading(true); // Set loading true while waiting for first snapshot
    if (userId) {
      const unsubscribe = subscribeToMonthlyCategorizedExpenses(
        userId,
        currentYear,
        currentMonth,
        (categorizedExpenses) => {
          // --- Logic to group categories beyond 9 into 'Other' ---
          const categoryEntries = Object.entries(categorizedExpenses);

          // Sort by amount in descending order to get top categories
          categoryEntries.sort(([, amountA], [, amountB]) => amountB - amountA);

          const topCategories: CategoryExpenseData[] = [];
          let otherAmount = 0;
          const maxVisibleCategories = 9; // Number of top categories to display before grouping

          categoryEntries.forEach(([category, amount], index) => {
            if (index < maxVisibleCategories && amount > 0) {
              // Only include categories with non-zero amounts
              topCategories.push({
                name: category,
                amount: amount,
                fill: COLORS[index % COLORS.length], // Assign a color
              });
            } else {
              otherAmount += amount; // Sum remaining into 'Other'
            }
          });

          if (otherAmount > 0) {
            topCategories.push({
              name: "Other",
              amount: otherAmount,
              fill: COLORS[maxVisibleCategories % COLORS.length], // Assign a color for 'Other'
            });
          }

          // Create chartConfig dynamically based on the newChartData
          const newChartConfig: ChartConfig = topCategories.reduce(
            (acc, item) => {
              acc[item.name] = {
                label: item.name,
                color: item.fill,
              };
              return acc;
            },
            {} as ChartConfig,
          );

          setChartData(topCategories);
          setChartConfig(newChartConfig);
          setLoading(false); // Data received, stop loading
        },
        exchangeRates,
      );
      return () => {
        unsubscribe();
      };
    } else {
      setChartData([]);
      setChartConfig({});
    }
    // Return the unsubscribe function for cleanup
  }, [userId, status, exchangeRates]);

  // Function to fetch and process categorized expenses

  if (loading) {
    return (
      <Card className="flex flex-col bg-gray-800 h-full items-center justify-center">
        <CardContent className="p-6 text-center text-gray-500 dark:text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
          <p>Loading expenses chart...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex flex-col bg-gray-800 h-full items-center justify-center">
        <CardContent className="text-center p-4 bg-red-100 rounded-lg text-red-700 dark:bg-red-900/20 dark:text-red-300">
          <p className="font-semibold">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col shadow-xl rounded-lg">
      <CardHeader className="items-center pb-0">
        <div className="flex justify-between w-full items-center">
          <CardTitle className="text-xl font-bold ">
            Expenses for {currentMonthName} {new Date().getFullYear()}
          </CardTitle>
        </div>
        <CardDescription>Categorized spending overview</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 px-4">
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center p-8 text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md m-4">
            <Info className="h-8 w-auto mb-3" />
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
            className="[&_.recharts-pie-label-text]:fill-foreground mx-auto max-h-[300px] pb-0"
          >
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, name) => [
                      `${name as string}: ${getCurrencySymbol()}${parseFloat(value as string).toFixed(2)}`,
                    ]}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="amount"
                label={({ payload, percent }) =>
                  `${(percent * 100).toFixed(0)}%${payload.value ? ` (${payload.value})` : ""}`
                }
                nameKey="name"
                outerRadius={"80%"}
              />
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
