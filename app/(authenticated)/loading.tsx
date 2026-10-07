import { Skeleton } from "@/components/ui/skeleton";
import { PanelSkeleton } from "@/components/panel";

/** Shown while navigating between pages, before the page shell arrives. */
export default function Loading() {
  return (
    <div aria-busy aria-label="Loading">
      <Skeleton className="h-9 w-48 mb-6" />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PanelSkeleton rows={2} />
        <PanelSkeleton chart />
      </div>
    </div>
  );
}
