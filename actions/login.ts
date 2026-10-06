"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { loginSchema } from "@/schemas/authentication-schema";
import { safeCallbackUrl } from "@/lib/auth-redirect";

const INVALID =
  "Invalid email or password. If you signed up with Google, use 'Sign in with Google'.";

export async function login(
  input: unknown,
  callbackUrl?: string,
): Promise<{ error: string } | undefined> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { error: INVALID };

  try {
    // On success this throws a redirect, which Next.js turns into navigation.
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: safeCallbackUrl(callbackUrl),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // Same message for unknown email and wrong password, so the form
      // can't be used to discover which emails have accounts.
      return error.type === "CredentialsSignin"
        ? { error: INVALID }
        : { error: "Sign-in failed. Please try again." };
    }
    throw error;
  }
}
