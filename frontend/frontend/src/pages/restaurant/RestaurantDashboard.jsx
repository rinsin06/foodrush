import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { HomeIcon, Squares2X2Icon, ShoppingBagIcon } from '@heroicons/react/24/outline';

const NAV = [
  { to: '/restaurant-panel', label: 'Dashboard', icon: HomeIcon, exact: true },
  { to: '/restaurant-panel/menu', label: 'Menu', icon: Squares2X2Icon },
  { to: '/restaurant-panel/orders', label: 'Orders', icon: ShoppingBagIcon },
];

function PanelHome() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Restaurant Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: "Today's Orders", value: '28', icon: '📦', color: 'from-blue-400 to-indigo-500' },
          { label: "Today's Revenue", value: '₹8,240', icon: '💰', color: 'from-green-400 to-teal-500' },
          { label: 'Pending Orders', value: '3', icon: '⏳', color: 'from-orange-400 to-pink-500' },
        ].map((s) => (
          <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white shadow-lg`}>
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-white/80 text-sm">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RestaurantDashboard() {
  const location = useLocation();
  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="flex">
        <aside className="hidden md:flex flex-col w-52 min-h-screen bg-white dark:bg-gray-900
                          border-r border-gray-100 dark:border-gray-800 p-4 pt-8 fixed top-16 bottom-0">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-3">Restaurant Panel</p>
          {NAV.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? location.pathname === to : location.pathname.startsWith(to);
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${
                  active ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                <Icon className="w-5 h-5" />{label}
              </Link>
            );
          })}
        </aside>
        <main className="flex-1 md:ml-52 p-6">
          <Routes>
            <Route index element={<PanelHome />} />
            <Route path="*" element={<div className="text-center py-20 text-gray-400">Coming soon...</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
