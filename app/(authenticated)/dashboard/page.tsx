// app/dashboard/page.tsx
"use client"
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react'; // Auth.js client provider
import BalanceCard from "@/components/balance-card";
import RecentTransactions from "@/components/recent-transactions";
import { ExpenseChart } from "@/components/expense-chart";
import { PastWeekChart } from "@/components/past-week-chart";
import DashboardBudget from '@/components/dashboard-budget';
import { getUserDefaultCurrency } from '@/utils/firebase';
import {DashboardFloatingButton} from '@/components/floating-action-button';
import TransactionModal from '@/components/add-transaction-modal';
import { TransactionType } from '@/types/transaction'; // Import TransactionType
import { Toaster } from 'sonner';
import BudgetModal from '@/components/add-budget-modal';

export default function DashboardPage() {
  const { data: session} = useSession(); // Get session data and status from Auth.js
  const userId = session?.user?.id;
  const [currency, setCurrency] = useState("INR");
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isBudgetModalOpen,setIsBudgetModalOpen]=useState(false);
  const [selectedTransactionType, setSelectedTransactionType] = useState<TransactionType>('expense');

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
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(500px,1fr))] gap-6">
        <div className="flex flex-col gap-6">
          <BalanceCard currency={currency} />
          <RecentTransactions currency={currency} />
          <DashboardBudget currency={currency} />
        </div>
        <div className="flex flex-col gap-6">
          <ExpenseChart currency={currency} />
          <PastWeekChart currency={currency} />
        </div>
      </div>
      <DashboardFloatingButton onAddTransaction={handleAddTransactionClick} onAddBudget={handleCreateBudgetClick} />
      <TransactionModal 
        isOpen={isTransactionModalOpen}
        onOpenChange={setIsTransactionModalOpen}
        onSuccess={handleSuccess}
        initialType={selectedTransactionType} 
        currency={currency}
      />
      <BudgetModal
      isOpen={isBudgetModalOpen}
      onClose={()=>setIsBudgetModalOpen}
      onSuccess={handleSuccess}
      currency={currency}
       />
      <Toaster />
    </section>
  );
}
