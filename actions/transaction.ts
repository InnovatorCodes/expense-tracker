// app/actions/transaction.ts
// This file defines a server action for adding a new transaction (expense or income).

"use server";

import * as z from "zod/v4";
import { auth } from "@/auth"; // Import the server-side auth function
import { addTransaction, updateTransaction } from "@/utils/firebase"; // Import Firestore utility
import { transactionSchema } from "@/schemas/transaction-schema"; // Import Zod schema
import { Transaction } from "@/types/transaction";

/**
 * Server Action to add a new transaction (expense or income) to Firestore.
 * This function runs on the server.
 *
 * @param prevState The previous state from useFormState (ignored in this simplified direct call).
 * @param formData The FormData object submitted from the client form.
 * @returns An object indicating success or error.
 */
export async function createTransaction(
  formData: z.infer<typeof transactionSchema>,
  exchageRates: Record<string, number>,
) {
  const session = await auth(); // Get the authenticated user's session on the server

  if (!session?.user?.id) {
    return { error: "You must be logged in to add a transaction." };
  }

  try {
    // Server-side validation using Zod
    const validatedData = transactionSchema.parse(formData);
    if (!validatedData) {
      return { error: "Invalid transaction data provided." };
    }

    // Add the transaction to Firestore
    await addTransaction(session.user.id, validatedData, exchageRates);

    return { success: "Transaction added successfully!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Server-side validation error");
      return { error: "Validation failed. Please check your input." };
    } else {
      console.error("Error creating transaction:", error);
      return {
        error:
          "Failed to create budget. May be due to existing budget for category",
      };
    }
  }
}

export async function modifyTransaction(
  updatedData: z.infer<typeof transactionSchema>,
  originalTransaction: Transaction,
  exchangeRates: Record<string, number>,
) {
  const session = await auth(); // Get the authenticated user's session on the server

  if (!session?.user?.id) {
    return { error: "You must be logged in to update a transaction." };
  }

  try {
    // Server-side validation using Zod
    const validatedData = transactionSchema.parse(updatedData);
    if (!validatedData) {
      return { error: "Invalid transaction data provided." };
    }

    // Add the transaction to Firestore
    await updateTransaction(
      session.user.id,
      originalTransaction.id,
      updatedData,
      originalTransaction,
      exchangeRates,
    );

    return { success: "Transaction updated successfully!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Server-side validation error");
      return { error: "Validation failed. Please check your input." };
    }
    console.error("Error updating transaction:", error);
    return { error: "Failed to update transaction. Please try again." };
  }
}
