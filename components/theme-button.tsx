"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export const ThemeButton = () => {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      // resolvedTheme accounts for "system", so the first click always flips the look.
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full bg-muted hover:bg-muted/70 text-foreground transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Toggle dark mode"
    >
      {/* Icons switch via CSS, so server and client render the same markup. */}
      <Moon className="w-5 h-5 dark:hidden" />
      <Sun className="w-5 h-5 hidden dark:block" />
    </button>
  );
};
