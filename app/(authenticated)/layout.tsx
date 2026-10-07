import type { Metadata } from "next";
import type { ReactNode } from "react";
import Sidebar from "@/components/sidebar";
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
    <div className="min-h-screen bg-page text-foreground">
      <Sidebar />
      {/* Bottom padding keeps the floating "+" button off the last item. */}
      <main className="min-w-0 sm:ml-72 px-4 py-5 pb-28 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
