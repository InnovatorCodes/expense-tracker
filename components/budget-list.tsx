"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Edit, Pin, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";
import type { BudgetWithUsage } from "@/types/budget";
import { deleteBudget, togglePinnedBudget } from "@/actions/budget";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BudgetProgress } from "@/components/budget-progress";
import { BudgetFormDialog } from "@/components/budget-form-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/panel";

type OptimisticChange =
  | { kind: "pin"; id: string | null }
  | { kind: "delete"; id: string };

export default function BudgetsList({
  budgets,
  pinnedId,
  daysLeft,
}: {
  budgets: BudgetWithUsage[];
  pinnedId: string | null;
  daysLeft: number;
}) {
  // Pin and delete show instantly; React reverts them if the server call fails.
  const [state, applyOptimistic] = useOptimistic(
    { budgets, pinnedId },
    (current, change: OptimisticChange) =>
      change.kind === "pin"
        ? { ...current, pinnedId: change.id }
        : {
            budgets: current.budgets.filter((b) => b.id !== change.id),
            pinnedId: current.pinnedId === change.id ? null : current.pinnedId,
          },
  );
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState<BudgetWithUsage | null>(null);
  const [deleting, setDeleting] = useState<BudgetWithUsage | null>(null);

  const togglePin = (id: string) =>
    startTransition(async () => {
      applyOptimistic({ kind: "pin", id: state.pinnedId === id ? null : id });
      const result = await togglePinnedBudget(id);
      if (result.error) toast.error(result.error);
    });

  const confirmDelete = () => {
    const target = deleting;
    if (!target) return;
    setDeleting(null);
    startTransition(async () => {
      applyOptimistic({ kind: "delete", id: target.id });
      const result = await deleteBudget(target.id);
      if (result.error) toast.error(result.error);
      else toast.success(result.success);
    });
  };

  if (state.budgets.length === 0) {
    return (
      <EmptyState
        icon={<Wallet className="h-8 w-8 mb-3" />}
        title="No budgets added yet."
        hint="Use the '+' button to add your first budget."
      />
    );
  }

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        {state.budgets.map((budget) => {
          const pinned = budget.id === state.pinnedId;
          const name =
            budget.category === "All" ? "All spending" : budget.category;
          return (
            <BudgetProgress
              key={budget.id}
              budget={budget}
              daysLeft={daysLeft}
              elevated
              actions={
                <div className="flex items-center -mr-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePin(budget.id)}
                    className={cn(
                      "h-8 w-8",
                      pinned
                        ? "text-amber-500"
                        : "text-muted-foreground hover:text-amber-500",
                    )}
                    aria-label={`${pinned ? "Unpin" : "Pin"} ${name} budget`}
                    aria-pressed={pinned}
                    title={pinned ? "Pinned to dashboard" : "Pin to dashboard"}
                  >
                    <Pin
                      className="h-4 w-4"
                      fill={pinned ? "currentColor" : "none"}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditing(budget)}
                    className="h-8 w-8 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                    aria-label={`Edit ${name} budget`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleting(budget)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    aria-label={`Delete ${name} budget`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              }
            />
          );
        })}
      </div>

      <BudgetFormDialog
        key={editing?.id ?? "none"}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        budget={editing}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete budget?"
        description={
          deleting
            ? `Your ${deleting.category === "All" ? "all-spending" : deleting.category} budget will be removed.`
            : ""
        }
        onConfirm={confirmDelete}
      />
    </>
  );
}
