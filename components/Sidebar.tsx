// app/dashboard/components/Sidebar.tsx
import { Home, BarChart2, DollarSign, Settings, HelpCircle } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: <Home size={30} />, name: 'Dashboard' },
    { icon: <BarChart2 size={30} />, name: 'Analytics' },
    { icon: <DollarSign size={30} />, name: 'Transactions' },
    { icon: <Settings size={30} />, name: 'Settings' },
    { icon: <HelpCircle size={30} />, name: 'Help' },
  ];

  return (
    <aside className="w-sm bg-white dark:bg-gray-800 p-6 flex-col hidden sm:flex">
      <div className="flex items-center gap-2 mb-10">
        <DollarSign className="text-indigo-500" size={32} />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">ExpenseT</h1>
      </div>
      <nav className="flex-1">
        <ul className='flex flex-col  gap-4'>
          {menuItems.map((item, index) => (
            <li key={index}>
              <a href="#" className={`flex items-center gap-4 p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors ${index === 0 ? 'bg-indigo-50 dark:bg-gray-700 text-indigo-600 dark:text-white' : ''}`}>
                {item.icon}
                <span className="font-medium text-xl">{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto">
         <a href="#" className="flex items-center gap-4 p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors">
            {/* Add logout icon */}
            <span className="font-medium">Logout</span>
         </a>
      </div>
    </aside>
  );
};

export default Sidebar;
