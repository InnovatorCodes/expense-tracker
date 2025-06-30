// app/dashboard/page.tsx
"use client";
import { useState } from "react";
// Removed: import { useSession } from 'next-auth/react'; // No longer needed for client-side auth check here

import BalanceCard from "@/components/balance-card";
import RecentTransactions from "@/components/recent-transactions";
import { ExpenseChart } from "@/components/expense-chart";
import { PastWeekChart } from "@/components/past-week-chart";
import DashboardBudget from "@/components/dashboard-budget";
import { DashboardFloatingButton } from "@/components/floating-action-button";
import TransactionModal from "@/components/add-transaction-modal";
import { TransactionType } from "@/types/transaction";
import { Toaster, toast } from "sonner";
import BudgetModal from "@/components/add-budget-modal";

import { useExchangeRates } from "@/providers/exchange-rates-provider";
import { Loader2 } from "lucide-react"; // Icons for loading/error states

const defaultCurrency = "INR";

export default function DashboardPage() {
  // Consume exchange rates and their loading/error states from the context
  const { exchangeRates, loadingExchangeRates, errorExchangeRates } =
    useExchangeRates();

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [selectedTransactionType, setSelectedTransactionType] =
    useState<TransactionType>("expense");

  const handleAddTransactionClick = (type: TransactionType) => {
    setSelectedTransactionType(type);
    setIsTransactionModalOpen(true);
  };

  const handleCreateBudgetClick = () => {
    setIsBudgetModalOpen(true);
  };

  const handleSuccess = () => {
    // Optionally show a toast notification here
    setIsTransactionModalOpen(false);
    setIsBudgetModalOpen(false); // Close modal on success
  };

  if (loadingExchangeRates) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-600 dark:text-blue-400 mb-4" />
          <p className="text-lg text-gray-700 dark:text-gray-300">
            {loadingExchangeRates && "Fetching latest exchange rates..."}
          </p>
        </div>
      </div>
    );
  }

  // Handle errors from exchange rates fetch (still relevant even if authenticated)
  if (errorExchangeRates) {
    toast.error(
      "Could not fetch latest exchange rates. Data may be using default or slightly outdated rates.",
    );
  }

  // Final check to ensure currency and rates are available before rendering main content
  // Since authentication is handled server-side, if we reach here, isAuthenticated should be true.
  // defaultCurrency will be a string (e.g., "INR") and exchangeRates will be an object.
  // We explicitly check for null to ensure data has been loaded from the providers.
  if (!exchangeRates) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-gray-500 dark:text-gray-400 mb-4" />
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Preparing your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(500px,1fr))] gap-6">
        <div className="flex flex-col gap-6">
          {/* Pass defaultCurrency and exchangeRates from context */}
          <BalanceCard
            currency={defaultCurrency}
            exchangeRates={exchangeRates}
          />
          <RecentTransactions />
          <DashboardBudget
            currency={defaultCurrency}
            exchangeRates={exchangeRates}
          />
        </div>
        <div className="flex flex-col gap-6">
          <ExpenseChart
            currency={defaultCurrency}
            exchangeRates={exchangeRates}
          />
          <PastWeekChart
            currency={defaultCurrency}
            exchangeRates={exchangeRates}
          />
        </div>
      </div>
      <DashboardFloatingButton
        onAddTransaction={handleAddTransactionClick}
        onAddBudget={handleCreateBudgetClick}
      />
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onOpenChange={setIsTransactionModalOpen}
        onSuccess={handleSuccess}
        initialType={selectedTransactionType}
        currency={defaultCurrency}
        exchangeRates={exchangeRates}
      />
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSuccess={handleSuccess}
        currency={defaultCurrency}
      />
      <Toaster />
    </section>
  );
}
