// app/dashboard/components/RecentTransactions.tsx
"use client";
//import { ShoppingCart, Utensils, Car, Ellipsis } from 'lucide-react';
import { Info, Loader2 } from "lucide-react"; // Added RefreshCw and Loader2 icons
import { useSession } from "next-auth/react";
// Assuming getRecentTransactions is correctly imported from lib/firestore
import { subscribeToRecentTransactions } from "@/utils/firebase"; // Corrected import path
import Link from "next/link";
import { useState, useEffect } from "react"; // Added useCallback
import { Transaction } from "@/types/transaction";
import { categoryIcons } from "@/utils/categories";
import { currencySymbols } from "@/utils/currencies";

const RecentTransactions = () => {
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    [],
  );
  const [loading, setLoading] = useState(true); // Separate loading state for this component
  const [error, setError] = useState("");

  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    // If session is still loading or user is not available, handle early exit
    if (status === "loading" || !userId) {
      setLoading(true); // Keep loading state if session is loading
      if (status === "unauthenticated" && !userId) {
        setError("Please log in to view recent transactions.");
        setLoading(false); // Stop loading if unauthenticated
      } else {
        setError(""); // Clear previous error if userId becomes null while loading
      }
      return;
    }

    setError(""); // Clear any previous errors if we're proceeding with a user
    setLoading(true); // Set loading true while waiting for the first snapshot

    // Subscribe to recent transactions (default limit is 5)
    const unsubscribe = subscribeToRecentTransactions(
      userId,
      (transactions) => {
        setRecentTransactions(transactions || []);
        setLoading(false); // Data received, stop loading
      },
    );

    // Cleanup function: unsubscribe when component unmounts or dependencies change
    return () => {
      unsubscribe();
    };
  }, [userId, status]); // Re-run effect if userId or auth status changes. No need for refreshTrigger.

  const getCurrencySymbol = (currencyCode: string) => {
    if (currencySymbols[currencyCode as keyof typeof currencySymbols]) {
      return currencySymbols[currencyCode as keyof typeof currencySymbols];
    } else return currencyCode;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex flex-col h-full border-border dark:border-border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          Recent Transactions
        </h3>
        <div className="flex items-center space-x-2">
          <Link
            href="/transactions"
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            View All
          </Link>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pr-2">
        {" "}
        {/* Added overflow-y-auto for scrollable content */}
        {error ? (
          <div className="text-center p-4 bg-red-100 rounded-lg text-red-700 dark:bg-red-900/20 dark:text-red-300">
            <p>{error}</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin mb-3" />
            <p>Loading recent transactions...</p>
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="text-center p-8 text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md">
            <Info className="h-8 w-8 mx-auto mb-3" />
            <p className="font-semibold">No transactions recorded yet.</p>
            <p className="text-sm">Add one using the &apos;+&apos; button!</p>
          </div>
        ) : (
          <div className="space-y-4 w-full">
            {recentTransactions.map((t) => {
              const Icon = categoryIcons[t.category];
              return (
                <div
                  key={t.id}
                  className={`flex items-center justify-between p-3 rounded-lg shadow-sm border w-full 
                ${
                  t.type === "income"
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                }`}
                >
                  <div className="flex items-center gap-4">
                    <Icon />
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {t.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t.category} &bull;{" "}
                        {new Date(t.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p
                      className={`font-semibold ${t.type === "expense" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
                    >
                      {t.type == "expense" ? "-" : "+"}
                      {getCurrencySymbol(t.currency) + t.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;
