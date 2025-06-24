// app/dashboard/components/BalanceCard.tsx
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react'; // Auth.js client provider
import { subscribeToBalance } from '@/utils/firebase'; // Import the function to subscribe to balance
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card'; // Shadcn/ui components

const BalanceCard = ({currency}: {currency:string}) => {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Effect to subscribe to balance updates
  useEffect(() => {
    let unsubscribeBalance: (() => void) | undefined;
    setLoading(true);

    if (userId && status === 'authenticated') {
      console.log("BalanceDisplay: Subscribing to balance for user:", userId);
      // Subscribe to balance
      unsubscribeBalance = subscribeToBalance(userId, (currentBalance) => {
        setBalance(currentBalance);
        setLoading(false);
        console.log("BalanceDisplay: Real-time balance updated:", currentBalance);
      });

      // Also fetch the user's default currency

    } else if (status === 'unauthenticated' || !userId) {
      console.log("BalanceDisplay: User not authenticated, resetting balance.");
      setBalance(0);
      setLoading(false);
    } else if (status === 'loading') {
      console.log("BalanceDisplay: Session loading...");
    }

    return () => {
      if (unsubscribeBalance) {
        console.log("BalanceDisplay: Unsubscribing from balance.");
        unsubscribeBalance();
      }
    };
  }, [userId, status]); // Re-run when user ID or auth status changes

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

  if (status === 'loading' || loading) return (
      <Card className="dark:bg-gray-800">
        <CardContent className="p-6 text-center text-gray-500 dark:text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          Loading transactions...
        </CardContent>
      </Card>
    );
 
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex flex-col">
      <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Balance</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{getCurrencySymbol()}{balance}</p>
             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">As of {new Date().toLocaleDateString()}</p>
          </div>
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/50 rounded-lg">
              <div className="p-2 bg-green-200 dark:bg-green-800 rounded-full">
                <ArrowUpRight className="text-green-600 dark:text-green-300" size={20}/>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">$4500</p>
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
