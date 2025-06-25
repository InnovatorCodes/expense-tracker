// app/dashboard/components/IncomeExpenseBarChart.tsx
"use client"; // This component needs to be a Client Component

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { useSession } from 'next-auth/react'; // To get the user session
import { getPastWeekIncomeExpenses, getUserDefaultCurrency } from '@/utils/firebase'; // Import new function
import { Loader2, Info, RefreshCw } from 'lucide-react'; // For loading and info icons
import { Button } from '@/components/ui/button'; // Assuming you have a Button component
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "@/components/ui/chart";

// Define the interface for the data structure (same as in firestore.ts)
interface DailyFinancialData {
  date: string; // MM-DD format for chart display, YYYY-MM-DD internally
  income: number;
  expense: number;
}

const chartConfig = {
  income: {
    label: "Income",
    color: "var(--chart-2)", // Use HSL for Tailwind compatibility
  },
  expense: {
    label: "Expense",
    color: "var(--destructive)", // Use HSL for Tailwind compatibility
  },
} satisfies ChartConfig;

// Helper to get currency symbol
const getCurrencySymbol = (currencyCode: string) => {
  switch (currencyCode) {
    case 'INR':
      return '₹';
    case 'USD':
      return '$';
    default:
      return '';
  }
};

export function PastWeekChart() { // Renamed from IncomeExpenseBarChart to PastWeekChart as per your query
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [chartData, setChartData] = useState<DailyFinancialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currency, setCurrency] = useState('USD'); // User's default currency
  const [dateRangeLabel, setDateRangeLabel] = useState(''); // For displaying date range
  const [refreshTrigger, setRefreshTrigger] = useState(0); // State to trigger manual refresh

  // Fetch the user's default currency
  useEffect(() => {
    const fetchCurrency = async () => {
      if (userId) {
        const userCurrency = await getUserDefaultCurrency(userId);
        if (userCurrency) {
          setCurrency(userCurrency);
        }
      }
    };
    fetchCurrency();
  }, [userId,refreshTrigger]);

  const fetchDailyData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (userId && status === 'authenticated') {
        const data = await getPastWeekIncomeExpenses(userId, 7); // Fetch last 7 days
        setChartData(data);

        // Determine date range label
        if (data.length > 0) {
          const firstDate = new Date(new Date().getFullYear(), parseInt(data[0].date.split('-')[0]) - 1, parseInt(data[0].date.split('-')[1]));
          const lastDate = new Date(new Date().getFullYear(), parseInt(data[data.length - 1].date.split('-')[0]) - 1, parseInt(data[data.length - 1].date.split('-')[1]));
          
          const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
          setDateRangeLabel(`${dateFormatter.format(firstDate)} - ${dateFormatter.format(lastDate)}`);
        } else {
          setDateRangeLabel('');
        }
      } else if (status === 'unauthenticated' || !userId) {
        setChartData([]);
        setError("Please log in to view financial overview.");
        setDateRangeLabel('');
      }
    } catch (err) {
      console.error("Failed to fetch daily financial data:", err);
      setError("Failed to load past week data.");
      setChartData([]);
      setDateRangeLabel('');
    } finally {
      setLoading(false);
    }
  }, [userId, status]); // Added refreshTrigger to dependencies

  useEffect(() => {
    // Only fetch if session status is not 'loading'
    if (status !== 'loading') {
      fetchDailyData();
    }
  }, [status, fetchDailyData]);

  const handleRefreshClick = () => {
    setRefreshTrigger(prev => prev + 1); // Increment to trigger fetchDailyData
  };

  if (loading) {
    return (
      <Card className="dark:bg-gray-800 animate-pulse h-full flex items-center justify-center">
        <CardContent className="p-6 text-center text-gray-500 dark:text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
          <p>Loading past week data...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="dark:bg-gray-800 h-full flex items-center justify-center">
        <CardContent className="text-center p-4 bg-red-100 rounded-lg text-red-700 dark:bg-red-900/20 dark:text-red-300">
          <p className="font-semibold">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white dark:bg-gray-800 shadow-xl rounded-lg h-full flex flex-col">
      <CardHeader className="pb-0">
        <div className="flex justify-between w-full items-center">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Last 7 Days Overview
          </CardTitle>
          <Button
            onClick={handleRefreshClick}
            variant="outline"
            size="icon"
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            disabled={loading || status === 'loading'}
            aria-label="Refresh chart data"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
          </Button>
        </div>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          {dateRangeLabel}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {chartData.length === 0 ? (
          <div className="text-center p-8 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 rounded-md h-full flex flex-col items-center justify-center">
            <Info className="h-8 w-8 mx-auto mb-3" />
            <p className="font-semibold">No data for the last 7 days.</p>
            <p className="text-sm">Record some transactions to see the trend.</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="w-full h-64 md:h-80 lg:h-96">
            <BarChart accessibilityLayer data={chartData} margin={{ bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-gray-600" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                className="text-xs dark:text-gray-300"
                // tickFormatter={(value) => value.slice(0, 5)} // Example: "MM-DD"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                className="text-xs dark:text-gray-300"
                tickFormatter={(value) => `${getCurrencySymbol(currency)}${value}`} // Add currency symbol to Y-axis
              />
              <ChartTooltip
                cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                content={<ChartTooltipContent
                  indicator="dashed"
                  formatter={(value,name) => {
                    let displayValue = '';
                    if (typeof value === 'number') {
                      displayValue = `${name+": "+getCurrencySymbol(currency)}${value.toFixed(2)}`;
                    } else if (typeof value === 'string') {
                      displayValue = `${name+": "+getCurrencySymbol(currency)}${value}`;
                    } 
                    const displayName = "";
                    return [displayValue, displayName];
                  }}
                />}
              />
              <ChartLegend
                content={<ChartLegendContent />}
                wrapperStyle={{ paddingTop: '10px' }}
                iconType="circle"
                formatter={(value: string) => (
                  <span className="text-gray-700 dark:text-gray-300 capitalize">{value}</span>
                )}
              />
              <Bar
                dataKey="income"
                fill="var(--chart-2)"
                name="Income"
                radius={[5, 5, 0, 0]}
              />
              <Bar
                dataKey="expense"
                fill="var(--destructive)"
                name="Expense"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
