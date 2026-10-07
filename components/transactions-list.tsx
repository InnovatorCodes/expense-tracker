"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { Edit, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import type { Transaction, TransactionType } from "@/types/transaction";
import { deleteTransaction } from "@/actions/transaction";
import { formatDayHeading } from "@/lib/dates";
import { formatMoney, roundMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/panel";
import { TransactionRow } from "@/components/transaction-row";
import { TransactionFormDialog } from "@/components/transaction-form-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";

type TypeFilter = "all" | TransactionType;
const ALL = "__all";

export default function TransactionList({
  transactions,
}: {
  transactions: Transaction[];
}) {
  // Deleted rows disappear immediately; if the server call fails, React
  // restores them automatically when the transition ends.
  const [items, removeOptimistic] = useOptimistic(
    transactions,
    (state, id: string) => state.filter((t) => t.id !== id),
  );
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);

  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [category, setCategory] = useState(ALL);

  const categories = useMemo(
    () => [...new Set(transactions.map((t) => t.category))].sort(),
    [transactions],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (t) =>
        (type === "all" || t.type === type) &&
        (category === ALL || t.category === category) &&
        (!q ||
          t.name.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.notes ?? "").toLowerCase().includes(q)),
    );
  }, [items, query, type, category]);

  // Items arrive newest first, so groups come out in date order.
  const groups = useMemo(() => {
    const byDate = new Map<string, Transaction[]>();
    for (const t of filtered) {
      byDate.set(t.date, [...(byDate.get(t.date) ?? []), t]);
    }
    return [...byDate].map(([date, list]) => ({
      date,
      list,
      net: roundMoney(
        list.reduce(
          (s, t) => s + (t.type === "income" ? t.baseAmount : -t.baseAmount),
          0,
        ),
      ),
    }));
  }, [filtered]);

  const filtersActive = query !== "" || type !== "all" || category !== ALL;
  const clearFilters = () => {
    setQuery("");
    setType("all");
    setCategory(ALL);
  };

  const confirmDelete = () => {
    const target = deleting;
    if (!target) return;
    setDeleting(null);
    startTransition(async () => {
      removeOptimistic(target.id);
      const result = await deleteTransaction(target.id);
      if (result.error) toast.error(result.error);
      else toast.success(result.success);
    });
  };

  if (transactions.length === 0) {
    return (
      <EmptyState
        title="No transactions this month."
        hint="Use the '+' button to add an income or expense."
      />
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, category or notes"
            aria-label="Search transactions"
            className="pl-9"
          />
        </div>
        <div
          role="radiogroup"
          aria-label="Filter by type"
          className="flex rounded-md bg-muted p-1 shrink-0"
        >
          {(["all", "income", "expense"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={type === value}
              onClick={() => setType(value)}
              className={cn(
                "flex-1 sm:flex-none px-3 py-1 text-sm rounded capitalize transition-colors",
                type === value
                  ? "bg-card text-foreground shadow-sm font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {value}
            </button>
          ))}
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger
            className="w-full sm:w-44"
            aria-label="Filter by category"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <p className="font-medium">No transactions match your filters.</p>
          {filtersActive && (
            <Button variant="link" onClick={clearFilters} className="mt-1">
              <X className="h-4 w-4 mr-1" /> Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <section key={group.date} aria-label={formatDayHeading(group.date)}>
              <div className="flex items-baseline justify-between px-3 pb-1.5 mb-1 border-b border-border/30">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  {formatDayHeading(group.date)}
                </h3>
                <span
                  className={cn(
                    "text-xs font-medium tabular-nums",
                    group.net >= 0 ? "text-constructive" : "text-destructive",
                  )}
                  title="Net for the day, in your base currency"
                >
                  {group.net >= 0 ? "+" : "-"}
                  {formatMoney(Math.abs(group.net))}
                </span>
              </div>
              <ul>
                {group.list.map((t) => (
                  <li key={t.id}>
                    <TransactionRow
                      transaction={t}
                      showDate={false}
                      actions={
                        <div className="flex">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditing(t)}
                            className="h-8 w-8 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                            aria-label={`Edit ${t.name}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleting(t)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
            </section>
          ))}
        </div>
      )}

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
        onConfirm={confirmDelete}
      />
    </>
  );
}
