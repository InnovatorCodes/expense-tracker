import Sidebar from "@/components/sidebar"; // Import your Sidebar component
import { Metadata } from "next"; // Import Metadata type for page metadata
import { ThemeButton } from "@/components/theme-button";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "SpendSense",
  description: "Dashboard",
};

export default function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex ">
      <div className="fixed top-4 right-4 z-50">
        <ThemeButton />
      </div>
      <Sidebar />
      <main className="p-6 flex-1 h-full sm:ml-72 transition-all duration-300">{children}</main>
    </div>
  );
}
