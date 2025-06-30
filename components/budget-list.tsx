// components/TransactionList.tsx
// This is a client component that displays all transactions (income and expenses)
// for the authenticated user, fetched in real-time from Firestore.

"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react'; // Auth.js client provider
import { subscribeToBudgets, deleteBudget, pinBudget, getPinnedBudgetId } from '@/utils/firebase'; // Import updated Firestore functions
import { Budget } from '@/types/budget'; // Import the Transaction interface
import { currencySymbols } from '@/utils/currencies';
// Shadcn/ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {Trash2, Info,Loader2,Edit, Pin } from 'lucide-react'
import { categoryIcons } from '@/utils/categories';
import { Button } from './ui/button';
import EditBudgetModal from './edit-budget-modal';


const BudgetsList = ({currency,exchangeRates}: {currency:string,exchangeRates: Record<string, number>}) => {
  const { data: session, status } = useSession(); // Get session data and status from Auth.js
  const userId = session?.user?.id; // The user ID from Auth.js session

  const [categoryExpenses, setCategoryExpenses]=useState<{ [key: string]: number }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editBudget, setEditBudget]=useState<Budget | null>(null)
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinnedBudgetId, setPinnedBudgetId]=useState("");

  const getCurrencySymbol = (currencyCode:string) => {
      if (currencySymbols[currencyCode as keyof typeof currencySymbols]) {
        return currencySymbols[currencyCode as keyof typeof currencySymbols];
      }
      else return currencyCode
    };

  useEffect(()=>{
    if(userId) getPinnedBudgetId(userId, (budgetId)=>setPinnedBudgetId(budgetId))
  },[userId])

  // Subscribe to real-time transaction updates
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (userId && status === 'authenticated') {
      setLoading(true);
      subscribeToBudgets(
        userId, 
        (fetchedBudgets) => {
          setBudgets(fetchedBudgets);
          setLoading(false);
        },
        exchangeRates,
        (categoryExpenses)=>{
          setCategoryExpenses(categoryExpenses)
        }
      ).then((unsub) => {
        unsubscribe = unsub;
      });
    } 
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId, status,exchangeRates]); // Re-run effect if userId or authentication status changes

  const handlePinBudget=(budgetId: string)=>{
    if(pinnedBudgetId==""){
      setPinnedBudgetId(budgetId);
      if(userId) pinBudget(userId,budgetId);
    }
    else{
      setPinnedBudgetId("");
      if(userId) pinBudget(userId,"");
    }
  }

  const handleEditBudget=(budgetId:string)=>{
    const editBudget=budgets.find((budget)=>budget.id==budgetId)
    if(editBudget)
    setEditBudget(editBudget)
    setIsModalOpen(true);
  }
  const handleBudgetSaved=()=>{
    setIsModalOpen(false);
  }

  const handleDeleteBudget = async (budgetId: string) => {
    if (!userId) {
      console.warn("User not authenticated for deletion.");
      // TODO: Display user-friendly message (e.g., toast)
      return;
    }
    try {
      await deleteBudget(userId, budgetId);
      // No need to manually update state, onSnapshot will handle it.
    } catch (e) {
      console.error("Failed to delete transaction:", e);
      // TODO: Display user-friendly error message
    }
  };

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
          <CardTitle className="text-xl font-bold">All Budgets</CardTitle>
          <CardDescription >
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {budgets.length === 0 ? (
            <div className="text-center p-8 rounded-md">
              <Info className="h-8 w-8 mx-auto mb-3" />
              <p className="font-semibold">No budgets added yet.</p>
              <p className="text-sm">Use the &apos;+&apos; button to add your first budget!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {budgets.map((budget) => {
                const Icon=categoryIcons[budget.category];
                const expense=categoryExpenses[budget.category]?categoryExpenses[budget.category]:0;
                const percentage=expense/budget.amount*100;
                return (
                <Card
                  key={budget.id}
                  className='gap-0 bg-gray-100 dark:bg-gray-700'
                >
                  <div className="px-6 flex items-center gap-2">
                      <CardTitle className="text-xl font-bold capitalize flex items-center gap-2 mr-auto">
                        <Icon />{budget.category}
                      </CardTitle>
                      
                      <div className="flex items-center space-x-3">
                          <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePinBudget(budget.id)} // Placeholder for pin logic
                          className="text-black dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-600"
                          aria-label={`Pin Budget for ${budget.category} category`}
                          >
                            <Pin className="h-5 w-5" fill={pinnedBudgetId==budget.id ? "currentColor" : "none"} />
                          </Button>
                          <Button
                          variant="ghost" // Use a ghost variant for a subtle button
                          size="sm" // Small size
                          onClick={() => handleEditBudget(budget.id)} // Placeholder for future edit logic
                          className="flex items-center justify-center text-black dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-600"
                          aria-label={`Edit Budget for ${budget.category} category`}
                          >
                          <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteBudget(budget.id)}
                          className="text-black dark:text-gray-300 hover:text-red-600  dark:hover:text-red-600"
                          aria-label={`Delete Budget for ${budget.category} category`}
                          >
                          <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                  </div>
                  <CardContent className="pt-2">
                    {budget.amount !== undefined && (
                        <div>
                          <div className="flex items-center justify-between text-gray-800 text-base mb-1">
                            <span className="font-medium text-black dark:text-white">Used:</span>
                            <span className="ml-2 text-black dark:text-white font-semibold">
                              {getCurrencySymbol(currency)+expense?.toFixed(2)} / {getCurrencySymbol(currency)+budget.amount.toFixed(2)}
                            </span>
                          </div>
                          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white dark:bg-gray-200">
                            <div 
                              className={`h-full rounded-full  bg-indigo-600 transition-all duration-300 ease-in-out`} 
                              style={{width: `${Math.max(0, Math.min(100, percentage))}%`}}>
                            </div>
                          </div>
                          <span className="text-xs text-black dark:text-white mt-1 block text-right">
                            {percentage.toFixed(2) || 0}% Used
                          </span>
                        </div>
                      )}
                      {budget.amount === undefined && (
                        <p className="text-gray-500 italic text-sm">No monthly budget amount set.</p>
                      )}
                  </CardContent>
                </Card>
              )})}
            </div>
          )}
        </CardContent>
      </Card>
      <EditBudgetModal
      isOpen={isModalOpen}
      onClose={()=>setIsModalOpen(false)}
      budget={editBudget}
      onSuccess={handleBudgetSaved}
      currency={currency} />
    </>
  );
};

export default BudgetsList;
