import type { Metadata } from "next";
import "@/app/globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Track your Expenses",
};

// app/layout.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex ">
      <Sidebar />
      <main className="p-6 flex-1 h-full">{children}</main>
    </div>
  );
}

