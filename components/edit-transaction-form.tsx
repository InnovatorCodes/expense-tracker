// components/EditTransactionModal.tsx
"use client";

import React, { useEffect, useState } from 'react';
import * as z from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Transaction } from '@/types/transaction';
import { transactionSchema } from '@/schemas/transaction-schema';
import { Button } from '@/components/ui/button';
import { categoryIcons,expenseCategories,incomeCategories } from '@/utils/categories';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wallet } from 'lucide-react';
import { toast } from 'sonner'; 
import { modifyTransaction } from '@/actions/transaction';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onSave: () => void;
  currency: string; // Pass the user's default currency
}



const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onSave,
  currency,
}) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      name: "",
      amount: 0,
      type: "expense",
      category: "",
      // Format date for input[type="date"] (YYYY-MM-DD)
      date: new Date().toISOString().split('T')[0], // Assuming  is already in 'YYYY-MM-DD' string format
      notes: "",
    },
  });

  const transactionType = form.watch("type");
  const categoriesToShow = transactionType === 'expense' ? expenseCategories : incomeCategories;

  useEffect(()=>{
    form.reset({
      name: transaction?.name,
      amount: transaction?.amount,
      date: transaction?.date,
      category: transaction?.category,
      type: transaction?.type,
      notes: transaction?.notes
    })
  },[form,transaction])

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
        setLoading(true);
        form.clearErrors(); // Clear client-side errors
    
        if(transaction){
          try {
            const result=await modifyTransaction(data,transaction);
      
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
                type: "expense", // Reset to the initial type provided
                notes: "",
              });
              onSave(); // Call success callback to close modal
            }
          } catch (e) {
            console.error("Failed to submit form:", e);
            toast.error("An unexpected error occurred.");
          }
        }
      };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl p-6 dark:bg-gray-800 rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Edit Transaction</DialogTitle>
          <DialogDescription className="dark:text-gray-300">
            Make changes to your transaction here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
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
                    <Select onValueChange={(value: "income" | "expense")=>{
                      field.onChange(value)
                      form.setValue("category",value)
                    }} defaultValue={field.value}>
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                ) : (
                    <>
                    Save Transaction
                    </>
                )}
                </Button>
            </form>
            </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTransactionModal;
