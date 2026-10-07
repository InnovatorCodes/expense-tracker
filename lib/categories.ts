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

/**
 * One fixed colour per category, used by charts and icons alike so a category
 * looks the same everywhere and from month to month. Mid-tone hues that read
 * on both light and dark backgrounds.
 */
const categoryColors: Record<string, string> = {
  [ALL_CATEGORIES]: "#6366F1",
  Food: "#F97316",
  Transport: "#3B82F6",
  Shopping: "#EC4899",
  Utilities: "#EAB308",
  Rent: "#8B5CF6",
  Health: "#EF4444",
  Education: "#06B6D4",
  Entertainment: "#D946EF",
  Bills: "#64748B",
  Groceries: "#22C55E",
  Travel: "#0EA5E9",
  "Other Expense": "#A8A29E",
  Salary: "#10B981",
  Freelance: "#14B8A6",
  Investments: "#84CC16",
  Gift: "#F43F5E",
  Refund: "#6366F1",
  "Other Income": "#78716C",
};

export const OTHER_COLOR = "#94A3B8";

export function getCategoryColor(category: string): string {
  return categoryColors[category] ?? OTHER_COLOR;
}
