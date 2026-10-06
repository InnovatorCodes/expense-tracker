import Link from "next/link";
import { Info } from "lucide-react";
import type { BudgetWithUsage } from "@/types/budget";
import { BudgetProgress } from "@/components/budget-progress";

const DashboardBudget = ({ budget }: { budget: BudgetWithUsage | null }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-semibold">Pinned Budget</h3>
      <Link
        href="/budgets"
        className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
      >
        Manage
      </Link>
    </div>
    {budget ? (
      <BudgetProgress budget={budget} />
    ) : (
      <div className="text-center p-8 rounded-md text-gray-500 dark:text-gray-400">
        <Info className="h-8 w-8 mx-auto mb-3" />
        <p className="font-semibold">No budget pinned yet.</p>
        <p className="text-sm">You can pin one budget from the Budgets page.</p>
      </div>
    )}
  </div>
);

export default DashboardBudget;
