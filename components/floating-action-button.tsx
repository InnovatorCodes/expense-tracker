// components/FloatingActionButton.tsx
"use client";

import React, { useState } from "react";
import { Plus, ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionType } from "@/types/transaction"; // Import TransactionType

interface FloatingActionButtonProps {
  onAddTransaction: (type: TransactionType) => void; // Callback to open form with specific type
}

export const TransactionFloatingButton: React.FC<FloatingActionButtonProps> = ({
  onAddTransaction,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const handleAddTransactionClick = (type: TransactionType) => {
    onAddTransaction(type);
    setShowOptions(false); // Close options after selection
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end mb-0">
      {showOptions && (
        <div className="flex flex-col space-y-3 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Button
            onClick={() => handleAddTransactionClick("income")}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full px-4 py-2 shadow-lg transition-all duration-200 ease-in-out hover:scale-105"
          >
            <ArrowUpCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Add Income</span>
          </Button>
          <Button
            onClick={() => handleAddTransactionClick("expense")}
            className="flex items-center space-x-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white rounded-full px-4 py-2 shadow-lg transition-all duration-200 ease-in-out hover:scale-105"
          >
            <ArrowDownCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Add Expense</span>
          </Button>
        </div>
      )}
      <Button
        onClick={toggleOptions}
        className={`h-12 w-12 rounded-full text-white shadow-xl flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-110 ${showOptions ? "bg-gray-600 rotate-45" : "bg-indigo-600 hover:bg-indigo-700"}`}
        aria-label="Add new transaction"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

export const BudgetFloatingButton = ({
  onAddBudget,
}: {
  onAddBudget: () => void;
}) => {
  const handleClick = () => {
    onAddBudget();
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end mb-0">
      <Button
        onClick={handleClick}
        className="h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-110"
        aria-label="Add new transaction"
      >
        <Plus className="h-8 w-8" />
      </Button>
    </div>
  );
};

interface DashboardActionButtonProps {
  onAddTransaction: (type: TransactionType) => void; // Callback to open form with specific type
  onAddBudget: () => void;
}

export const DashboardFloatingButton: React.FC<DashboardActionButtonProps> = ({
  onAddTransaction,
  onAddBudget,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const handleAddTransactionClick = (type: TransactionType) => {
    onAddTransaction(type);
    setShowOptions(false); // Close options after selection
  };

  const handleAddBudgetClick = () => {
    onAddBudget();
    setShowOptions(false);
  };
  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      {showOptions && (
        <div className="flex flex-col space-y-3 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Button
            onClick={() => handleAddTransactionClick("income")}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full px-4 py-2 shadow-lg transition-all duration-200 ease-in-out hover:scale-105"
          >
            <ArrowUpCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Add Income</span>
          </Button>
          <Button
            onClick={() => handleAddTransactionClick("expense")}
            className="flex items-center space-x-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white rounded-full px-4 py-2 shadow-lg transition-all duration-200 ease-in-out hover:scale-105"
          >
            <ArrowDownCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Add Expense</span>
          </Button>
          <Button
            onClick={() => handleAddBudgetClick()}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full px-4 py-2 shadow-lg transition-all duration-200 ease-in-out hover:scale-105"
          >
            <Wallet className="h-4 w-4" />
            <span className="text-sm font-medium">Add Budget</span>
          </Button>
        </div>
      )}
      <Button
        onClick={toggleOptions}
        className={`h-12 w-12 rounded-full text-white shadow-xl flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-110 ${showOptions ? "bg-gray-600 rotate-45" : "bg-indigo-600 hover:bg-indigo-700"}`}
        aria-label="Toggle options"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};
