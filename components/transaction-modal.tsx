// components/TransactionModal.tsx
"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TransactionForm from './add-transaction-form'; // Import the updated TransactionForm
import { TransactionType } from '@/types/transaction'; // Import TransactionType

interface TransactionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void; // Callback when dialog open state changes
  initialType: TransactionType; // Type to pre-fill the form
  onSuccess: () => void; // Callback for successful form submission
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onOpenChange,
  initialType,
  onSuccess,
}) => {
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
        <TransactionForm
          initialType={initialType}
          onSuccess={() => {
            onSuccess(); // Call parent's success handler
            onOpenChange(false); // Close modal on success
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;
