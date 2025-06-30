// app/dashboard/layout.tsx
// This is a Server Component and acts as a protected route group layout.

import { auth } from '@/auth'; // Import the server-side auth function
import { redirect } from 'next/navigation'; // Server-side redirect function
import Sidebar from '@/components/sidebar'; // Import your Sidebar component
import { Metadata } from 'next'; // Import Metadata type for page metadata
import { ThemeButton } from '@/components/theme-button';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: "SpendSense",
  description: "Dashboard",
};

export default async function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  // 1. Fetch the session securely on the server.
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex ">
      <div className="fixed top-4 right-4 z-50">
          <ThemeButton />
        </div>
      <Sidebar />
      <main className='p-6 flex-1 h-full'>
        {children}
      </main>
    </div>
  );
}

