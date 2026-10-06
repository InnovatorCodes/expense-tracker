"use client";

import { useState, useTransition } from "react";
import { Edit, Info, Pin, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { BudgetWithUsage } from "@/types/budget";
import { deleteBudget, togglePinnedBudget } from "@/actions/budget";
import { Button } from "@/components/ui/button";
import { BudgetProgress } from "@/components/budget-progress";
import { BudgetFormDialog } from "@/components/budget-form-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";

export default function BudgetsList({
  budgets,
  pinnedId,
}: {
  budgets: BudgetWithUsage[];
  pinnedId: string | null;
}) {
  const [editing, setEditing] = useState<BudgetWithUsage | null>(null);
  const [deleting, setDeleting] = useState<BudgetWithUsage | null>(null);
  const [isDeleting, startDelete] = useTransition();
  const [isPinning, startPin] = useTransition();

  const togglePin = (id: string) =>
    startPin(async () => {
      const result = await togglePinnedBudget(id);
      if (result.error) toast.error(result.error);
    });

  const confirmDelete = () => {
    if (!deleting) return;
    startDelete(async () => {
      const result = await deleteBudget(deleting.id);
      if (result.error) toast.error(result.error);
      else toast.success(result.success);
      setDeleting(null);
    });
  };

  if (budgets.length === 0) {
    return (
      <div className="text-center p-8 rounded-xl bg-white dark:bg-gray-800 shadow-md">
        <Info className="h-8 w-8 mx-auto mb-3" />
        <p className="font-semibold">No budgets added yet.</p>
        <p className="text-sm">
          Use the &apos;+&apos; button to add your first budget!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        {budgets.map((budget) => {
          const pinned = budget.id === pinnedId;
          return (
            <BudgetProgress
              key={budget.id}
              budget={budget}
              actions={
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isPinning}
                    onClick={() => togglePin(budget.id)}
                    className={
                      pinned ? "text-yellow-600" : "hover:text-yellow-600"
                    }
                    aria-label={`${pinned ? "Unpin" : "Pin"} ${budget.category} budget`}
                    aria-pressed={pinned}
                  >
                    <Pin
                      className="h-5 w-5"
                      fill={pinned ? "currentColor" : "none"}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditing(budget)}
                    className="hover:text-blue-600"
                    aria-label={`Edit ${budget.category} budget`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleting(budget)}
                    className="hover:text-red-600"
                    aria-label={`Delete ${budget.category} budget`}
                  >
                    <Trash2 className="h-5 w-5" />
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
          deleting ? `Your ${deleting.category} budget will be removed.` : ""
        }
        pending={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
