// components/TransactionForm.tsx
// This is a client component for adding new expense or income transactions.

"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod/v4";
import { Loader2 } from 'lucide-react'; // For loading spinner, add, cancel icons

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
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Your Zod schema for transaction validation
import { addTransactionSchema } from '@/schemas/transaction-schema';
// Your Server Action for creating a transaction
import { createTransaction } from '@/actions/transaction';
// For displaying server messages
import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';
import { TransactionType } from '@/types/transaction'; // Import TransactionType

// Define props for the TransactionForm
interface TransactionFormProps {
  initialType?: TransactionType; // Optional: to pre-select 'expense' or 'income'
  defaultCurrency?: string; // Optional: default currency code, e.g., 'INR', 'USD'
  onSuccess: () => void; // Callback to handle success (e.g., close modal, show toast)
}

const TransactionForm: React.FC<TransactionFormProps> = ({ initialType = 'expense',defaultCurrency='INR' , onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const form = useForm<z.infer<typeof addTransactionSchema>>({
    resolver: zodResolver(addTransactionSchema),
    defaultValues: {
      name: "",
      amount: 0, // Default to 0 for amount
      category: "",
      date: new Date().toISOString().split('T')[0], // Default to current date (YYYY-MM-DD)
      type: initialType, // Set initial type from props
      notes: "",
    },
  });

  // Watch the currency field to dynamically display the symbol

  // Reset form values when initialType prop changes (e.g., switching between add expense/income)


  const onSubmit = async (data: z.infer<typeof addTransactionSchema>) => {
    console.log("Submitting form with data:", data);
    setLoading(true);
    setError("");
    setSuccess("");
    form.clearErrors(); // Clear client-side errors

    try {
      const result = await createTransaction(data);

      if (result.error) {
        setLoading(false);
        setSuccess("");
        setError(result.error);
      } else if (result.success) {
        setLoading(false);
        setError("");
        setSuccess(result.success);
        form.reset({ // Reset form to default values on success
          name: "",
          category: "",
          date: new Date().toISOString().split('T')[0],
          type: initialType, // Reset to the initial type provided
          notes: "",
        });
        onSuccess(); // Call success callback to close modal
      }
    } catch (e) {
      console.error("Failed to submit form:", e);
      setError("An unexpected error occurred.");
    }
  };

  const getCurrencySymbol = (currencyCode: string) => {
    switch (currencyCode) {
      case 'INR':
        return '₹';
      case 'USD':
        return '$';
      default:
        return ''; // Or a default symbol if needed
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}  className="space-y-6">
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
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-gray-500 dark:text-gray-400">
                    {getCurrencySymbol(defaultCurrency)}
                  </span>
                  <Input
                    type="number"
                    placeholder="e.g., 25.50"
                    step="0.01"
                    min="0.01"
                    {...field}
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    className="pl-8 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600" // Adjusted padding-left
                  />
                </div>
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
            <>
              Add Transaction
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default TransactionForm;
