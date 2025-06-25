// app/transactions/page.tsx
// This is a Server Component, responsible for orchestrating the Transactions view.
"use client";

import React, {useEffect,useState} from 'react';
import { useSession } from 'next-auth/react';
import FloatingActionButton from '@/components/floating-action-button'; // New FAB component
import TransactionModal from '@/components/transaction-modal'; // New Modal component
import TransactionList from '@/components/transactions-list';
import BalanceCard from '@/components/balance-card';
import { getUserDefaultCurrency } from '@/utils/firebase'; // Import the function to fetch default currency

import { TransactionType } from '@/types/transaction'; // Import TransactionType
// Mark as client component as it contains interactive elements and state


const TransactionsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedTransactionType, setSelectedTransactionType] = React.useState<TransactionType>('expense');
  const [currency, setCurrency] = useState("INR");

  const { data: session} = useSession(); // Get session data and status from Auth.js
  const userId = session?.user?.id;

  const handleAddTransactionClick = (type: TransactionType) => {
    setSelectedTransactionType(type);
    setIsModalOpen(true);
  };

  const handleTransactionSuccess = () => {
    // Optionally show a toast notification here
    setIsModalOpen(false); // Close modal on success
  };

  useEffect(()=>{
      const fetchDefaultCurrency = async () => {
        if (userId) {
          try {
            await getUserDefaultCurrency(userId).then(currency=>setCurrency(currency || "INR"));
            // You can use the default currency as needed, e.g., in a context or state
          } catch (error) {
            console.error("Failed to fetch default currency:", error);
          }
        }
      };
      fetchDefaultCurrency();
    },[userId])

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Your Transactions</h1>
      <BalanceCard currency={currency} />
      <TransactionList currency={currency} />
      {/* Floating Action Button */}
      <FloatingActionButton onAddTransaction={handleAddTransactionClick} />

      {/* Transaction Modal (conditionally rendered) */}
      <TransactionModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialType={selectedTransactionType}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
};

export default TransactionsPage;
