// app/dashboard/page.tsx
"use client"
import BalanceCard from "@/components/balance-card";
import RecentTransactions from "@/components/RecentTransactions";
import { ExpenseChart } from "@/components/ExpenseChart";
import { PastWeekChart } from "@/components/PastWeekChart";
import TopTransactions from "@/components/TopTransactions";

export default function DashboardPage() {
  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-6">
        <div className="flex flex-col gap-6">
          <BalanceCard />
          <RecentTransactions />
          <TopTransactions />
        </div>
        <div className="flex flex-col gap-6">
          <ExpenseChart />
          <PastWeekChart />
        </div>
      </div>
      
    </section>
  );
}
