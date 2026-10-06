"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { getUserId } from "@/lib/server/session";
import { getDb, transactionsCol, userDoc } from "@/lib/server/firebase-admin";
import { getExchangeRates, rateFor } from "@/lib/server/exchange-rates";
import { roundMoney } from "@/lib/money";
import { transactionSchema } from "@/schemas/transaction-schema";
import { docIdSchema } from "@/schemas/id-schema";
import type { ActionResult } from "@/types/action";

/** Refresh every page that shows transaction-derived numbers. */
function revalidateAll() {
  revalidatePath("/", "layout");
}

/**
 * Converts an amount to the base currency at the rate captured right now.
 * Rates always come from the server, never from the client.
 */
async function captureRate(currency: string) {
  const { rates, stale } = await getExchangeRates();
  const exchangeRate = rateFor(rates, currency);
  return {
    exchangeRate,
    rateCapturedAt: new Date().toISOString(),
    rateIsFallback: stale,
  };
}

export async function createTransaction(input: unknown): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { error: "You must be logged in to add a transaction." };

  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Validation failed. Please check your input." };
  }
  const data = parsed.data;

  try {
    const amount = roundMoney(data.amount);
    const rate = await captureRate(data.currency);
    await transactionsCol(userId).add({
      ...data,
      notes: data.notes ?? "",
      amount,
      baseAmount: roundMoney(amount / rate.exchangeRate),
      ...rate,
      createdAt: FieldValue.serverTimestamp(),
    });
    // Make sure the user document exists for settings such as the pinned budget.
    await userDoc(userId).set(
      { updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
  } catch (e) {
    console.error("createTransaction failed:", e);
    return { error: "Failed to add the transaction. Please try again." };
  }

  revalidateAll();
  return { success: "Transaction added." };
}

export async function updateTransaction(
  id: unknown,
  input: unknown,
): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) {
    return { error: "You must be logged in to update a transaction." };
  }

  const parsedId = docIdSchema.safeParse(id);
  const parsed = transactionSchema.safeParse(input);
  if (!parsedId.success || !parsed.success) {
    return { error: "Validation failed. Please check your input." };
  }
  const data = parsed.data;
  const amount = roundMoney(data.amount);
  const ref = transactionsCol(userId).doc(parsedId.data);

  try {
    // Fetched outside the Firestore transaction so a slow API call can't hold it open.
    const fresh = await captureRate(data.currency);
    const found = await getDb().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return false;
      const existing = snap.data()!;
      // Keep the historical rate unless the currency itself changed, so editing
      // a name or note never silently re-values an old transaction.
      const keepRate =
        existing.currency === data.currency &&
        typeof existing.exchangeRate === "number";
      const rate = keepRate
        ? {
            exchangeRate: existing.exchangeRate as number,
            rateCapturedAt: existing.rateCapturedAt ?? null,
            rateIsFallback: existing.rateIsFallback ?? false,
          }
        : fresh;
      tx.update(ref, {
        ...data,
        notes: data.notes ?? "",
        amount,
        baseAmount: roundMoney(amount / rate.exchangeRate),
        ...rate,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return true;
    });
    if (!found) return { error: "That transaction no longer exists." };
  } catch (e) {
    console.error("updateTransaction failed:", e);
    return { error: "Failed to update the transaction. Please try again." };
  }

  revalidateAll();
  return { success: "Transaction updated." };
}

export async function deleteTransaction(id: unknown): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) {
    return { error: "You must be logged in to delete a transaction." };
  }
  const parsedId = docIdSchema.safeParse(id);
  if (!parsedId.success) return { error: "Invalid transaction." };

  try {
    await transactionsCol(userId).doc(parsedId.data).delete();
  } catch (e) {
    console.error("deleteTransaction failed:", e);
    return { error: "Failed to delete the transaction. Please try again." };
  }

  revalidateAll();
  return { success: "Transaction deleted." };
}
