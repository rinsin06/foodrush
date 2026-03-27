import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBagIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import axiosInstance from '../../api/axiosInstance.js';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

const STATUS_STYLES = {
  PLACED:            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CONFIRMED:         'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  PREPARING:         'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  READY_FOR_PICKUP:  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  OUT_FOR_DELIVERY:  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  DELIVERED:         'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED:         'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  REFUNDED:          'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

export default function ViewOrders() {
  const [orders, setOrders]     = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { load(); }, [page, statusFilter]);

  async function load() {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, size: 20 });
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      const { data } = await axiosInstance.get(`/api/v1/admin/orders?${params}`);
      setOrders(data?.data?.content || data);
      setTotalPages(data.totalPages || 1);
    } catch { toast.error('Failed to load orders'); }
    finally  { setLoading(false); }
  }

  

  const filtered = orders.filter(
    (o) =>
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.restaurantName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingBagIcon className="w-7 h-7 text-orange-500" />
            All Orders
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor and manage all platform orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input className="input-field pl-10" placeholder="Search order number or restaurant…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-gray-400" />
          <select className="input-field w-auto" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
            <option value="ALL">All Statuses</option>
            {Object.keys(STATUS_STYLES).map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {['Order #', 'Restaurant', 'Items', 'Amount', 'Payment', 'Status', 'Placed At'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="skeleton h-4 w-20 rounded" /></td>
                      ))}
                    </tr>
                  ))
                : filtered.map((o, i) => (
                    <motion.tr
                      key={o.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-medium text-gray-900 dark:text-white text-xs">{o.orderNumber}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{o.restaurantName}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{o.items?.length || 0} items</td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{formatCurrency(o.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                          {o.paymentStatus || 'PENDING'}
                        </span>
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
                  ))}
            </tbody>
          </table>
          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">No orders found</div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100 dark:border-gray-700">
            <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">← Prev</button>
            <span className="text-sm text-gray-600 dark:text-gray-400">Page {page + 1} of {totalPages}</span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
