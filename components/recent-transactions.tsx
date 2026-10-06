import Link from "next/link";
import { Info } from "lucide-react";
import type { Transaction } from "@/types/transaction";
import { TransactionRow } from "@/components/transaction-row";

const RecentTransactions = ({
  transactions,
}: {
  transactions: Transaction[];
}) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex flex-col">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
        Recent Transactions
      </h3>
      <Link
        href="/transactions"
        className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
      >
        View All
      </Link>
    </div>
    {transactions.length === 0 ? (
      <div className="text-center p-8 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md">
        <Info className="h-8 w-8 mx-auto mb-3" />
        <p className="font-semibold">No transactions recorded yet.</p>
        <p className="text-sm">Add one using the &apos;+&apos; button!</p>
      </div>
    ) : (
      <ul className="space-y-3">
        {transactions.map((t) => (
          <li key={t.id}>
            <TransactionRow transaction={t} />
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default RecentTransactions;
