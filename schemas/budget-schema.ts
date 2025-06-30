// lib/validation/budgetSchema.ts
import { z } from "zod";
// Define the recurrence types for budgets

export const budgetFormSchema = z.object({
  category: z
    .string()
    .min(1, "Category is required")
    .max(50, "Category must not exceed 50 characters"),
  amount: z.number().min(0.01, "Amount must be a positive number"),
});
