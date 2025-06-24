// components/AddTransactionForm.tsx
// This is a client component for adding new expense or income transactions.

"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from 'lucide-react'; // For loading spinner

// Shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea"; // For notes field
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Your Zod schema for transaction validation
import { addTransactionSchema} from '@/schemas/transaction-schema';
// Your Server Action for creating a transaction
import { createTransaction } from '@/actions/transaction';
// For displaying server messages
import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';
import { z } from 'zod';

const AddTransactionForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);

  const form = useForm<z.infer<typeof addTransactionSchema>>({
    resolver: zodResolver(addTransactionSchema),
    defaultValues: {
      name: "",
      amount: 0,
      category: "",
      date: new Date().toISOString().split('T')[0], // Default to current date YYYY-MM-DD
      currency: "USD", // Default currency
      type: "expense", // Default to expense
      notes: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof addTransactionSchema>) => {
    setLoading(true);
    setError("");
    setSuccess("");
    form.clearErrors(); // Clear client-side errors
    try {
      const result = await createTransaction(data); // Call the Server Action

      if (result.error) {
        setLoading(false);
        setError(result.error);
        setSuccess("");
      } else if (result.success) {
        setLoading(false);
        setError(""); 
        setSuccess(result.success);
        form.reset({ // Reset form to default values on success
          name: "",
          amount: 0,
          category: "",
          date: new Date().toISOString().split('T')[0],
          currency: "USD",
          type: "expense",
          notes: "",
        });
      }
    } catch (e) {
      console.error("Failed to submit form:", e);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-8 p-6 dark:bg-gray-800 shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">Add New Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Coffee, Salary" {...field} className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    {/* Use type="number" for native number input, pass min/step for browser validation */}
                    <Input
                      type="number"
                      placeholder="e.g., 25.50"
                      step="0.01"
                      min="0.01"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)} // Ensure number type
                      className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Food, Utilities" {...field} className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., USD" {...field} className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600">
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional details..." {...field} className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormError message={error} />
            <FormSuccess message={success} />
            <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white font-semibold py-2 rounded-md transition-colors duration-200">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                </>
              ) : (
                "Add Transaction"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddTransactionForm;
