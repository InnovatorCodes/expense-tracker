import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-[60vh] items-center justify-center text-gray-500 dark:text-gray-400">
      <Loader2 className="h-8 w-8 animate-spin" aria-label="Loading" />
    </div>
  );
}
