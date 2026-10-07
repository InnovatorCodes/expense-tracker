"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type * as z from "zod/v4";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { budgetFormSchema } from "@/schemas/budget-schema";
import { createBudget, updateBudget } from "@/actions/budget";
import { budgetCategories } from "@/lib/categories";
import { BASE_CURRENCY, currencySymbol } from "@/lib/money";
import type { Budget } from "@/types/budget";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/category-icon";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type FormInput = z.input<typeof budgetFormSchema>;
type FormOutput = z.output<typeof budgetFormSchema>;

/** Create or edit a monthly budget. */
export function BudgetFormDialog({
  open,
  onOpenChange,
  budget,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: Budget | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle>
            {budget ? "Edit Budget" : "Create New Budget"}
          </DialogTitle>
          <DialogDescription>
            A monthly spending limit for one category, or for all spending.
          </DialogDescription>
        </DialogHeader>
        <BudgetForm budget={budget} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function BudgetForm({
  budget,
  onDone,
}: {
  budget?: Budget | null;
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: budget
      ? {
          category: budget.category as FormInput["category"],
          amount: budget.amount,
        }
      : { category: undefined, amount: undefined },
  });

  const onSubmit = (data: FormOutput) =>
    startTransition(async () => {
      const result = budget
        ? await updateBudget(budget.id, data)
        : await createBudget(data);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.success);
      onDone();
    });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60">
                  {budgetCategories.map((category) => {
                    return (
                      <SelectItem key={category} value={category}>
                        <span className="flex items-center gap-2">
                          <CategoryIcon
                            category={category}
                            className="h-4 w-4"
                          />
                          {category === "All" ? "All spending" : category}
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
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly limit</FormLabel>
              <FormControl>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-muted-foreground">
                    {currencySymbol(BASE_CURRENCY)}
                  </span>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0.01"
                    placeholder="e.g., 5000"
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={
                      typeof field.value === "number" &&
                      !Number.isNaN(field.value)
                        ? field.value
                        : ""
                    }
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : e.target.valueAsNumber,
                      )
                    }
                    className="pl-8"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : budget ? (
              "Save Budget"
            ) : (
              "Create Budget"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
