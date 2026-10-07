import type { ReactNode } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * The card every dashboard section sits in. Uses theme tokens only, so light
 * and dark mode stay consistent across the whole app.
 */
export function Panel({
  title,
  description,
  action,
  className,
  children,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border/40 bg-card text-card-foreground shadow-sm p-5 sm:p-6 min-w-0",
        className,
      )}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

/** "View all"-style link shown in a panel header. */
export function PanelLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="shrink-0 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
    >
      {children}
    </Link>
  );
}

/** Friendly placeholder for a panel with nothing to show yet. */
export function EmptyState({
  title,
  hint,
  icon,
}: {
  title: string;
  hint?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center rounded-lg bg-muted/60 px-4 py-8 text-muted-foreground">
      {icon ?? <Info className="h-8 w-8 mb-3" />}
      <p className="font-semibold text-foreground/80">{title}</p>
      {hint && <p className="text-sm mt-1">{hint}</p>}
    </div>
  );
}

/** Placeholder with roughly the shape of a panel, shown while it streams in. */
export function PanelSkeleton({
  rows = 3,
  chart = false,
  className,
}: {
  rows?: number;
  chart?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "rounded-xl border border-border/40 bg-card shadow-sm p-5 sm:p-6",
        className,
      )}
    >
      <Skeleton className="h-5 w-40 mb-5" />
      {chart ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : (
        <div className="space-y-3">
          {Array.from({ length: rows }, (_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      )}
    </div>
  );
}
