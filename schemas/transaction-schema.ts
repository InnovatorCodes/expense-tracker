// lib/validation/transactionSchema.ts
// Zod schema for validating input when adding a new transaction.

import { z } from "zod";

export const addTransactionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must not exceed 100 characters"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"), // Use z.coerce.number() for string-to-number conversion
  category: z.string().min(1, "Category is required").max(50, "Category must not exceed 50 characters"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  currency: z.string().min(1, "Currency is required").max(10, "Currency must not exceed 10 characters"),
  type: z.enum(["expense", "income"], { message: "Type must be 'expense' or 'income'" }), // Enforce specific types
  notes: z.string().max(200, "Notes must not exceed 200 characters").optional().or(z.literal('')), // Optional, allow empty string
});

