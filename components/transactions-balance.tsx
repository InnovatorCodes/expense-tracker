// components/BalanceDisplay.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { subscribeToBalance } from '@/utils/firebase'; // Import subscribeToBalance
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react'; // For loading spinner

const BalanceDisplay: React.FC<{ currency: string }> = ({ currency }) => {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Effect to subscribe to balance updates
  useEffect(() => {
    let unsubscribeBalance: (() => void) | undefined;
    setLoading(true);
    setError(null);

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
      setError("Please log in to view your balance.");
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

  const getCurrencySymbol = (currencyCode: string) => {
    switch (currencyCode) {
      case 'INR':
        return '₹';
      case 'USD':
        return '$';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <Card className="dark:bg-gray-800 animate-pulse">
        <CardContent className="p-6 text-center text-gray-500 dark:text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          Fetching balance...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="dark:bg-gray-800">
        <CardContent className="text-center p-4 bg-red-100 rounded-lg text-red-700 dark:bg-red-900/20 dark:text-red-300">
          <p className="font-semibold">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-blue-100 dark:bg-blue-900 shadow-lg rounded-lg text-center">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-blue-800 dark:text-blue-200">
          Current Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-5xl font-extrabold text-blue-900 dark:text-blue-100 flex items-center justify-center">
          <span className="text-3xl mr-2">{getCurrencySymbol(currency)}</span>
          {balance.toFixed(2)}
        </p>
        <p className="text-md text-blue-700 dark:text-blue-300 mt-2">
          (Your default currency: {currency})
        </p>
      </CardContent>
    </Card>
  );
};

export default BalanceDisplay;
