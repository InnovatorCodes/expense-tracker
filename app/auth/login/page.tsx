"use client"; // This component needs to be a Client Component due to interactive elements and hooks.

import React, { useState } from "react";
import * as z from "zod/v4";
import { Mail, LockKeyhole } from "lucide-react"; // Lucide icons for email/password fields
import { loginSchema } from "@/schemas/authentication-schema";
import { login } from "@/actions/login";
import { GoogleLogin } from "@/components/google-button";
import Link from "next/link";
import { Loader2 } from "lucide-react";

// Import shadcn/ui components
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
import { FormError } from "@/components/form-error";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const LoginPage: React.FC = () => {
  // Redirect to dashboard if user is already logged in
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handles signing in with email and password using the Credentials provider
  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setLoading(true);
    await login(data).then(async (res) => {
      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else {
        // Force a cache-busting redirect
        window.location.href = `/dashboard?t=${new Date().getTime()}`;
      }
    });
  };
  // Handles signing in with Google OAuth provider

  return (
    // Centering the card on the page using Tailwind flex utilities
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
          {/* Credentials Login Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel className="text-gray-700 dark:text-gray-200">
                      Email
                    </FormLabel>
                    <FormControl>
                      <div className="relative flex items-center">
                        {" "}
                        {/* Moved flex items-center here */}
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                          {...field}
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          required
                          className="pl-10 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 focus:ring-blue-500"
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
                    <FormLabel className="text-gray-700 dark:text-gray-200">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative flex items-center">
                        {" "}
                        {/* Moved flex items-center here */}
                        <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                          {...field}
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          minLength={6}
                          maxLength={64} // Set max length to 64 as discussed
                          required
                          className="pl-10 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 focus:ring-blue-500"
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
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold py-2 rounded-md transition-colors duration-200"
                disabled={loading}
              >
                {loading ? (
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

          {/* Separator */}
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm">
              OR
            </span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          </div>

          {/* Google OAuth Button */}
          <GoogleLogin />
        </CardContent>

        <CardFooter className="text-center text-sm text-gray-600 dark:text-gray-400 justify-center">
          Don{"'"}t have an account?{" "}
          {/* <Link href="/register" className="text-blue-600 hover:underline">Sign Up</Link> */}
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
};

export default LoginPage;
