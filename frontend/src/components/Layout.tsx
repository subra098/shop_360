import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, ShoppingCart, Package, Users, BookOpen, Receipt, Settings } from 'lucide-react';

const Layout = () => {
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Billing', path: '/billing', icon: ShoppingCart },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Khata', path: '/khata', icon: BookOpen },
    { name: 'Expenses', path: '/expenses', icon: Receipt },
  ];

  return (
    <div className="flex flex-col h-screen bg-bg-light w-full max-w-md mx-auto shadow-xl overflow-hidden relative border-x border-gray-200">
      {/* Top App Bar */}
      <header className="bg-primary text-white p-4 shadow-md flex justify-between items-center z-10">
        <h1 className="text-xl font-bold tracking-wide">Dukaan360</h1>
        <NavLink to="/settings" className="p-1 rounded-full hover:bg-primary-dark transition-colors">
          <Settings size={24} />
        </NavLink>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full pb-20 bg-white">
        <Outlet />
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="absolute bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center p-2 pb-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
             <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'text-primary scale-110 font-medium' 
                    : 'text-gray-500 hover:text-primary hover:bg-gray-50'
                }`
              }
            >
              <Icon size={22} className="mb-1" />
              <span className="text-[10px]">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
