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
import { useSession } from "next-auth/react";

import { useExchangeRates } from "@/providers/exchange-rates-provider";

const defaultCurrency = "INR";

export default function DashboardPage() {
  const {data: session } =useSession();
  const userId = session?.user?.id;

  const reloadFlag = sessionStorage.getItem('justRefreshed');

  if(reloadFlag!="true"){
    sessionStorage.setItem('justRefreshed', 'true');
    window.location.reload();
  }

  // Consume exchange rates and their loading/error states from the context
  const { exchangeRates, errorExchangeRates } = useExchangeRates();

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

  // Handle errors from exchange rates fetch (still relevant even if authenticated)
  if (errorExchangeRates) {
    toast.error(
      "Could not fetch latest exchange rates. Data may be using slightly outdated rates",
    );
  }

  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(500px,1fr))] gap-6">
        <div className="flex flex-col gap-6">
          {/* Pass defaultCurrency and exchangeRates from context */}
          <BalanceCard
            key={userId || 'unauthenticated'}
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
