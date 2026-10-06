import * as z from "zod/v4";
import { budgetCategories } from "@/lib/categories";

export const budgetFormSchema = z.object({
  category: z.enum(budgetCategories, { message: "Category is required" }),
  amount: z
    .number({ message: "Enter an amount" })
    .positive("Amount must be greater than 0")
    .max(10_000_000_000, "Amount is too large"),
});

export type BudgetInput = z.infer<typeof budgetFormSchema>;
