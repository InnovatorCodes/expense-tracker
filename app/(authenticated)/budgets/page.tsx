"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { BudgetFloatingButton } from "@/components/floating-action-button";
import BudgetsList from "@/components/budget-list";
import BudgetModal from "@/components/add-budget-modal";
import { Toaster } from "sonner";
import { AlertCircle } from "lucide-react";
import { useExchangeRates } from "@/providers/exchange-rates-provider";

const BudgetsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { exchangeRates } = useExchangeRates();

  const { data: session } = useSession(); // Get session data and status from Auth.js
  const userId = session?.user?.id;

  const handleCreateBudgetClick = () => {
    setIsModalOpen(true);
  };

  const handleBudgetSuccess = () => {
    // Optionally show a toast notification here
    setIsModalOpen(false); // Close modal on success
  };
  if (!userId) {
    console.warn("TransactionsPage accessed by unauthenticated user.");
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-red-100 rounded-lg text-red-700 dark:bg-red-900/20 dark:text-red-300 shadow-lg">
          <AlertCircle className="h-10 w-10 mx-auto mb-4" />
          <p className="font-semibold text-xl mb-2">Not Logged In</p>
          <p className="text-md">Please log in to view your transactions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Your Budgets
      </h1>
      <BudgetsList currency={"INR"} exchangeRates={exchangeRates} />
      {/* Floating Action Button */}
      <BudgetFloatingButton onAddBudget={handleCreateBudgetClick} />

      {/* Transaction Modal (conditionally rendered) */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleBudgetSuccess}
        currency={"INR"}
      />
      <Toaster />
    </div>
  );
};

export default BudgetsPage;
