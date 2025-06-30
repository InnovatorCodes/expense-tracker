// app/dashboard/components/Sidebar.tsx
"use client";
import { Home, DollarSign, HelpCircle, LogOut } from 'lucide-react';
import { BsPiggyBank } from "react-icons/bs";
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';
import { signOut } from '@/actions/signout';
import Link from 'next/link';

const Sidebar = () => {
  const pathname = usePathname();
  const menuItems = [
    { icon: <Home size={30} />, name: 'Dashboard', href: '/dashboard' },
    { icon: <DollarSign size={30} />, name: 'Transactions' , href: '/transactions' },
    { icon: <BsPiggyBank size={30} />, name: 'Budgets', href: '/budgets' },
    { icon: <HelpCircle size={30} />, name: 'Help', href: '/help' },
  ];

  return (
    <aside className="sticky top-0 h-screen w-sm bg-white dark:bg-gray-800 p-6 pt-12 flex-col hidden sm:flex z-10">
      <div className="flex items-center gap-2 mb-10">
        <DollarSign className="text-indigo-500" size={40} />
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">SpendSense</h1>
      </div>
      <nav className="flex-1">
        <ul className='flex flex-col  gap-4'>
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
            return (
            <li key={index}>
              <Link href={item.href} className={`flex items-center gap-4 p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors ${isActive? 'bg-indigo-50 dark:bg-gray-700 text-indigo-600 dark:text-white' : ''}`}>
                {item.icon}
                <span className="font-medium text-xl">{item.name}</span>
              </Link>
            </li>
          )})}
        </ul>
      </nav>
      <div className="mt-auto mb-2">
        <form
        action={signOut}
        >
          <Button
          variant="ghost" // Use the 'ghost' variant for a subtle, link-like appearance
          className="flex items-center gap-4 p-3 w-full justify-start min-h-max text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
          type='submit'
          >
            <LogOut style={{ width: '30px', height: '30px' }} /> {/* Set size prop on LogOut itself */}
            <span className="font-medium text-xl">Logout</span>
         </Button>
        </form>
      </div>
    </aside>
  );
};

export default Sidebar;
