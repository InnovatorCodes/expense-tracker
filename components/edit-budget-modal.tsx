// components/CreateBudgetModal.tsx
"use client";

import React, { useState,useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Wallet } from 'lucide-react'; // Icons for loading, add, close
import { categoryIcons,budgetCategories } from '@/utils/categories';
import { budgetFormSchema } from '@/schemas/budget-schema';
import { modifyBudget } from '@/actions/budget';
import { currencySymbols } from '@/utils/currencies';

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { toast } from 'sonner'; // Assuming you use Sonner for toasts
import { Budget } from '@/types/budget';

type CreateBudgetFormInput = z.infer<typeof budgetFormSchema>;


interface CreateBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
  onSuccess: () => void;
  currency: string
}
const EditBudgetModal: React.FC<CreateBudgetModalProps> = ({ isOpen, onClose, budget, onSuccess, currency }) => {
  const[loading,setLoading]=useState(false);
  const getCurrencySymbol = (currencyCode:string) => {
      if (currencySymbols[currencyCode as keyof typeof currencySymbols]) {
        return currencySymbols[currencyCode as keyof typeof currencySymbols];
      }
      else return currencyCode
    };

  const form = useForm<CreateBudgetFormInput>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      category: "",
      amount: 0,
    },
  });

  useEffect(()=>{
      form.reset({
      amount: budget?.amount,
      category: budget?.category,
      })
  },[form,budget])

  const onSubmit = async (data: z.infer<typeof budgetFormSchema>) => {
      setLoading(true);
      form.clearErrors(); // Clear client-side errors
      if(budget){
      try {
        
        const result = await modifyBudget(data,budget.id)
  
        if (result.error) {
          setLoading(false);
          toast.error(result.error);
        } else if (result.success) {
          setLoading(false);
          toast.success(result.success);
          form.reset({ // Reset form to default values on success
            category: "",
            amount: 0,
          });
          onSuccess(); // Call success callback to close modal
        }
      } catch (e) {
        console.error("Failed to submit form:", e);
        toast.error("An unexpected error occurred.");
      }}
    };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:text-white">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Edit Budget</DialogTitle>
          <DialogDescription className="dark:text-gray-300">
            Modify your Budget
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col items-start gap-4">
            {/* Category Field */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-right dark:text-gray-300">Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="dark:bg-gray-800 dark:text-white max-h-48 overflow-y-auto">
                      {budgetCategories.map((category) => {
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
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount Field */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-right dark:text-gray-300">Amount</FormLabel>
                  <FormControl>
                    <div className='relative flex items-center'>
                        <span className="absolute left-3 text-gray-500 dark:text-gray-400">
                            {getCurrencySymbol(currency)}
                        </span>
                        <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="e.g., 500.00"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        className="pl-8 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                        />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className='self-stretch'>
              <Button type="submit" disabled={loading} className="w-full dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    Save Budget
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBudgetModal;
