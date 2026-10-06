"use client";

import { useState } from "react";
import { Plus, ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionFormDialog } from "@/components/transaction-form-dialog";
import { BudgetFormDialog } from "@/components/budget-form-dialog";
import type { TransactionType } from "@/types/transaction";

type Action = "income" | "expense" | "budget";

const ACTIONS: Record<
  Action,
  { label: string; icon: typeof Plus; className: string }
> = {
  income: {
    label: "Add Income",
    icon: ArrowUpCircle,
    className:
      "from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700",
  },
  expense: {
    label: "Add Expense",
    icon: ArrowDownCircle,
    className: "from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700",
  },
  budget: {
    label: "Add Budget",
    icon: Wallet,
    className:
      "from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700",
  },
};

/**
 * The floating "+" button. With one action it opens that form directly;
 * with several it first shows a small menu.
 */
export function FloatingActions({ actions }: { actions: Action[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [transactionType, setTransactionType] =
    useState<TransactionType | null>(null);
  const [budgetOpen, setBudgetOpen] = useState(false);

  const run = (action: Action) => {
    setMenuOpen(false);
    if (action === "budget") setBudgetOpen(true);
    else setTransactionType(action);
  };

  const single = actions.length === 1;

  return (
    <>
      <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end">
        {menuOpen && !single && (
          <div
            id="quick-actions"
            className="flex flex-col items-end space-y-3 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-200"
          >
            {actions.map((action) => {
              const { label, icon: Icon, className } = ACTIONS[action];
              return (
                <Button
                  key={action}
                  onClick={() => run(action)}
                  className={`flex items-center gap-2 bg-gradient-to-r ${className} text-white rounded-full px-4 py-2 shadow-lg transition-all duration-200 hover:scale-105`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{label}</span>
                </Button>
              );
            })}
          </div>
        )}
        <Button
          onClick={() => (single ? run(actions[0]) : setMenuOpen((o) => !o))}
          className={`h-14 w-14 rounded-full text-white shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${menuOpen ? "bg-gray-600 rotate-45" : "bg-indigo-600 hover:bg-indigo-700"}`}
          aria-label={single ? ACTIONS[actions[0]].label : "Quick add"}
          aria-expanded={single ? undefined : menuOpen}
          aria-controls={single ? undefined : "quick-actions"}
        >
          <Plus className="h-7 w-7" />
        </Button>
      </div>

      <TransactionFormDialog
        open={transactionType !== null}
        onOpenChange={(open) => !open && setTransactionType(null)}
        initialType={transactionType ?? "expense"}
      />
      <BudgetFormDialog open={budgetOpen} onOpenChange={setBudgetOpen} />
    </>
  );
}
