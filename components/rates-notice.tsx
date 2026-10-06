import { AlertTriangle } from "lucide-react";

/** Shown when the live exchange-rate API is unavailable. */
export function RatesNotice({ stale }: { stale: boolean }) {
  if (!stale) return null;
  return (
    <div
      role="status"
      className="mb-4 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200"
    >
      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
      Live exchange rates are unavailable right now. New entries in other
      currencies will use approximate rates.
    </div>
  );
}
