// components/SignUpPage.tsx
// This component provides the JSX structure for a modern and responsive signup page
// using Shadcn/ui and Tailwind CSS.
// It does NOT include any React state or logic for handling form submissions.

"use client"; // This component needs to be a Client Component for interactivity

import React, { useState } from 'react';
import { User as UserIcon, Mail, LockKeyhole, Loader2 } from 'lucide-react'; // Lucide icons
import { useForm } from 'react-hook-form';
import { zodResolver} from "@hookform/resolvers/zod"
import * as z from "zod/v4"; // Corrected import for Zod (standard way)
import { FormSuccess } from '@/components/form-success';
import { FormError } from '@/components/form-error';
import { signUp } from '@/actions/signup';
import { GoogleLogin } from '@/components/google-button';
import Link from 'next/link';

// Import shadcn/ui components
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
} from "@/components/ui/form"

import { signUpSchema } from '@/schemas/authentication-schema';


const SignUpPage: React.FC = () => {

    const [loading,setLoading]=useState(false);
    const [error,setError]=useState("");
    const [success,setSuccess]=useState("");

    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            // passwordConfirmation: "", // Only if your schema explicitly defines this field
            // Make sure your signUpSchema includes passwordConfirmation if you want to use it
        }
    })

    // Placeholder for form submission logic
    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {  
      setLoading(true);
      await signUp(data).then((res)=>{
        if(res.error) {
          setLoading(false);
          setError(res.error)
          setSuccess("")
        }
        else if(res.success){
          setLoading(false);
          setSuccess(res.success);
          setError("");
        }
      })
    };

  return (
    // Centering the card on the page using Tailwind flex utilities
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
          {/* Form for Credentials Signup */}
          <Form {...form} >
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4"> {/* Added native form tag for handleSubmit */}
              <FormField
                control={form.control}
                name='name'
                render={({field})=>(
                  <FormItem className='flex flex-col gap-2'>
                        <FormLabel className="text-gray-700 dark:text-gray-200">Name</FormLabel>
                        <FormControl>
                            <div className="relative flex items-center"> {/* Moved flex items-center here */}
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <Input
                                  {...field}
                                  id="name"
                                  type="text"
                                  placeholder="John Doe"
                                  minLength={1}
                                  maxLength={50} // Changed max length to 50 for name
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
                name="email"
                render={({field})=>(
                  <FormItem className='flex flex-col gap-2'>
                        <FormLabel className="text-gray-700 dark:text-gray-200">Email</FormLabel>
                        <FormControl>
                            <div className="relative flex items-center"> {/* Moved flex items-center here */}
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
                render={({field})=>(
                  <FormItem className='flex flex-col gap-2'>
                        <FormLabel className="text-gray-700 dark:text-gray-200">Password</FormLabel>
                        <FormControl>
                            <div className="relative flex items-center"> {/* Moved flex items-center here */}
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
              <FormField
                control={form.control}
                name="passwordConfirmation"
                render={({field})=>(
                   <FormItem className='flex flex-col gap-2'>
                      <FormLabel className="text-gray-700 dark:text-gray-200">Confirm Password</FormLabel> {/* Changed Label to FormLabel */}
                      <FormControl>
                          <div className="relative flex items-center"> {/* Moved flex items-center here */}
                            <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <Input
                              {...field}
                              id="passwordConfirmation"
                              type="password"
                              placeholder="••••••••"
                              minLength={6}
                              maxLength={64} // Set max length to 64 as discussed
                              required
                              className="pl-10 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 focus:ring-blue-500"
                            />
                          </div>
                      </FormControl>
                      <FormMessage /> {/* Add FormMessage for passwordConfirmation errors */}
                  </FormItem>
                  )}
              />
              <FormSuccess message={success} />
              <FormError message={error} />
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white font-semibold py-2 rounded-md transition-colors duration-200"
                disabled={loading} // Disable button when submission is pending
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing Up...
                  </>
                ) : (
                  "Sign Up with Email"
                )}
              </Button>
            </form>
          </Form>

          {/* Separator */}
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          </div>

          {/* Google OAuth Button */}
          <GoogleLogin />
        </CardContent>

        <CardFooter className="text-center text-sm text-gray-600 dark:text-gray-400 justify-center">
          Already have an account? {' '}
          <Link href='/auth/login' className="text-blue-600 hover:underline ml-1">Log In</Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUpPage;
