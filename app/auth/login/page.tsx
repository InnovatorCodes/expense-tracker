import { LoginForm } from "./login-form";

// Error codes Auth.js appends as ?error= when a sign-in fails.
const ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "This email is already registered with a password. Sign in with your email and password instead.",
  AccessDenied: "Access was denied. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;
  const errorMessage = error
    ? (ERROR_MESSAGES[error] ?? "Sign-in failed. Please try again.")
    : undefined;
  return <LoginForm callbackUrl={callbackUrl} initialError={errorMessage} />;
}
