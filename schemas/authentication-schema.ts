import * as z from "zod/v4";

// bcrypt only uses the first 72 bytes of a password, so cap the length well below that.
const password = z
  .string()
  .min(6, "Password must be at least 6 characters long")
  .max(64, "Password must not exceed 64 characters");

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address"));

export const signUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(50, "Name must not exceed 50 characters"),
    email,
    password,
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required").max(64),
});
