// app/providers.tsx
'use client';

import { ThemeProvider } from 'next-themes';
import { ExchangeRatesProvider } from '@/providers/exchange-rates-provider'; // Import individual providers
import React from 'react'; // Don't forget to import React

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ExchangeRatesProvider>
        {children}
      </ExchangeRatesProvider>
    </ThemeProvider>
  );
}