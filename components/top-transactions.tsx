// app/dashboard/components/TopTransactions.tsx
//import { Plane, Home, Briefcase, Ellipsis } from 'lucide-react';
//import Link from 'next/link';
// components/TopTransactionsByAmount.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { subscribeToTopTransactions } from "@/utils/firebase";
import { Transaction } from "@/types/transaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Info } from "lucide-react";
import { categoryIcons } from "@/utils/categories";
import Link from "next/link";

const TopTransactionsByAmount = ({ currency }: { currency: string }) => {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [topTransactions, setTopTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // If session is still loading or user is not available, handle early exit
    if (status === "loading" || !userId) {
      setLoading(true); // Keep loading state if session is loading
      if (status === "unauthenticated" && !userId) {
        setError("Please log in to view top transactions.");
        setLoading(false); // Stop loading if unauthenticated
      } else {
        setError(""); // Clear previous error if userId becomes null while loading
      }
      return;
    }

    setError(""); // Clear any previous errors if we're proceeding with a user
    setLoading(true); // Set loading true while waiting for the first snapshot

    // Subscribe to top transactions (default limit is 3)
    const unsubscribe = subscribeToTopTransactions(
      userId,
      (transactions) => {
        setTopTransactions(transactions);
        setLoading(false); // Data received, stop loading
      },
      3, // Limit to top 3 transactions
    );

    // Cleanup function: unsubscribe when component unmounts or dependencies change
    return () => {
      unsubscribe();
    };
  }, [userId, status]); // Re-run effect if userId or auth status changes

  const getCurrencySymbol = () => {
    switch (currency) {
      case "INR":
        return "₹";
      case "USD":
        return "$";
      default:
        return currency;
    }
  };

  if (loading) {
    return (
      <Card className="dark:bg-gray-800 h-full flex items-center justify-center">
        <CardContent className="p-6 text-center text-gray-500 dark:text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
          <p>Loading top transactions...</p>
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
    <Card className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md h-full flex flex-col gap-0">
      <CardHeader className="p-0">
        <CardTitle className="mb-4 flex">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mr-auto ">
            Top Transactions of {new Date().getFullYear()}
          </h2>
          <Link
            href="/transactions"
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            View All
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto pr-2">
        {topTransactions.length === 0 ? (
          <div className="text-center p-8 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 rounded-md">
            <Info className="h-8 w-8 mx-auto mb-3" />
            <p className="font-semibold">
              No transactions found for this year.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {topTransactions.map((t) => {
              const Icon = categoryIcons[t.category];
              return (
                <div
                  key={t.id}
                  className={`flex items-center justify-between p-3 rounded-lg shadow-sm border
                  bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600 
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
                      className={`font-semibold text-lg ${
                        t.type === "expense"
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {getCurrencySymbol()}
                      {t.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopTransactionsByAmount;
