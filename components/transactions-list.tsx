// components/TransactionList.tsx
// This is a client component that displays all transactions (income and expenses)
// for the authenticated user, fetched in real-time from Firestore.

"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react"; // Auth.js client provider
import { subscribeToTransactions, deleteTransaction } from "@/utils/firebase"; // Import updated Firestore functions
import { Transaction } from "@/types/transaction"; // Import the Transaction interface
import EditTransactionModal from "./edit-transaction-modal";
import { toast } from "sonner";
// Shadcn/ui components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Trash2,
  Info,
  Loader2,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { categoryIcons } from "@/utils/categories";
import { currencySymbols } from "@/utils/currencies";

const TransactionList = ({
  currency,
  exchangeRates,
}: {
  currency: string;
  exchangeRates: Record<string, number>;
}) => {
  const { data: session, status } = useSession(); // Get session data and status from Auth.js
  const userId = session?.user?.id; // The user ID from Auth.js session

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(
    null,
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getCurrencySymbol = (currencyCode: string) => {
    if (currencySymbols[currencyCode as keyof typeof currencySymbols]) {
      return currencySymbols[currencyCode as keyof typeof currencySymbols];
    } else return currencyCode;
  };

  const getMonthName = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { month: "long" };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };

  // Subscribe to real-time transaction updates
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (userId && status === "authenticated") {
      setLoadingTransactions(true);
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
      unsubscribe = subscribeToTransactions(
        userId,
        startDate,
        endDate,
        (fetchedTransactions) => {
          setTransactions(fetchedTransactions);
          setLoadingTransactions(false);
        },
      );
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId, status, currentMonth]); // Re-run effect if userId or authentication status changes

  const handlePreviousMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = new Date(
        prevMonth.getFullYear(),
        prevMonth.getMonth() - 1,
        1,
      );
      return newMonth;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = new Date(
        prevMonth.getFullYear(),
        prevMonth.getMonth() + 1,
        1,
      );
      return newMonth;
    });
  };

  const handleEditTransaction = (transactionId: string) => {
    const editTransaction = transactions.find(
      (transaction) => transaction.id == transactionId,
    );
    if (editTransaction) setEditTransaction(editTransaction);
    setIsModalOpen(true);
  };
  const handleTransactionSaved = () => {
    setIsModalOpen(false);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!userId) {
      console.warn("User not authenticated for deletion.");
      return;
    }
    try {
      await deleteTransaction(userId, transactionId, exchangeRates);
      toast.success("Transaction deleted successfully");
    } catch (e) {
      console.error("Failed to delete transaction:", e);
      toast.error("Failed to delete transaction");
    }
  };

  if (status === "loading" || loadingTransactions) {
    return (
      <Card className="dark:bg-gray-800">
        <CardContent className="p-6 text-center text-gray-500 dark:text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          Loading transactions...
        </CardContent>
      </Card>
    );
  }

  if (status === "unauthenticated" || !userId) {
    return (
      <Card className="dark:bg-gray-800">
        <CardContent className="text-center p-8 bg-red-100 rounded-lg text-red-700 dark:bg-red-900/20 dark:text-red-300">
          <p className="font-semibold mb-2">
            Please log in to view your transactions.
          </p>
          <p className="text-sm">
            Transaction data is securely stored per user.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full dark:bg-gray-800 shadow-lg rounded-lg border-none">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 space-y-4 sm:space-y-0">
          <div>
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Transactions
            </CardTitle>
            <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
              Income and expenses for the selected month.
            </CardDescription>
          </div>
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg p-1 self-end sm:self-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousMonth}
              className="h-8 w-8 hover:bg-white dark:hover:bg-gray-600 rounded-md"
              aria-label="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 min-w-[100px] text-center select-none">
              {getMonthName(currentMonth) + " " + currentMonth.getFullYear()}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="h-8 w-8 hover:bg-white dark:hover:bg-gray-600 rounded-md"
              aria-label="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center p-8 text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md">
              <Info className="h-8 w-8 mx-auto mb-3" />
              <p className="font-semibold">No transactions recorded yet.</p>
              <p className="text-sm">
                Use the &apos;+&apos; button to add your first income or
                expense!
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {transactions.map((transaction) => {
                const Icon = categoryIcons[transaction.category];
                return (
                  <li
                    key={transaction.id}
                    className={`flex items-center justify-between p-3 rounded-lg shadow-sm border
                    ${transaction.type === "income"
                        ? "bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-800/50"
                        : "bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-800/50"
                      }
                    transition-all duration-200 ease-in-out hover:shadow-md hover:scale-[1.01]`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                        <Icon size={18} className={transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} />
                      </div>
                      <div className="flex flex-col">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                          {transaction.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {transaction.category} •{" "}
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                        {transaction.notes && (
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">
                            {transaction.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-base font-bold whitespace-nowrap
                        ${transaction.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
                      `}
                      >
                        {transaction.type === 'expense' ? '-' : '+'}{getCurrencySymbol(transaction.currency)}{transaction.amount.toFixed(2)}
                      </span>
                      <div className="flex space-x-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditTransaction(transaction.id)}
                          className="h-8 w-8 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          aria-label={`Edit ${transaction.name}`}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="h-8 w-8 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          aria-label={`Delete ${transaction.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
      <EditTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={editTransaction}
        onSave={handleTransactionSaved}
        currency={currency}
        exchangeRates={exchangeRates}
      />
    </>
  );
};

export default TransactionList;
