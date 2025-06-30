// app/actions/transaction.ts
// This file defines a server action for adding a new transaction (expense or income).

"use server";

import * as z from "zod/v4";
import { auth } from "@/auth"; // Import the server-side auth function
import { addBudget } from "@/utils/firebase"; // Import Firestore utility
import { budgetFormSchema } from "@/schemas/budget-schema";
import { updateBudget } from "@/utils/firebase";

/**
 * Server Action to add a new transaction (expense or income) to Firestore.
 * This function runs on the server.
 *
 * @param prevState The previous state from useFormState (ignored in this simplified direct call).
 * @param formData The FormData object submitted from the client form.
 * @returns An object indicating success or error.
 */
export async function createBudget(formData: z.infer<typeof budgetFormSchema>) {
  const session = await auth(); // Get the authenticated user's session on the server

  if (!session?.user?.id) {
    return { error: "You must be logged in to add a budget." };
  }

  try {
    // Server-side validation using Zod
    const validatedData = budgetFormSchema.parse(formData);
    if (!validatedData) {
      return { error: "Invalid budget data provided." };
    }

    await addBudget(session.user.id, validatedData);

    return { success: "Budget added successfully!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Server-side validation error");
      return { error: "Validation failed. Please check your input." };
    }
    console.error("Error creating budget:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred.",
    };
  }
}

export async function modifyBudget(
  updatedData: z.infer<typeof budgetFormSchema>,
  budgetId: string,
) {
  const session = await auth(); // Get the authenticated user's session on the server

  if (!session?.user?.id) {
    return { error: "You must be logged in to update a transaction." };
  }

  try {
    // Server-side validation using Zod
    const validatedData = budgetFormSchema.parse(updatedData);
    if (!validatedData) {
      return { error: "Invalid budget data provided." };
    }
    // Add the transaction to Firestore
    await updateBudget(session.user.id, budgetId, validatedData);
    return { success: "Budget updated successfully!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Server-side validation error");
      return { error: "Validation failed. Please check your input." };
    }
    console.error("Error updating transaction:", error);
    return { error: "Failed to update transaction. Please try again." };
  }
}
