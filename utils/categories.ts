import {
  Utensils,
  Car,
  ShoppingBag,
  Home,
  Wallet,
  GraduationCap,
  Sparkles,
  PiggyBank,
  Briefcase,
  Plane,
  Hospital,
  Lightbulb,
  Banknote,
  Receipt,
  Gift,
  RefreshCw,
  Handshake,
  LayoutGrid, // For the Select trigger chevron
} from "lucide-react";

export const expenseCategories = [
  "Food",
  "Transport",
  "Shopping",
  "Utilities",
  "Rent",
  "Health",
  "Education",
  "Entertainment",
  "Bills",
  "Groceries",
  "Travel",
  "Other Expense",
];

export const budgetCategories = [
  "All",
  "Food",
  "Transport",
  "Shopping",
  "Utilities",
  "Rent",
  "Health",
  "Education",
  "Entertainment",
  "Bills",
  "Groceries",
  "Travel",
  "Other Expense",
];

export const incomeCategories = [
  "Salary",
  "Freelance",
  "Investments",
  "Gift",
  "Refund",
  "Other Income",
];

export const categoryIcons: { [key: string]: React.ElementType } = {
  // Expense Icons
  All: LayoutGrid,
  Food: Utensils,
  Transport: Car,
  Shopping: ShoppingBag,
  Utilities: Lightbulb, // Or specific utility icon if available
  Rent: Home,
  Health: Hospital,
  Education: GraduationCap,
  Entertainment: Sparkles,
  Bills: Receipt,
  Groceries: ShoppingBag, // Reusing shopping bag, or a cart icon
  Travel: Plane,
  "Other Expense": Wallet, // Generic wallet for other expenses

  // Income Icons
  Salary: Banknote,
  Freelance: Briefcase,
  Investments: PiggyBank,
  Gift: Gift,
  Refund: RefreshCw, // Icon for refund/return
  "Other Income": Handshake, // Generic for other income
};
