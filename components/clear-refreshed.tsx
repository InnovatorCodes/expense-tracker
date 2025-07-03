'use client'; // This directive is crucial for Next.js 13+ App Router to mark it as a Client Component

import { useEffect } from 'react';

export function ClearSessionStorage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('refreshed');
    }
  }, []); // Runs once on mount

  return null; // This component doesn't need to render anything visually
}