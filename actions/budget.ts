"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { getUserId } from "@/lib/server/session";
import { budgetsCol, getDb, userDoc } from "@/lib/server/firebase-admin";
import { roundMoney } from "@/lib/money";
import { budgetFormSchema } from "@/schemas/budget-schema";
import { docIdSchema } from "@/schemas/id-schema";
import type { ActionResult } from "@/types/action";

class UserFacingError extends Error {}

function revalidateAll() {
  revalidatePath("/", "layout");
}

function failure(e: unknown, fallback: string): ActionResult {
  if (e instanceof UserFacingError) return { error: e.message };
  console.error(fallback, e);
  return { error: fallback };
}

export async function createBudget(input: unknown): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { error: "You must be logged in to add a budget." };

  const parsed = budgetFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Validation failed. Please check your input." };
  }
  const { category, amount } = parsed.data;
  const col = budgetsCol(userId);

  try {
    // Check and insert atomically so two quick submits can't create duplicates.
    await getDb().runTransaction(async (tx) => {
      const existing = await tx.get(
        col.where("category", "==", category).limit(1),
      );
      if (!existing.empty) {
        throw new UserFacingError(`A budget for '${category}' already exists.`);
      }
      tx.create(col.doc(), {
        category,
        amount: roundMoney(amount),
        createdAt: FieldValue.serverTimestamp(),
      });
    });
  } catch (e) {
    return failure(e, "Failed to create the budget. Please try again.");
  }

  revalidateAll();
  return { success: "Budget added." };
}

export async function updateBudget(
  id: unknown,
  input: unknown,
): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { error: "You must be logged in to update a budget." };

  const parsedId = docIdSchema.safeParse(id);
  const parsed = budgetFormSchema.safeParse(input);
  if (!parsedId.success || !parsed.success) {
    return { error: "Validation failed. Please check your input." };
  }
  const { category, amount } = parsed.data;
  const col = budgetsCol(userId);
  const ref = col.doc(parsedId.data);

  try {
    await getDb().runTransaction(async (tx) => {
      const [snap, clash] = await Promise.all([
        tx.get(ref),
        tx.get(col.where("category", "==", category).limit(2)),
      ]);
      if (!snap.exists)
        throw new UserFacingError("That budget no longer exists.");
      if (clash.docs.some((d) => d.id !== ref.id)) {
        throw new UserFacingError(`A budget for '${category}' already exists.`);
      }
      tx.update(ref, { category, amount: roundMoney(amount) });
    });
  } catch (e) {
    return failure(e, "Failed to update the budget. Please try again.");
  }

  revalidateAll();
  return { success: "Budget updated." };
}

export async function deleteBudget(id: unknown): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { error: "You must be logged in to delete a budget." };
  const parsedId = docIdSchema.safeParse(id);
  if (!parsedId.success) return { error: "Invalid budget." };

  try {
    await getDb().runTransaction(async (tx) => {
      const user = await tx.get(userDoc(userId));
      tx.delete(budgetsCol(userId).doc(parsedId.data));
      // Don't leave the dashboard pointing at a budget that no longer exists.
      if (user.get("pinnedBudget") === parsedId.data) {
        tx.set(userDoc(userId), { pinnedBudget: null }, { merge: true });
      }
    });
  } catch (e) {
    return failure(e, "Failed to delete the budget. Please try again.");
  }

  revalidateAll();
  return { success: "Budget deleted." };
}

/** Pins a budget to the dashboard, or unpins it if it is already pinned. */
export async function togglePinnedBudget(id: unknown): Promise<ActionResult> {
  const userId = await getUserId();
  if (!userId) return { error: "You must be logged in to pin a budget." };
  const parsedId = docIdSchema.safeParse(id);
  if (!parsedId.success) return { error: "Invalid budget." };

  let pinned = false;
  try {
    await getDb().runTransaction(async (tx) => {
      const [user, budget] = await Promise.all([
        tx.get(userDoc(userId)),
        tx.get(budgetsCol(userId).doc(parsedId.data)),
      ]);
      if (!budget.exists)
        throw new UserFacingError("That budget no longer exists.");
      pinned = user.get("pinnedBudget") !== parsedId.data;
      tx.set(
        userDoc(userId),
        { pinnedBudget: pinned ? parsedId.data : null },
        { merge: true },
      );
    });
  } catch (e) {
    return failure(e, "Failed to update the pinned budget. Please try again.");
  }

  revalidateAll();
  return {
    success: pinned ? "Budget pinned to dashboard." : "Budget unpinned.",
  };
}
