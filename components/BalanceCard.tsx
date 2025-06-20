// app/dashboard/components/BalanceCard.tsx
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const BalanceCard = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex flex-col">
      <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Balance</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">$12,345.67</p>
             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">As of {new Date().toLocaleDateString()}</p>
          </div>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm">
            + Add Transaction
          </button>
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/50 rounded-lg">
              <div className="p-2 bg-green-200 dark:bg-green-800 rounded-full">
                <ArrowUpRight className="text-green-600 dark:text-green-300" size={20}/>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">$4,500.00</p>
              </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/50 rounded-lg">
              <div className="p-2 bg-red-200 dark:bg-red-800 rounded-full">
                <ArrowDownLeft className="text-red-600 dark:text-red-300" size={20}/>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Expense</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">$1,650.80</p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default BalanceCard;
