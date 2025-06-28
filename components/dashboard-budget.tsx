// components/TransactionList.tsx
// This is a client component that displays all transactions (income and expenses)
// for the authenticated user, fetched in real-time from Firestore.

"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react'; // Auth.js client provider
import { subscribeToBudgetDashboard, subscribeToMonthlyCategorizedExpenses  } from '@/utils/firebase'; // Import updated Firestore functions
import { Budget } from '@/types/budget'; // Import the Transaction interface
// Shadcn/ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info,Loader2 } from 'lucide-react'
import { categoryIcons } from '@/utils/categories';


const DashboardBudget: React.FC<{currency: string}> = ({currency}) => {
  const { data: session, status } = useSession(); // Get session data and status from Auth.js
  const userId = session?.user?.id; // The user ID from Auth.js session

  const [categoryExpenses, setCategoryExpenses]=useState<{ [key: string]: number }>({});
  const [budget, setBudget] = useState<Budget>();
  const [loading, setLoading] = useState(true);

  const getCurrencySymbol = () => {
    switch (currency) {
      case 'USD':
        return '$';
      default:
        return '₹';
    }
  }; 

  let budgetComponent;
  
  if(budget) {
    const Icon=categoryIcons[budget.category];
    const expense=categoryExpenses[budget.category]?categoryExpenses[budget.category]:0;
    const percentage=expense/budget.amount*100;
    budgetComponent=(
    <Card
    key={budget.id}
    className='gap-0 bg-gray-100 dark:bg-gray-700'
    >
        <div className="px-6 flex items-center gap-2">
            <CardTitle className="text-xl font-bold capitalize flex items-center gap-2 mr-auto">
            <Icon />{budget.category}
            </CardTitle>
        </div>
        <CardContent className="pt-2">
        {budget.amount !== undefined && (
            <div>
                <div className="flex items-center justify-between text-gray-800 text-base mb-1">
                <span className="font-medium text-black dark:text-white">Used:</span>
                <span className="ml-2 text-black dark:text-white font-semibold">
                    {getCurrencySymbol()+expense?.toFixed(2)} / {getCurrencySymbol()+budget.amount.toFixed(2)}
                </span>
                </div>
                <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white dark:bg-gray-200">
                <div 
                    className={`h-full rounded-full  bg-indigo-600 transition-all duration-300 ease-in-out`} 
                    style={{width: `${Math.max(0, Math.min(100, percentage))}%`}}>
                </div>
                </div>
                <span className="text-xs text-black dark:text-gray-400 mt-1 block text-right">
                {percentage || 0}% Used
                </span>
            </div>
            )}
            {budget.amount === undefined && (
            <p className="text-gray-500 italic text-sm">No monthly budget amount set.</p>
            )}
        </CardContent>
    </Card>
  )}

  // Subscribe to real-time transaction updates
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (userId && status === 'authenticated') {
      setLoading(true);
      subscribeToBudgetDashboard(
        userId, 
        (budget) => {
          if(budget) setBudget(budget);
          setLoading(false);
        },
      ).then((unsub) => {
        unsubscribe = unsub;
      });
    } 

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId, status]); // Re-run effect if userId or authentication status changes

  useEffect(()=>{
    const now=new Date;
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // Month is 1-indexed
     if (userId && status === 'authenticated') {
      setLoading(true);
      const unsubscribe=subscribeToMonthlyCategorizedExpenses(
        userId, 
        currentYear,
        currentMonth,
        (categoryExpenses)=>{
          setCategoryExpenses(categoryExpenses)
        }
      );
      return ()=>unsubscribe();
    } 
  },[status,userId])

  if (status === 'loading' || loading) {
    return (
      <Card className="dark:bg-gray-800">
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          Loading Budgets...
        </CardContent>
      </Card>
    );
  }

  if (status === 'unauthenticated' || !userId) {
    return (
      <Card className="dark:bg-gray-800">
        <CardContent className="text-center p-8 rounded-lg">
          <p className="font-semibold mb-2">Please log in to view your budgets.</p>
          <p className="text-sm">Budget data is securely stored per user.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Pinned Budgets</CardTitle>
          <CardDescription >
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!budget ? (
            <div className="text-center p-8 rounded-md">
              <Info className="h-8 w-8 mx-auto mb-3" />
              <p className="font-semibold">No budgets pinned yet.</p>
              <p className="text-sm">You can pin one budget from the Budgets Page</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {budgetComponent}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default DashboardBudget;
