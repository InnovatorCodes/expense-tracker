"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type * as z from "zod/v4";
import {
  User as UserIcon,
  Mail,
  LockKeyhole,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { signUpSchema } from "@/schemas/authentication-schema";
import { signUp } from "@/actions/signup";
import { GoogleLogin } from "@/components/google-button";
import { FormError } from "@/components/form-error";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type SignUpInput = z.input<typeof signUpSchema>;
type SignUpOutput = z.output<typeof signUpSchema>;

const FIELDS: {
  name: FieldPath<SignUpInput>;
  label: string;
  type: string;
  placeholder: string;
  autoComplete: string;
  icon: LucideIcon;
  maxLength: number;
}[] = [
  {
    name: "name",
    label: "Name",
    type: "text",
    placeholder: "John Doe",
    autoComplete: "name",
    icon: UserIcon,
    maxLength: 50,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "you@example.com",
    autoComplete: "email",
    icon: Mail,
    maxLength: 254,
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "••••••••",
    autoComplete: "new-password",
    icon: LockKeyhole,
    maxLength: 64,
  },
  {
    name: "passwordConfirmation",
    label: "Confirm Password",
    type: "password",
    placeholder: "••••••••",
    autoComplete: "new-password",
    icon: LockKeyhole,
    maxLength: 64,
  },
];

export default function SignUpPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const form = useForm<SignUpInput, unknown, SignUpOutput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit = (data: SignUpOutput) =>
    startTransition(async () => {
      setError("");
      // On success the user is signed in and redirected to the dashboard.
      const result = await signUp(data);
      if (result?.error) setError(result.error);
    });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md p-6 sm:p-8 bg-white dark:bg-gray-800 shadow-xl rounded-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-50">
            Create Your Account
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Join us to start managing your expenses!
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {FIELDS.map(({ name, label, icon: Icon, ...input }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <div className="relative flex items-center">
                          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                          <Input
                            {...field}
                            {...input}
                            value={field.value ?? ""}
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <FormError message={error} />
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white font-semibold"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                    account...
                  </>
                ) : (
                  "Sign Up with Email"
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

          <GoogleLogin />
        </CardContent>

        <CardFooter className="text-center text-sm text-gray-600 dark:text-gray-400 justify-center">
          Already have an account?
          <Link
            href="/auth/login"
            className="text-blue-600 hover:underline ml-1"
          >
            Log In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
