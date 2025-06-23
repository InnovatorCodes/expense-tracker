// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SpendSense - Track Your Spending Smartly',
  description: 'Take control of your finances with SpendSense, the easiest way to track your expenses, set budgets, and achieve your financial goals.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-gray-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
