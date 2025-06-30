// app/dashboard/components/Sidebar.tsx
"use client";
import { useState, useEffect } from "react";
import {
  Home,
  DollarSign,
  HelpCircle,
  LogOut,
  Wallet,
  Menu,
} from "lucide-react";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { signOut } from "@/actions/signout";
import Link from "next/link";

const Sidebar = () => {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);
  const menuItems = [
    { icon: <Home size={30} />, name: "Dashboard", href: "/dashboard" },
    {
      icon: <DollarSign size={30} />,
      name: "Transactions",
      href: "/transactions",
    },
    { icon: <Wallet size={30} />, name: "Budgets", href: "/budgets" },
    { icon: <HelpCircle size={30} />, name: "Help", href: "/help" },
  ];

  return (
    <>
      {/* Hamburger menu icon for mobile */}
      <div className="sm:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md"
        >
          <Menu size={30} className="text-gray-800 dark:text-white" />
        </Button>
      </div>

      {/* Sidebar for desktop and mobile overlay */}
      <aside
        className={`z-50 sticky h-[100vh] top-0 w-sm bg-white dark:bg-gray-800 p-6 pt-6 flex-col sm:flex max-sm:fixed max-sm:top-0 max-md:min-h-[100vh] max-sm:w-70 ${isSidebarOpen ? "" : "max-sm:-translate-x-full"}`}
      >
        <div className="flex items-center gap-2 mb-10">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <DollarSign className="text-white" size={28} />
          </div>
          <h1 className="text-4xl max-sm:text-3xl font-bold text-gray-800 dark:text-white sticky top-0">
            SpendSense
          </h1>
        </div>
        <nav className="flex-1">
          <ul className="flex flex-col  gap-4">
            {menuItems.map((item, index) => {
              const isActive =
                pathname === item.href ||
                (pathname.startsWith(item.href) && item.href !== "/");
              return (
                <li key={index}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-4 p-3 rounded-lg {"text-gray-600 dark:text-gray-300"} hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors ${isActive ? "bg-indigo-50 dark:bg-gray-700 text-indigo-600 dark:text-white" : ""}`}
                  >
                    {item.icon}
                    <span className="font-medium text-xl">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <form className="mt-auto max-sm:mt-2" action={signOut}>
          <Button className="text-xl bg-red-400 text-white w-full p-6 flex justify-start">
            <LogOut style={{ height: "30px", width: "30px" }} />
            Logout
          </Button>
        </form>
      </aside>
    </>
  );
};

export default Sidebar;
