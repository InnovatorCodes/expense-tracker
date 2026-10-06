import { createElement, type ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import { getCategoryIcon } from "@/lib/categories";

/** Renders the icon for a category (with a fallback for unknown ones). */
export function CategoryIcon({
  category,
  ...props
}: { category: string } & ComponentProps<LucideIcon>) {
  // Icons are static module-level components, so looking one up is safe.
  return createElement(getCategoryIcon(category), props);
}
