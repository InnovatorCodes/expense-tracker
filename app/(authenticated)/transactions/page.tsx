// app/transactions/page.tsx
"use client";

import React from "react"; // React is implicitly imported for hooks like useState/useEffect if present
import { useSession } from "next-auth/react"; // Auth.js client provider (still needed for userId for transaction list)

import { TransactionFloatingButton } from "@/components/floating-action-button"; // New FAB component
import TransactionModal from "@/components/add-transaction-modal"; // New Modal component
import TransactionList from "@/components/transactions-list";
import BalanceCard from "@/components/balance-card";
// Removed: import { getUserDefaultCurrency } from '@/utils/firebase'; // No longer fetched here
import { Toaster } from "sonner";

import { TransactionType } from "@/types/transaction"; // Import TransactionType

// Import the custom hooks to consume from the contexts
import { useExchangeRates } from "@/providers/exchange-rates-provider";
import { AlertCircle } from "lucide-react"; // Icons for loading/error states

const defaultCurrency = "INR";

const TransactionsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedTransactionType, setSelectedTransactionType] =
    React.useState<TransactionType>("expense");

  const { exchangeRates } = useExchangeRates();

  const { data: session } = useSession(); // Still needed to get userId for TransactionList
  const userId = session?.user?.id;

  const handleAddTransactionClick = (type: TransactionType) => {
    setSelectedTransactionType(type);
    setIsModalOpen(true);
  };

  const handleTransactionSuccess = () => {
    // Optionally show a toast notification here
    setIsModalOpen(false); // Close modal on success
  };

  // Handle unauthenticated user if they somehow reach this page (should be handled by layout.tsx)
  // This check serves as a final safeguard on the client side.
  if (!userId) {
    // In a server component setup, this would typically trigger a redirect
    // but here, it's a client component. If your layout.tsx ensures
    // redirection, this block might technically not be hit.
    // However, it's safer to have a fallback UI or log.
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
        Your Transactions
      </h1>
      {/* Pass defaultCurrency and exchangeRates from context */}
      <BalanceCard currency={defaultCurrency} exchangeRates={exchangeRates} />
      <TransactionList
        currency={defaultCurrency}
        exchangeRates={exchangeRates}
      />
      {/* Floating Action Button */}
      <TransactionFloatingButton onAddTransaction={handleAddTransactionClick} />

      {/* Transaction Modal (conditionally rendered) */}
      <TransactionModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialType={selectedTransactionType}
        onSuccess={handleTransactionSuccess}
        currency={defaultCurrency} // Pass default currency
        exchangeRates={exchangeRates}
      />
      <Toaster />
    </div>
  );
};

export default TransactionsPage;
