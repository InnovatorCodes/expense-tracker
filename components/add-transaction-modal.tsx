// components/TransactionModal.tsx
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
// Your Zod schema for transaction validation
import { transactionSchema } from '@/schemas/transaction-schema';
// Your Server Action for creating a transaction
import { createTransaction } from '@/actions/transaction';
import * as z from "zod/v4";
import { Loader2, Wallet } from 'lucide-react'; // For loading spinner, add, cancel icons
import { toast } from 'sonner';
import { categoryIcons } from '@/utils/categories';

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransactionType } from '@/types/transaction'; // Import TransactionType

interface TransactionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void; // Callback when dialog open state changes
  initialType: TransactionType; // Type to pre-fill the form
  onSuccess: () => void; // Callback for successful form submission
  currency: string
}

const expenseCategories = [
  'Food', 'Transport', 'Shopping', 'Utilities', 'Rent', 'Health', 'Education',
  'Entertainment', 'Bills', 'Groceries', 'Travel', 'Other Expense'
];

const incomeCategories = [
  'Salary', 'Freelance', 'Investments', 'Gift', 'Refund', 'Other Income'
];

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onOpenChange,
  initialType,
  onSuccess,
  currency
}) => {

  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      name: "",
      amount: 0, // Default to 0 for amount
      category: "",
      date: new Date().toISOString().split('T')[0], // Default to current date (YYYY-MM-DD)
      type: initialType, // Set initial type from props
      notes: "",
    },
  });

  const transactionType = form.watch("type");
  const categoriesToShow = transactionType === 'expense' ? expenseCategories : incomeCategories;

  const getCurrencySymbol = () => {
    switch (currency) {
      case 'INR':
        return '₹';
      case 'USD':
        return '$';
      default:
        return ''; // Or a default symbol if needed
    }
  };

  const onSubmit = async (data: z.infer<typeof transactionSchema>) => {
    console.log("Submitting form with data:", data);
    setLoading(true);
    form.clearErrors(); // Clear client-side errors

    try {
      const result = await createTransaction(data);

      if (result.error) {
        setLoading(false);
        toast.error(result.error);
      } else if (result.success) {
        setLoading(false);
        toast.success(result.success);
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
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl p-6 dark:bg-gray-800 rounded-lg shadow-xl">
        {/* DialogHeader and DialogDescription will be overridden by the CardHeader/Title inside TransactionForm */}
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>Add Transaction</DialogTitle>
          <DialogDescription>
            Fill in the details for your new {initialType}.
          </DialogDescription>
        </DialogHeader>
        {/* Pass props to TransactionForm */}
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
                        {getCurrencySymbol()}
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
                  <Select onValueChange={field.onChange} value={field.value || ""} disabled={!transactionType}>
                    <FormControl>
                      <SelectTrigger className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                        <SelectValue placeholder={transactionType ? `Select ${transactionType} category` : "Select a type first"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 max-h-48 overflow-y-auto">
                      {transactionType && categoriesToShow.map((category) => {
                        const Icon = categoryIcons[category] || Wallet; // Fallback icon
                        return (
                          <SelectItem key={category} value={category}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span>{category}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                      {!transactionType && (
                        <SelectItem value="" disabled>Please select a transaction type first.</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
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
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;
