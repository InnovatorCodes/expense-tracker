"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="max-w-md text-center p-8 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 shadow">
        <AlertCircle className="h-10 w-10 mx-auto mb-4" />
        <p className="font-semibold text-lg mb-2">Something went wrong</p>
        <p className="text-sm mb-6">
          We couldn&apos;t load your data. Please try again in a moment.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
