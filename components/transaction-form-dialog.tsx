"use client";

import { useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type * as z from "zod/v4";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { transactionSchema } from "@/schemas/transaction-schema";
import { createTransaction, updateTransaction } from "@/actions/transaction";
import { BASE_CURRENCY, currencies, currencySymbol } from "@/lib/money";
import { expenseCategories, incomeCategories } from "@/lib/categories";
import { localToday } from "@/lib/dates";
import type { Transaction, TransactionType } from "@/types/transaction";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/category-icon";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type FormInput = z.input<typeof transactionSchema>;
type FormOutput = z.output<typeof transactionSchema>;

const categoriesFor = (type: TransactionType): readonly string[] =>
  type === "expense" ? expenseCategories : incomeCategories;

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present when editing; absent when adding. */
  transaction?: Transaction | null;
  /** Type pre-selected when adding. */
  initialType?: TransactionType;
}

/** Add or edit a transaction. One form for both, so they can't drift apart. */
export function TransactionFormDialog({
  open,
  onOpenChange,
  transaction,
  initialType = "expense",
}: TransactionFormDialogProps) {
  const editing = Boolean(transaction);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {editing ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Update the details and save your changes."
              : "Fill in the details for your new transaction."}
          </DialogDescription>
        </DialogHeader>
        {/* Dialog content unmounts when closed, so the form starts fresh each time. */}
        <TransactionForm
          transaction={transaction}
          initialType={initialType}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function TransactionForm({
  transaction,
  initialType,
  onDone,
}: {
  transaction?: Transaction | null;
  initialType: TransactionType;
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction
      ? {
          name: transaction.name,
          amount: transaction.amount,
          currency: transaction.currency as FormInput["currency"],
          category: transaction.category,
          date: transaction.date,
          type: transaction.type,
          notes: transaction.notes ?? "",
        }
      : {
          name: "",
          amount: undefined,
          currency: BASE_CURRENCY,
          category: "",
          date: localToday(),
          type: initialType,
          notes: "",
        },
  });

  const type = useWatch({ control: form.control, name: "type" });
  const currency = useWatch({ control: form.control, name: "currency" });

  const onSubmit = (data: FormOutput) =>
    startTransition(async () => {
      const result = transaction
        ? await updateTransaction(transaction.id, data)
        : await createTransaction(data);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.success);
      onDone();
    });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value: TransactionType) => {
                  field.onChange(value);
                  // Clear a category that doesn't belong to the new type.
                  if (
                    !categoriesFor(value).includes(form.getValues("category"))
                  ) {
                    form.setValue("category", "");
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Coffee, Salary"
                  maxLength={100}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-gray-500 dark:text-gray-400">
                      {currencySymbol(currency)}
                    </span>
                    <Input
                      type="number"
                      inputMode="decimal"
                      placeholder="e.g., 25.50"
                      step="0.01"
                      min="0.01"
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={
                        typeof field.value === "number" &&
                        !Number.isNaN(field.value)
                          ? field.value
                          : ""
                      }
                      // Empty input means "no amount", not 0, so the field can be cleared.
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : e.target.valueAsNumber,
                        )
                      }
                      className="pl-10"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full sm:w-52">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={`Select ${type} category`} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60">
                  {categoriesFor(type).map((category) => {
                    return (
                      <SelectItem key={category} value={category}>
                        <span className="flex items-center gap-2">
                          <CategoryIcon
                            category={category}
                            className="h-4 w-4"
                          />
                          {category}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" max={localToday()} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional details..."
                  maxLength={200}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white font-semibold"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : transaction ? (
            "Save Transaction"
          ) : (
            "Add Transaction"
          )}
        </Button>
      </form>
    </Form>
  );
}
