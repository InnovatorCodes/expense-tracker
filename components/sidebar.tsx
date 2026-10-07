"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  DollarSign,
  HelpCircle,
  LogOut,
  Wallet,
  Menu,
  X,
  ArrowLeftRight,
} from "lucide-react";
import { signOut } from "@/actions/signout";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { ThemeButton } from "./theme-button";

const menuItems = [
  { icon: Home, name: "Dashboard", href: "/dashboard" },
  { icon: ArrowLeftRight, name: "Transactions", href: "/transactions" },
  { icon: Wallet, name: "Budgets", href: "/budgets" },
  { icon: HelpCircle, name: "Help", href: "/help" },
];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-2">
      <span className="bg-indigo-600 p-1.5 rounded-lg">
        <DollarSign className="text-white" size={compact ? 20 : 24} />
      </span>
      <span className={cn("font-bold", compact ? "text-xl" : "text-2xl")}>
        SpendSense
      </span>
    </Link>
  );
}

/**
 * Desktop: a fixed sidebar. Mobile: a sticky top bar with the menu button,
 * logo and theme toggle, plus a slide-out menu over a dimmed backdrop.
 */
const Sidebar = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu with Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="sm:hidden sticky top-0 z-30 flex items-center gap-2 h-14 px-3 border-b border-border/40 bg-card/90 backdrop-blur">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="app-sidebar"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <Logo compact />
        <div className="ml-auto">
          <ThemeButton />
        </div>
      </header>

      {open && (
        <div
          className="sm:hidden fixed inset-0 z-40 bg-black/40 animate-in fade-in"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <aside
        id="app-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-card border-r border-border/40 p-5 transition-transform duration-300 ease-in-out sm:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between mb-8 px-1">
          <Logo />
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1" aria-label="Main">
          <ul className="flex flex-col gap-1">
            {menuItems.map(({ icon: Icon, name, href }) => {
              const active =
                pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors",
                      active
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon size={20} />
                    {name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto flex items-center gap-2">
          <form className="flex-1" action={signOut}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut size={18} />
              Log out
            </Button>
          </form>
          <div className="hidden sm:block">
            <ThemeButton />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
