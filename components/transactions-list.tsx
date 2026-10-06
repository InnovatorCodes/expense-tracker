"use client";

import { useState, useTransition } from "react";
import { Edit, Info, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Transaction } from "@/types/transaction";
import { deleteTransaction } from "@/actions/transaction";
import { Button } from "@/components/ui/button";
import { TransactionRow } from "@/components/transaction-row";
import { TransactionFormDialog } from "@/components/transaction-form-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";

export default function TransactionList({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const confirmDelete = () => {
    if (!deleting) return;
    startDelete(async () => {
      const result = await deleteTransaction(deleting.id);
      if (result.error) toast.error(result.error);
      else toast.success(result.success);
      setDeleting(null);
    });
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md">
        <Info className="h-8 w-8 mx-auto mb-3" />
        <p className="font-semibold">No transactions this month.</p>
        <p className="text-sm">
          Use the &apos;+&apos; button to add an income or expense.
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-3">
        {transactions.map((t) => (
          <li key={t.id}>
            <TransactionRow
              transaction={t}
              actions={
                <div className="flex">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditing(t)}
                    className="h-8 w-8 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                    aria-label={`Edit ${t.name}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleting(t)}
                    className="h-8 w-8 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                    aria-label={`Delete ${t.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              }
            />
          </li>
        ))}
      </ul>

      <TransactionFormDialog
        // Remount per transaction so the form always shows the right values.
        key={editing?.id ?? "none"}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        transaction={editing}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete transaction?"
        description={
          deleting
            ? `"${deleting.name}" will be permanently removed and your balance updated.`
            : ""
        }
        pending={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
