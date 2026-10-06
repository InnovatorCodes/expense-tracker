"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type * as z from "zod/v4";
import { Mail, LockKeyhole, Loader2 } from "lucide-react";
import { loginSchema } from "@/schemas/authentication-schema";
import { login } from "@/actions/login";
import { GoogleLogin } from "@/components/google-button";
import { FormError } from "@/components/form-error";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type LoginInput = z.input<typeof loginSchema>;

export function LoginForm({
  callbackUrl,
  initialError,
}: {
  callbackUrl?: string;
  initialError?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(initialError ?? "");

  const form = useForm<LoginInput, unknown, z.output<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: z.output<typeof loginSchema>) =>
    startTransition(async () => {
      setError("");
      // On success the action redirects, so a result only comes back on failure.
      const result = await login(data, callbackUrl);
      if (result?.error) setError(result.error);
    });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md p-6 sm:p-8 bg-white dark:bg-gray-800 shadow-xl rounded-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-50">
            Welcome Back!
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Sign in to manage your expenses.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative flex items-center">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                          {...field}
                          type="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative flex items-center">
                        <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                          {...field}
                          type="password"
                          autoComplete="current-password"
                          placeholder="••••••••"
                          maxLength={64}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormError message={error} />
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing
                    In...
                  </>
                ) : (
                  "Sign In with Email"
                )}
              </Button>
            </form>
          </Form>

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600" />
            <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm">
              OR
            </span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600" />
          </div>

          <GoogleLogin callbackUrl={callbackUrl} />
        </CardContent>

        <CardFooter className="text-center text-sm text-gray-600 dark:text-gray-400 justify-center">
          Don&apos;t have an account?
          <Link
            href="/auth/signup"
            className="text-blue-600 hover:underline ml-1"
          >
            Sign Up
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
