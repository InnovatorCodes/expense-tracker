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
  X,
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
    { icon: <Home size={22} />, name: "Dashboard", href: "/dashboard" },
    {
      icon: <DollarSign size={22} />,
      name: "Transactions",
      href: "/transactions",
    },
    { icon: <Wallet size={22} />, name: "Budgets", href: "/budgets" },
    { icon: <HelpCircle size={22} />, name: "Help", href: "/help" },
  ];

  return (
    <>
      {/* Hamburger menu icon for mobile */}
      <div
        className={`sm:hidden fixed top-4 ${isSidebarOpen ? "top-20 right-4" : "left-4"} z-50`}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md"
        >
          {isSidebarOpen ? (
            <X size={30} className="text-gray-800 dark:text-white"></X>
          ) : (
            <Menu size={30} className="text-gray-800 dark:text-white" />
          )}
        </Button>
      </div>

      {/* Sidebar for desktop and mobile overlay */}
      <aside
        className={`z-40 fixed top-0 left-0 h-screen w-72 bg-white dark:bg-gray-800 p-6 pt-6 flex-col sm:flex transition-transform duration-300 ease-in-out border-r border-gray-200 dark:border-gray-700 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}`}
      >
        <div className="sticky top-4 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-8 px-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <DollarSign className="text-white" size={26} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              SpendSense
            </h1>
          </div>
          <nav className="flex-1">
            <ul className="flex flex-col gap-2">
              {menuItems.map((item, index) => {
                const isActive =
                  pathname === item.href ||
                  (pathname.startsWith(item.href) && item.href !== "/");
                return (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors ${isActive ? "bg-indigo-50 dark:bg-gray-700 text-indigo-600 dark:text-white" : ""}`}
                    >
                      {/* Clone the icon to force a smaller size if passed as element, or just recreate for clarity. 
                          The item.icon is a ReactNode. We can wrapper it or just change the definition. 
                          Easier to change the definition in the menuItems array. 
                          But I can't easily change the array definition AND the render loop in one chunk effectively if they are far apart.
                          Wait, menuItems IS in this file. I should update menuItems definition too!
                      */}
                      {item.icon}
                      <span className="font-medium text-base">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <form className="mt-auto mb-4" action={signOut}>
            <Button className="w-full bg-gray-800 hover:bg-red-700 text-white flex items-center gap-3 justify-start px-4 py-2 text-sm shadow-sm transition-colors duration-200">
              <LogOut size={18} />
              Logout
            </Button>
          </form>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
