"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { safeCallbackUrl } from "@/lib/auth-redirect";

export async function googleAuthenticate(
  _prev: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await signIn("google", {
      redirectTo: safeCallbackUrl(formData.get("callbackUrl")),
    });
  } catch (error) {
    if (error instanceof AuthError)
      return "Google sign-in failed. Please try again.";
    throw error;
  }
}
