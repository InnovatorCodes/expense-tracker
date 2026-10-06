import {
  Utensils,
  Car,
  ShoppingBag,
  ShoppingCart,
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
  LayoutGrid,
  type LucideIcon,
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
] as const;

export const incomeCategories = [
  "Salary",
  "Freelance",
  "Investments",
  "Gift",
  "Refund",
  "Other Income",
] as const;

/** Budget that tracks total spending across every expense category. */
export const ALL_CATEGORIES = "All";

export const budgetCategories = [ALL_CATEGORIES, ...expenseCategories] as const;

const categoryIcons: Record<string, LucideIcon> = {
  [ALL_CATEGORIES]: LayoutGrid,
  Food: Utensils,
  Transport: Car,
  Shopping: ShoppingBag,
  Utilities: Lightbulb,
  Rent: Home,
  Health: Hospital,
  Education: GraduationCap,
  Entertainment: Sparkles,
  Bills: Receipt,
  Groceries: ShoppingCart,
  Travel: Plane,
  "Other Expense": Wallet,
  Salary: Banknote,
  Freelance: Briefcase,
  Investments: PiggyBank,
  Gift: Gift,
  Refund: RefreshCw,
  "Other Income": Handshake,
};

/** Icon for a category, with a safe fallback for unknown or legacy values. */
export function getCategoryIcon(category: string): LucideIcon {
  return categoryIcons[category] ?? Wallet;
}
