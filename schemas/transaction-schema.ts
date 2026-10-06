import * as z from "zod/v4";
import { currencyCodes } from "@/lib/money";
import { expenseCategories, incomeCategories } from "@/lib/categories";
import { isDateString } from "@/lib/dates";

const expenseSet = new Set<string>(expenseCategories);
const incomeSet = new Set<string>(incomeCategories);

export const transactionSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(100, "Name must not exceed 100 characters"),
    amount: z
      .number({ message: "Enter an amount" })
      .positive("Amount must be greater than 0")
      .max(10_000_000_000, "Amount is too large"),
    currency: z.enum(currencyCodes, { message: "Select a currency" }),
    category: z.string().min(1, "Category is required"),
    date: z.string().refine(isDateString, "Pick a valid date"),
    type: z.enum(["expense", "income"], {
      message: "Type must be 'expense' or 'income'",
    }),
    notes: z
      .string()
      .trim()
      .max(200, "Notes must not exceed 200 characters")
      .optional(),
  })
  .refine(
    (t) => (t.type === "expense" ? expenseSet : incomeSet).has(t.category),
    { message: "Pick a category that matches the type", path: ["category"] },
  );

export type TransactionInput = z.infer<typeof transactionSchema>;
