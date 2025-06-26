// components/FloatingActionButton.tsx
"use client";

import React, { useState } from 'react';
import { Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TransactionType } from '@/types/transaction'; // Import TransactionType

interface FloatingActionButtonProps {
  onAddTransaction: (type: TransactionType) => void; // Callback to open form with specific type
}

export const TransactionFloatingButton: React.FC<FloatingActionButtonProps> = ({ onAddTransaction }) => {
  const [showOptions, setShowOptions] = useState(false);

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const handleOptionClick = (type: TransactionType) => {
    onAddTransaction(type);
    setShowOptions(false); // Close options after selection
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      {showOptions && (
        <div className="flex flex-col space-y-3 mb-4">
          <Button
            onClick={() => handleOptionClick('income')}
            className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white rounded-full px-5 py-3 shadow-lg transition-all duration-200 ease-in-out"
          >
            <ArrowUpCircle className="h-5 w-5" />
            <span>Add Income</span>
          </Button>
          <Button
            onClick={() => handleOptionClick('expense')}
            className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white rounded-full px-5 py-3 shadow-lg transition-all duration-200 ease-in-out"
          >
            <ArrowDownCircle className="h-5 w-5" />
            <span>Add Expense</span>
          </Button>
        </div>
      )}
      <Button
        onClick={toggleOptions}
        className="h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-110"
        aria-label="Add new transaction"
      >
        <Plus className="h-8 w-8" />
      </Button>
    </div>
  );
};

