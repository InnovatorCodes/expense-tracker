// providers/ExchangeRatesProvider.tsx
'use client';

import React, { useState, useEffect, useCallback, createContext, ReactNode, useContext } from 'react';

// --- Exchange Rates Context Definition ---
interface ExchangeRates {
  [targetCurrency: string]: number; // e.g., { "EUR": 0.92, "INR": 83.5 } if base is USD
}
interface ExchangeRatesContextType {
  exchangeRates: ExchangeRates | null;
  loadingExchangeRates: boolean;
  errorExchangeRates: string | null;
}
export const ExchangeRatesContext = createContext<ExchangeRatesContextType | undefined>(undefined);

// --- Exchange Rates Provider Component ---
interface ExchangeRatesProviderProps {
  children: ReactNode;
}

// Define a sensible default set of exchange rates
// These are illustrative. In a real app, you might use a known base (like USD)
// and set all others relative to it, or load from a compile-time static file.
const DEFAULT_EXCHANGE_RATES: ExchangeRates = {
  'INR': 1.0,
  'USD': 0.012, // Example: 1 INR = 0.012 USD
  'EUR': 0.011, // Example: 1 INR = 0.011 EUR
  'GBP': 0.0095, // Example: 1 INR = 0.0095 GBP
  'JPY': 1.89,   // Example: 1 INR = 1.89 JPY
  'AUD': 0.018,  // Example: 1 INR = 0.018 AUD
  // Note: These rates assume 'INR' is the base currency for the API call initially.
  // The conversion logic in consuming components will need to handle how to use these.
  // For the `latest/{baseCurrency}` API endpoint, the returned `conversion_rates`
  // object will already have the `baseCurrency` as 1.0 and others relative to it.
  // So, this default is used when the base currency is unknown or not yet loaded.
};

export const ExchangeRatesProvider: React.FC<ExchangeRatesProviderProps> = ({ children }) => {
  // Initialize with default rates
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(DEFAULT_EXCHANGE_RATES);
  const [loadingExchangeRates, setLoadingExchangeRates] = useState(false);
  const [errorExchangeRates, setErrorExchangeRates] = useState<string | null>(null);

  // Consume the default currency from its context

  // --- Fetch Exchange Rates Effect ---
  const fetchAndSetExchangeRates = useCallback(async (baseCurrency: string) => {
    setLoadingExchangeRates(true);
    setErrorExchangeRates(null);
    try {
      // Using the user's defaultCurrency as the base for the API call
      const response = await fetch(`https://v6.exchangerate-api.com/v6/${process.env.NEXT_PUBLIC_EXCHANGE_RATES_KEY}/latest/${baseCurrency}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! status: ${response.status}. Code: ${errorData.error_type || response.statusText}`);
      }

      const data = await response.json();
      const rates = data["conversion_rates"];
      setExchangeRates(rates); // Update with fetched rates
    } catch (e: unknown) {
      console.error("Error fetching exchange rates:", e);
      setErrorExchangeRates(`Failed to fetch exchange rates: ${e instanceof Error ? e.message : String(e)}. Using default rates.`);
      // If fetching fails, exchangeRates remains at its last known valid state (either default or previously fetched)
    } finally {
      setLoadingExchangeRates(false);
    }
  }, []);

  useEffect(() => {
      fetchAndSetExchangeRates('INR');
  }, [ fetchAndSetExchangeRates]);

  const contextValue = { exchangeRates, loadingExchangeRates, errorExchangeRates };

  return (
    <ExchangeRatesContext.Provider value={contextValue}>
      {children}
    </ExchangeRatesContext.Provider>
  );
};

// --- Custom Hook to consume Exchange Rates ---
export const useExchangeRates = () => {
  const context = useContext(ExchangeRatesContext);
  if (context === undefined) {
    throw new Error('useExchangeRates must be used within an ExchangeRatesProvider');
  }
  return context;
};
