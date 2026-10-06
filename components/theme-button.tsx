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
      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      aria-label="Toggle dark mode"
    >
      {/* Icons switch via CSS, so server and client render the same markup. */}
      <Moon className="w-6 h-6 dark:hidden" />
      <Sun className="w-6 h-6 hidden dark:block" />
    </button>
  );
};
