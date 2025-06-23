// app/dashboard/layout.tsx
// This is a Server Component and acts as a protected route group layout.

import { auth } from '@/auth'; // Import the server-side auth function
import { redirect } from 'next/navigation'; // Server-side redirect function

// You can also import and render your application's common UI elements here,
// like a Navbar, Sidebar, or Footer, that should appear on all dashboard pages.
// import Navbar from '@/components/Navbar'; // Assuming you have a global Navbar
// import Sidebar from '@/components/Sidebar'; // If you have a dashboard-specific sidebar

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
    redirect('/dashboard'); // This will redirect to your Auth.js `pages.signIn` config if set.
  }

  // 3. If authenticated, render the children (the actual dashboard page content).
  // You can also wrap `children` with common dashboard UI elements (Navbar, Sidebar etc.)
  return (
    <>
    {children}
    </>
  );
}