// app/dashboard/components/TopTransactions.tsx
import { Plane, Home, Briefcase, Ellipsis } from 'lucide-react';

const TopTransactions = () => {
    // Mock data for top transactions (highest value)
    const transactions = [
        { icon: <Plane size={20} className="text-cyan-500"/>, category: 'Travel', item: 'Flight Tickets', amount: -1200.00, date: 'June 15, 2025'},
        { icon: <Home size={20} className="text-amber-500"/>, category: 'Bills', item: 'Rent Payment', amount: -1100.00, date: 'June 1, 2025'},
        { icon: <Briefcase size={20} className="text-lime-500"/>, category: 'Shopping', item: 'New Laptop', amount: -999.00, date: 'June 16, 2025'},
    ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md w-full mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Top Transactions</h3>
        <a href="#" className="text-sm font-medium text-indigo-600 hover:underline">View All</a>
      </div>
      <div className="space-y-4">
        {transactions.map((t, i) => (
             <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                        {t.icon}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-white">{t.item}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.category} &bull; {t.date}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <p className={`font-semibold text-red-500`}>
                        {`-$${Math.abs(t.amount).toFixed(2)}`}
                    </p>
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full">
                        <Ellipsis size={18} />
                    </button>
                </div>
             </div>
        ))}
      </div>
    </div>
  );
};

export default TopTransactions;
