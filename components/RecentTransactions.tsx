// app/dashboard/components/RecentTransactions.tsx
"use client"
import { ShoppingCart, Utensils, Car, Ellipsis } from 'lucide-react';


const RecentTransactions = () => {
    const transactions = [
        { icon: <ShoppingCart size={20} className="text-blue-500"/>, category: 'Shopping', store: 'Amazon', amount: -79.99, date: 'June 18, 2025'},
        { icon: <Utensils size={20} className="text-orange-500"/>, category: 'Food', store: 'Starbucks', amount: -8.50, date: 'June 18, 2025'},
        { icon: <Car size={20} className="text-purple-500"/>, category: 'Transport', store: 'Uber', amount: -15.25, date: 'June 17, 2025'},
        { icon: <ShoppingCart size={20} className="text-blue-500"/>, category: 'Shopping', store: 'Apple Store', amount: -999.00, date: 'June 16, 2025'},
        { icon: <Utensils size={20} className="text-orange-500"/>, category: 'Food', store: 'Local Grocer', amount: -54.30, date: 'June 16, 2025'},
    ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md h-full border-border dark:border-border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Transactions</h3>
        <a href="#" className="text-sm font-medium text-indigo-600 hover:underline">View All</a>
      </div>
      <div className="space-y-4">
        {transactions.map((t, i) => (
             <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                        {t.icon}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-white">{t.store}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.category} &bull; {t.date}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <p className={`font-semibold ${t.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {t.amount < 0 ? `-$${Math.abs(t.amount).toFixed(2)}` : `+$${t.amount.toFixed(2)}`}
                    </p>
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                        <Ellipsis size={18} />
                    </button>
                </div>
             </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;

