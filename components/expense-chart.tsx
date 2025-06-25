"use client" // This component needs to be a Client Component to use hooks

import React, { useState, useEffect, useCallback } from 'react';
import { Pie, PieChart } from "recharts";
import { useSession } from 'next-auth/react'; // To get the user session
// Updated import: will use getMonthlyCategorizedExpenses instead of subscribeToMonthlyCategorizedExpenses
import { getMonthlyCategorizedExpenses } from '@/utils/firebase'; // Updated import
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
  ChartLegendContent
} from "@/components/ui/chart";
import { Loader2, Info, RefreshCw } from 'lucide-react'; // Added RefreshCw for refresh button
import { Button } from '@/components/ui/button'; // Assuming you have a Button component

// Define the structure for aggregated chart data
interface CategoryExpenseData {
  name: string;
  amount: number;
  fill: string; // Color for the pie slice
}

// Function to generate consistent colors for categories
const COLORS = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)",
  "var(--chart-5)", "var(--chart-6)", "var(--chart-7)", "var(--chart-8)",
  "var(--chart-9)", "var(--chart-10)"
];

// Helper to get currency symbol (can be moved to a utility file if used often)


export function ExpenseChart({currency}: {currency: string}) {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [chartData, setChartData] = useState<CategoryExpenseData[]>([]);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [currentMonthName, setCurrentMonthName] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0); // State to trigger manual refresh

  const getCurrencySymbol = () => {
  switch (currency) {
    case 'INR':
      return '₹';
    case 'USD':
      return '$';
    default:
      return '';
  }
};

  // Function to fetch and process categorized expenses
  const fetchCategorizedExpenses = useCallback(async () => {
    setLoading(true);
    setError("");

    if (userId && status === 'authenticated') {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // Month is 1-indexed
      setCurrentMonthName(now.toLocaleString('default', { month: 'long' }));

      try {
        // Use the one-time fetch function
        const categorizedExpenses = await getMonthlyCategorizedExpenses(userId, currentYear, currentMonth);

        // Transform the fetched data into chartData and chartConfig
        const newChartData: CategoryExpenseData[] = Object.entries(categorizedExpenses)
          .map(([category, amount], index) => ({
            name: category,
            amount: amount,
            fill: COLORS[index % COLORS.length], // Assign a color from the COLORS array
          }))
          .filter(item => item.amount > 0); // Only include categories with amount > 0

        // Create chartConfig dynamically
        const newChartConfig: ChartConfig = newChartData.reduce((acc, item) => {
          acc[item.name] = {
            label: item.name,
            color: item.fill,
          };
          return acc;
        }, {} as ChartConfig);

        setChartData(newChartData);
        setChartConfig(newChartConfig);
      } catch (err) {
        console.error("ExpenseChart: Error fetching categorized expenses:", err);
        setError("Failed to load expense chart. Please try refreshing.");
        setChartData([]);
        setChartConfig({});
      } finally {
        setLoading(false);
      }

    } else if (status === 'unauthenticated' || !userId) {
      setChartData([]);
      setChartConfig({});
      setLoading(false);
      setError("Please log in to view your expense chart.");
    } else if (status === 'loading') {
      // Still loading session, keep loading state active
    }
  }, [userId, status]); // Removed refreshTrigger as dependency

  useEffect(() => {
    // Only fetch if session status is not 'loading'
    if (status !== 'loading') {
      fetchCategorizedExpenses();
    }
  }, [status, fetchCategorizedExpenses,refreshTrigger]); // Dependencies for initial load and refresh

  const handleRefreshClick = () => {
    setRefreshTrigger(prev => (prev + 1)%2); // Increment to trigger fetchCategorizedExpenses
  };

  if (loading) {
    return (
      <Card className="flex flex-col bg-gray-800 animate-pulse h-full items-center justify-center">
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
    <Card className="flex flex-col bg-gray-800 shadow-xl rounded-lg">
      <CardHeader className="items-center pb-0">
        <div className="flex justify-between w-full items-center">
          <CardTitle className="text-xl font-bold text-gray-100">
            Expenses for {currentMonthName} {new Date().getFullYear()}
          </CardTitle>
          <Button
            onClick={handleRefreshClick}
            variant="outline"
            size="icon"
            className="text-gray-400 hover:text-gray-200 border-gray-600 hover:bg-gray-700"
            disabled={loading || status === 'loading'}
            aria-label="Refresh chart data"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
          </Button>
        </div>
        <CardDescription className="text-gray-300">Categorized spending overview</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {chartData.length === 0 ? (
          <div className="text-center p-8 text-gray-400 dark:text-gray-500 bg-gray-700 rounded-md m-4">
            <Info className="h-8 w-8 mx-auto mb-3" />
            <p className="font-semibold">No expenses recorded for this month.</p>
            <p className="text-sm">Add some transactions to see your spending breakdown!</p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="[&_.recharts-pie-label-text]:fill-foreground mx-auto max-h-[250px] pb-0"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel formatter={(value, name) => [
                  `${name as string}: ${getCurrencySymbol()}${parseFloat(value as string).toFixed(2)}`
                ]} />}
              />
              <Pie
                data={chartData}
                dataKey="amount"
                label={({ payload, percent }) =>
                  `${(percent * 100).toFixed(0)}%${payload.value ? ` (${payload.value})` : ''}`
                }
                nameKey="name"
                outerRadius={"70%"}
              />
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                layout="vertical"
                verticalAlign="middle"
                align="right"
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
