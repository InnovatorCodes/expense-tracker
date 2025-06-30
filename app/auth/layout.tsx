// app/dashboard/layout.tsx
// This is a Server Component and acts as a protected route group layout.

import { auth } from "@/auth"; // Import the server-side auth function
import { redirect } from "next/navigation"; // Server-side redirect function
import Link from "next/link";
import { DollarSign } from "lucide-react";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Fetch the session securely on the server.
  const session = await auth();

  // 2. Perform the authentication check.
  // If the user is NOT authenticated (no session or no user ID in session),
  // immediately redirect them to the login page.
  if (session?.user) {
    redirect("/dashboard"); // This will redirect to your Auth.js `pages.signIn` config if set.
  }

  // 3. If authenticated, render the children (the actual dashboard page content).
  // You can also wrap `children` with common dashboard UI elements (Navbar, Sidebar etc.)
  return (
    <>
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <Link
        href="/"
        className="absolute top-0 left-0 ml-4 mt-4 flex items-center justify-center mr-auto"
      >
        <div className="bg-indigo-600 p-2 rounded-lg">
          <DollarSign className="text-white" size={28} />
        </div>
        <span className="ml-2 text-3xl font-bold text-gray-900 dark:text-white">
          SpendSense
        </span>
      </Link>
      {children}
    </>
  );
}
