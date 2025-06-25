// app/dashboard/page.tsx
"use client"
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react'; // Auth.js client provider
import BalanceCard from "@/components/balance-card";
import RecentTransactions from "@/components/recent-transactions";
import { ExpenseChart } from "@/components/expense-chart";
import { PastWeekChart } from "@/components/past-week-chart";
import TopTransactions from "@/components/top-transactions";
import { getUserDefaultCurrency } from '@/utils/firebase';

export default function DashboardPage() {
  const { data: session} = useSession(); // Get session data and status from Auth.js
  const userId = session?.user?.id;
  const [currency, setCurrency] = useState("INR");
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
      <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-6">
        <div className="flex flex-col gap-6">
          <BalanceCard currency={currency} />
          <RecentTransactions currency={currency} />
          <TopTransactions />
        </div>
        <div className="flex flex-col gap-6">
          <ExpenseChart currency={currency} />
          <PastWeekChart />
        </div>
      </div>
      
    </section>
  );
}
