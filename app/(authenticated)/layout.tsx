import type { Metadata } from "next";
import type { ReactNode } from "react";
import Sidebar from "@/components/sidebar";
import { ThemeButton } from "@/components/theme-button";
import { requireUserId } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "SpendSense",
  description: "Track your spending, income and budgets.",
};

export default async function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Defence in depth: the proxy already redirects anonymous visitors.
  await requireUserId();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex">
      <div className="fixed top-4 right-4 z-50">
        <ThemeButton />
      </div>
      <Sidebar />
      <main className="flex-1 min-w-0 p-4 pt-20 pb-28 sm:p-6 sm:pb-28 sm:ml-72">
        {children}
      </main>
    </div>
  );
}
