"use client"; // This file is a client component

import { Sun, Moon } from "lucide-react"; // Import icons for the toggle button
import { useTheme } from "next-themes"; // Import useTheme hook from next-themes

export const ThemeButton = () => {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")} // Use setTheme from useTheme
      className="p-2 rounded-full bg-gray-300 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Toggle dark mode"
    >
      {theme === "light" ? (
        <Moon className="w-6 h-6" /> // Shows Moon icon when in light mode
      ) : (
        <Sun className="w-6 h-6" /> // Shows Sun icon when in dark mode
      )}
    </button>
  );
};
