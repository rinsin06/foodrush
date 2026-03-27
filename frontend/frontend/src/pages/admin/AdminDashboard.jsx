import { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon, BuildingStorefrontIcon, UsersIcon,
  ShoppingBagIcon, TagIcon, ArrowPathIcon
} from '@heroicons/react/24/outline';
import ManageRestaurants from './ManageRestaurants';
import ManageUsers from './ManageUsers';
import ViewOrders from './ViewOrders';
import ManageOffers from './ManageOffers';
import axiosInstance from '../../api/axiosInstance.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

const NAV_ITEMS = [
  { to: '/admin',              label: 'Dashboard',   icon: HomeIcon,                 exact: true },
  { to: '/admin/restaurants',  label: 'Restaurants', icon: BuildingStorefrontIcon },
  { to: '/admin/users',        label: 'Users',       icon: UsersIcon },
  { to: '/admin/orders',       label: 'Orders',      icon: ShoppingBagIcon },
  { to: '/admin/offers',       label: 'Offers',      icon: TagIcon },
];

const STAT_META = [
  { key: 'totalOrders',        label: 'Total Orders',         icon: '📦', color: 'from-blue-400 to-indigo-500' },
  { key: 'revenueToday',       label: 'Revenue Today',        icon: '💰', color: 'from-green-400 to-teal-500',  currency: true },
  { key: 'activeRestaurants',  label: 'Active Restaurants',   icon: '🏪', color: 'from-orange-400 to-pink-500' },
  { key: 'totalUsers',         label: 'Registered Users',     icon: '👥', color: 'from-purple-400 to-indigo-500' },
];

const STATUS_STYLES = {
  PLACED:           'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CONFIRMED:        'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  PREPARING:        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  READY_FOR_PICKUP: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  DELIVERED:        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED:        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

function StatCard({ meta, value, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${meta.color} rounded-2xl p-5 text-white shadow-lg`}
    >
      <div className="text-3xl mb-3">{meta.icon}</div>
      {loading ? (
        <div className="h-8 w-24 bg-white/30 rounded-lg animate-pulse mb-1" />
      ) : (
        <div className="text-2xl font-bold">
          {meta.currency ? formatCurrency(value ?? 0) : (value ?? 0).toLocaleString()}
        </div>
      )}
      <div className="text-white/80 text-sm mt-1">{meta.label}</div>
    </motion.div>
  );
}

function DashboardHome() {
  const [stats, setStats]           = useState({});
  const [recentOrders, setRecent]   = useState([]);
  const [statsLoading, setStatsLoad]= useState(true);
  const [ordersLoading, setOrdersLoad] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadStats() {
    try {
      // Parallel fetch — users count + restaurant count + orders summary
      const [usersRes, restaurantsRes, ordersRes] = await Promise.allSettled([
        axiosInstance.get('/api/v1/admin/users?size=1'),
        axiosInstance.get('/api/v1/restaurants?size=1'),
        axiosInstance.get('/api/v1/admin/orders?size=1'),
      ]);

      const totalUsers = usersRes.status === 'fulfilled'
        ? (usersRes.value.data?.data?.totalElements
          ?? usersRes.value.data?.totalElements ?? 0)
        : 0;

      const totalRestaurants = restaurantsRes.status === 'fulfilled'
        ? (restaurantsRes.value.data?.totalElements
          ?? restaurantsRes.value.data?.data?.totalElements ?? 0)
        : 0;

      const ordersData = ordersRes.status === 'fulfilled' ? ordersRes.value.data : null;
      const totalOrders = ordersData?.totalElements ?? ordersData?.data?.totalElements ?? 0;
      const revenueToday = ordersData?.revenueToday ?? ordersData?.data?.revenueToday ?? 0;

      setStats({ totalUsers, activeRestaurants: totalRestaurants, totalOrders, revenueToday });
    } catch {
      // fail silently — cards show 0
    } finally {
      setStatsLoad(false);
    }
  }

  async function loadRecentOrders() {
    try {
      const { data } = await axiosInstance.get('/api/v1/admin/orders?size=8&page=0');
      setRecent(data?.data?.content ?? data?.content ?? data ?? []);
    } catch {
      setRecent([]);
    } finally {
      setOrdersLoad(false);
    }
  }

  async function refresh() {
    setRefreshing(true);
    await Promise.all([loadStats(), loadRecentOrders()]);
    setRefreshing(false);
  }

  useEffect(() => {
    loadStats();
    loadRecentOrders();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Analytics Overview</h2>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400
                     hover:text-orange-500 transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STAT_META.map((meta) => (
          <StatCard key={meta.key} meta={meta} value={stats[meta.key]} loading={statsLoading} />
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white">Recent Orders</h3>
          <Link to="/admin/orders"
            className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors">
            View all →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {['Order #', 'Restaurant', 'Amount', 'Status', 'Placed At'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {ordersLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="skeleton h-4 w-20 rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                : recentOrders.length === 0
                  ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-gray-400">
                        No orders yet
                      </td>
                    </tr>
                  )
                  : recentOrders.map((o, i) => (
                      <motion.tr
                        key={o.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900 dark:text-white">
                          {o.orderNumber}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{o.restaurantName}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(o.totalAmount)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[o.status] || ''}`}>
                            {o.status?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                          {o.placedAt ? formatDate(o.placedAt) : '—'}
                        </td>
                      </motion.tr>
                    ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const location = useLocation();

  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-56 min-h-screen bg-white dark:bg-gray-900
                          border-r border-gray-100 dark:border-gray-800 p-4 pt-8 fixed top-16 bottom-0">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 px-3">
            Admin Panel
          </p>
          {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => {
            const active = exact
              ? location.pathname === to
              : location.pathname.startsWith(to);
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                            transition-all mb-1 ${active
                  ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            );
          })}
        </aside>

        {/* Content */}
        <main className="flex-1 md:ml-56 p-6">
          <Routes>
            <Route index                element={<DashboardHome />} />
            <Route path="restaurants"   element={<ManageRestaurants />} />
            <Route path="users"         element={<ManageUsers />} />
            <Route path="orders"        element={<ViewOrders />} />
            <Route path="offers"        element={<ManageOffers />} />
            <Route path="*"             element={
              <div className="text-center py-20 text-gray-400">Coming soon...</div>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
}