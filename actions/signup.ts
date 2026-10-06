"use server";

import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/prisma/prisma";
import { signIn } from "@/auth";
import { signUpSchema } from "@/schemas/authentication-schema";
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/auth-redirect";

const EXISTS = "An account with this email already exists. Try logging in.";

export async function signUp(
  input: unknown,
): Promise<{ error: string } | undefined> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { email, name, password } = parsed.data;

  try {
    if (await prisma.user.findUnique({ where: { email } })) {
      return { error: EXISTS };
    }
    await prisma.user.create({
      data: { email, name, password: await bcrypt.hash(password, 10) },
    });
  } catch (error) {
    // A concurrent sign-up with the same email hits the unique index.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: EXISTS };
    }
    console.error("signUp failed:", error);
    return { error: "Something went wrong. Please try again." };
  }

  // Log the new user straight in; this throws the redirect to the dashboard.
  await signIn("credentials", {
    email,
    password,
    redirectTo: DEFAULT_LOGIN_REDIRECT,
  });
}
