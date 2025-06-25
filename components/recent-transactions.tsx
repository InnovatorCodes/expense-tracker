// app/dashboard/components/RecentTransactions.tsx
"use client"
//import { ShoppingCart, Utensils, Car, Ellipsis } from 'lucide-react';
import { Info, RefreshCw, Loader2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'; // Added RefreshCw and Loader2 icons
import { useSession } from 'next-auth/react';
// Assuming getRecentTransactions is correctly imported from lib/firestore
import { getRecentTransactions } from '@/utils/firebase'; // Corrected import path
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { Transaction } from '@/types/transaction';
import { Button } from '@/components/ui/button'; // Import Button component

const RecentTransactions = ({currency}: {currency:string}) => {
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true); // Separate loading state for this component
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // State to trigger refresh

  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  // Use useCallback to memoize the fetch function and avoid unnecessary re-creations
  const fetchTransactions = useCallback(async () => {
    setLoadingTransactions(true);
    setError(null);
    try {
      if (userId && status === 'authenticated') {
        const transactions = await getRecentTransactions(userId);
        setRecentTransactions(transactions || []);
      } else if (status === 'unauthenticated') {
        setRecentTransactions([]);
        setError("Please log in to view recent transactions.");
      }
    } catch (err) {
      console.error("Failed to fetch recent transactions:", err);
      setError("Failed to load recent transactions.");
      setRecentTransactions([]); // Clear transactions on error
    } finally {
      setLoadingTransactions(false);
    }
  }, [userId, status]); // Dependencies for useCallback

  useEffect(() => {
    // Only fetch if session status is not 'loading'
    if (status !== 'loading') {
      fetchTransactions();
    }
  }, [status, fetchTransactions, refreshTrigger]); // Depend on status, fetchTransactions, and refreshTrigger

  const handleRefreshClick = () => {
    setRefreshTrigger(prev => (prev + 1)%2); // Increment to trigger useEffect
  };

  const getCurrencySymbol = () => {
    switch (currency) {
      case 'INR':
        return '₹';
      case 'USD':
        return '$';
      default:
        return currency;
    }
  };


  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex flex-col h-full border-border dark:border-border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Transactions</h3>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleRefreshClick}
            variant="outline"
            size="icon"
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            disabled={loadingTransactions || status === 'loading'}
            aria-label="Refresh transactions"
          >
            {loadingTransactions ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
          </Button>
          <Link href="/transactions" className="text-sm font-medium text-indigo-600 hover:underline">
            View All
          </Link>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pr-2"> {/* Added overflow-y-auto for scrollable content */}
        {error ? (
          <div className="text-center p-4 bg-red-100 rounded-lg text-red-700 dark:bg-red-900/20 dark:text-red-300">
            <p>{error}</p>
          </div>
        ) : loadingTransactions ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin mb-3" />
            <p>Loading recent transactions...</p>
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="text-center p-8 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 rounded-md">
            <Info className="h-8 w-8 mx-auto mb-3" />
            <p className="font-semibold">No transactions recorded yet.</p>
            <p className="text-sm">Add one using the &apos;+&apos; button!</p>
          </div>
        ) : (
          <div className="space-y-4 w-full">
            {recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 w-full">
                <div className="flex items-center gap-4">
                    {t.type === 'income' ? (
                        <div className="p-2 bg-green-200 dark:bg-green-800 rounded-full">
                            <ArrowUpCircle className="text-green-600 dark:text-green-300" size={20}/>
                        </div>
                    ) : (
                        <div className="p-2  bg-red-50 dark:bg-red-800/70 rounded-full">
                            <ArrowDownCircle className="text-red-600 dark:text-red-300" size={20}/>
                        </div>
                    )}
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-white">{t.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.category} &bull; {new Date(t.date).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <p className={`font-semibold ${t.type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {t.type=='expense'?'-':'+'}{getCurrencySymbol()+t.amount.toFixed(2)}
                    </p>
                    {/* The ellipsis button is often for more options like Edit/Delete.
                        If deletion is needed, consider an icon button like Trash2.
                    */}
                    {/* <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                        <Ellipsis size={18} />
                    </button> */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;
