// app/dashboard/components/IncomeExpenseBarChart.tsx
"use client"; // This component needs to be a Client Component

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { useSession } from 'next-auth/react'; // To get the user session
import { subscribeToPastWeekTransactions } from '@/utils/firebase'; // Import new function
import { Loader2, Info } from 'lucide-react'; // For loading and info icons
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "@/components/ui/chart";
import { currencySymbols } from '@/utils/currencies';

// Define the interface for the data structure (same as in firestore.ts)
interface DailyFinancialData {
  date: string; // MM-DD format for chart display, YYYY-MM-DD internally
  income: number;
  expense: number;
}

const chartConfig = {
  income: {
    label: "Income",
    color: "var(--destructive)", // Use HSL for Tailwind compatibility
  },
  expense: {
    label: "Expense",
    color: "var(--destructive)", // Use HSL for Tailwind compatibility
  },
} satisfies ChartConfig;

export function PastWeekChart({currency, exchangeRates}: {currency: string, exchangeRates: Record<string,number>}) { // Renamed from IncomeExpenseBarChart to PastWeekChart as per your query
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [chartData, setChartData] = useState<DailyFinancialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRangeLabel, setDateRangeLabel] = useState(''); // For displaying date range

  const getCurrencySymbol = (currencyCode:string) => {
    if (currencySymbols[currencyCode as keyof typeof currencySymbols]) {
      return currencySymbols[currencyCode as keyof typeof currencySymbols];
    }
    else return currencyCode
  };

  useEffect(() => {
    // If session is still loading or user is not available, handle early exit
    if (status === 'loading' || !userId) {
      setLoading(true); // Keep loading state if session is loading
      if (status === 'unauthenticated' && !userId) {
        setError("Please log in to view financial overview.");
        setLoading(false); // Stop loading if unauthenticated
      } else {
        setError(""); // Clear previous error if userId becomes null while loading
      }
      return;
    }

    setError(""); // Clear any previous errors if we're proceeding with a user
    setLoading(true); // Set loading true while waiting for the first snapshot

    // Subscribe to daily income/expenses for the last 7 days
    const unsubscribe = subscribeToPastWeekTransactions(
      userId,
      7,
      (data) => {
        setChartData(data);

        // Determine date range label based on the fetched data
        if (data.length > 0) {
          const firstDate = new Date(data[0].date); // Use fullDate from the data
          const lastDate = new Date(data[data.length - 1].date); // Use fullDate from the data
          
          const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
          setDateRangeLabel(`${dateFormatter.format(firstDate)} - ${dateFormatter.format(lastDate)}`);
        } else {
          setDateRangeLabel('');
        }
        setLoading(false); // Data received, stop loading
      },
      exchangeRates
    );

    // Cleanup function: unsubscribe when component unmounts or dependencies change
    return () => {
      unsubscribe();
    };
  }, [userId, status,exchangeRates]); // Re-run effect if userId or auth status changes

  if (loading) {
    return (
      <Card className="dark:bg-gray-800 h-full flex items-center justify-center">
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
                tickFormatter={(value) => value.slice(3, 5)+'/'+value.slice(0,2)} // Example: "MM-DD"
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
                fill="var(--constructive)"
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
