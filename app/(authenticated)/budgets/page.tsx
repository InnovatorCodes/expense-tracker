"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getUserDefaultCurrency } from "@/utils/firebase";
import { BudgetFloatingButton } from "@/components/floating-action-button";
import BudgetsList from "@/components/budget-list";
import BudgetModal from "@/components/add-budget-modal";
import { Toaster } from "sonner";

const BudgetsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currency, setCurrency] = useState("INR");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(
    {},
  );

  const { data: session } = useSession(); // Get session data and status from Auth.js
  const userId = session?.user?.id;

  useEffect(() => {
    const fetchDefaultCurrency = async () => {
      if (userId) {
        try {
          await getUserDefaultCurrency(userId).then((currency) =>
            setCurrency(currency || "INR"),
          );
          // You can use the default currency as needed, e.g., in a context or state
        } catch (error) {
          console.error("Failed to fetch default currency:", error);
        }
      }
    };
    fetchDefaultCurrency();
  }, [userId]);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${process.env.NEXT_PUBLIC_EXCHANGE_RATES_KEY}/latest/${currency}`,
        );
        const data = await response.json();
        setExchangeRates(data["conversion_rates"]);
      } catch (error) {
        console.error("Failed to fetch exchange rates:", error);
      }
    };
    fetchRates();
  }, [currency]);

  const handleCreateBudgetClick = () => {
    setIsModalOpen(true);
  };

  const handleBudgetSuccess = () => {
    // Optionally show a toast notification here
    setIsModalOpen(false); // Close modal on success
  };

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Your Budgets
      </h1>
      <BudgetsList currency={currency} exchangeRates={exchangeRates} />
      {/* Floating Action Button */}
      <BudgetFloatingButton onAddBudget={handleCreateBudgetClick} />

      {/* Transaction Modal (conditionally rendered) */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleBudgetSuccess}
        currency={currency}
      />
      <Toaster />
    </div>
  );
};

export default BudgetsPage;
