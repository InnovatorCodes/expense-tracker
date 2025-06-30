// app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Providers } from "./providers";
import { auth } from "@/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SpendSense - Track Your Spending Smartly",
  description:
    "Take control of your finances with SpendSense, the easiest way to track your expenses, set budgets, and achieve your financial goals.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-gray-900`}>
        <SessionProvider session={session}>
          <Providers>{children}</Providers>
        </SessionProvider>
      </body>
    </html>
  );
}
