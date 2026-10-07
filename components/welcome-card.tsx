"use client";

import { useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Wallet, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionFormDialog } from "@/components/transaction-form-dialog";
import { BudgetFormDialog } from "@/components/budget-form-dialog";
import type { TransactionType } from "@/types/transaction";

/** Shown on the dashboard until the user records their first transaction. */
export function WelcomeCard({ name }: { name?: string | null }) {
  const [transactionType, setTransactionType] =
    useState<TransactionType | null>(null);
  const [budgetOpen, setBudgetOpen] = useState(false);

  const steps = [
    {
      icon: ArrowDownCircle,
      title: "Record an expense",
      text: "Log what you spend, in any of six currencies.",
      action: () => setTransactionType("expense"),
      cta: "Add expense",
    },
    {
      icon: ArrowUpCircle,
      title: "Add your income",
      text: "Salary, freelance work, refunds and more.",
      action: () => setTransactionType("income"),
      cta: "Add income",
    },
    {
      icon: Wallet,
      title: "Set a budget",
      text: "A monthly limit per category, or for everything.",
      action: () => setBudgetOpen(true),
      cta: "Create budget",
    },
  ];

  return (
    <section className="rounded-xl border border-border/40 bg-card shadow-sm p-6 sm:p-8">
      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
        <Sparkles className="h-5 w-5" />
        <span className="text-sm font-semibold">Getting started</span>
      </div>
      <h2 className="text-2xl font-bold">
        Welcome{name ? `, ${name.split(" ")[0]}` : ""}!
      </h2>
      <p className="text-muted-foreground mt-1 mb-6">
        Your dashboard fills in as you add transactions. Start with any of
        these.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, text, action, cta }) => (
          <div key={title} className="rounded-lg bg-muted/50 p-4 flex flex-col">
            <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mb-3" />
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4 flex-1">
              {text}
            </p>
            <Button onClick={action} variant="outline" className="self-start">
              {cta}
            </Button>
          </div>
        ))}
      </div>

      <TransactionFormDialog
        open={transactionType !== null}
        onOpenChange={(open) => !open && setTransactionType(null)}
        initialType={transactionType ?? "expense"}
      />
      <BudgetFormDialog open={budgetOpen} onOpenChange={setBudgetOpen} />
    </section>
  );
}
