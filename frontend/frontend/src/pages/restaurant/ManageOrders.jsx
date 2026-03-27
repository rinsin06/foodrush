import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardDocumentListIcon, CheckIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice.js';
import axiosInstance from '../../api/axiosInstance.js';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

const STATUS_FLOW = {
  PLACED:           { next: 'CONFIRMED',        label: 'Confirm Order',    color: 'bg-blue-500' },
  CONFIRMED:        { next: 'PREPARING',         label: 'Start Preparing',  color: 'bg-indigo-500' },
  PREPARING:        { next: 'READY_FOR_PICKUP',  label: 'Mark Ready',       color: 'bg-yellow-500' },
  READY_FOR_PICKUP: { next: 'OUT_FOR_DELIVERY',  label: 'Assign Delivery',  color: 'bg-orange-500' },
  OUT_FOR_DELIVERY: { next: 'DELIVERED',         label: 'Mark Delivered',   color: 'bg-green-500' },
};

const STATUS_BADGE = {
  PLACED:            'bg-blue-100 text-blue-700',
  CONFIRMED:         'bg-indigo-100 text-indigo-700',
  PREPARING:         'bg-yellow-100 text-yellow-700',
  READY_FOR_PICKUP:  'bg-orange-100 text-orange-700',
  OUT_FOR_DELIVERY:  'bg-purple-100 text-purple-700',
  DELIVERED:         'bg-green-100 text-green-700',
  CANCELLED:         'bg-red-100 text-red-700',
};

export default function ManageOrders() {
  const user                              = useSelector(selectUser);
  const [restaurants, setRestaurants]     = useState([]);
  const [activeRestaurant, setActive]     = useState(null);
  const [orders, setOrders]               = useState([]);
  const [activeStatus, setActiveStatus]   = useState('PLACED');
  const [isLoading, setLoading]           = useState(true);
  const [updatingId, setUpdatingId]       = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosInstance.get('/api/v1/restaurants/my');
        setRestaurants(data);
        if (data.length > 0) setActive(data[0]);
      } catch { toast.error('Failed to load restaurants'); }
    })();
  }, []);

  useEffect(() => {
    if (!activeRestaurant) return;
    loadOrders();
    const interval = setInterval(loadOrders, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [activeRestaurant, activeStatus]);

  async function loadOrders() {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(
        `/api/v1/orders/restaurant/${activeRestaurant.id}?status=${activeStatus}`
      );
      setOrders(data.content || data);
    } catch { toast.error('Failed to load orders'); }
    finally  { setLoading(false); }
  }

  async function advanceStatus(orderId, nextStatus) {
    try {
      setUpdatingId(orderId);
      await axiosInstance.patch(`/api/v1/orders/${orderId}/status?status=${nextStatus}`);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      toast.success(`Order moved to ${nextStatus.replace(/_/g, ' ')}`);
    } catch { toast.error('Status update failed'); }
    finally  { setUpdatingId(null); }
  }

  async function rejectOrder(orderId) {
    try {
      setUpdatingId(orderId);
      await axiosInstance.post(`/api/v1/orders/${orderId}/cancel`, { reason: 'Rejected by restaurant' });
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      toast.success('Order rejected');
    } catch { toast.error('Failed to reject order'); }
    finally  { setUpdatingId(null); }
  }

  const statusTabs = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'];

  return (
    <div className="page-container py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ClipboardDocumentListIcon className="w-7 h-7 text-orange-500" />
            Manage Orders
          </h1>
          {restaurants.length > 1 && (
            <select className="input-field mt-2 w-auto text-sm" value={activeRestaurant?.id} onChange={(e) => setActive(restaurants.find((r) => r.id === parseInt(e.target.value)))}>
              {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          )}
        </div>
        <button onClick={loadOrders} className="btn-secondary flex items-center gap-2 text-sm">
          <ClockIcon className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">
        {statusTabs.map((s) => (
          <button
            key={s}
            onClick={() => setActiveStatus(s)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeStatus === s
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Orders */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ClipboardDocumentListIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No {activeStatus.replace(/_/g, ' ').toLowerCase()} orders</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-5"
            >
              {/* Order header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white font-mono text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.placedAt)}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[order.status]}`}>
                  {order.status?.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-1 mb-3 max-h-28 overflow-y-auto no-scrollbar">
                {(order.items || []).map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300 truncate">{item.quantity}× {item.itemName}</span>
                    <span className="text-gray-500 flex-shrink-0 ml-2">{formatCurrency(item.totalPrice)}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(order.totalAmount)}</p>
                  <p className="text-xs text-gray-400">{order.paymentMethod}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {order.status === 'PLACED' && (
                    <button onClick={() => rejectOrder(order.id)} disabled={updatingId === order.id} className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-colors">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                  {STATUS_FLOW[order.status] && (
                    <button
                      onClick={() => advanceStatus(order.id, STATUS_FLOW[order.status].next)}
                      disabled={updatingId === order.id}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl text-white transition-all ${STATUS_FLOW[order.status].color} hover:opacity-90 disabled:opacity-50`}
                    >
                      <CheckIcon className="w-3.5 h-3.5" />
                      {updatingId === order.id ? '…' : STATUS_FLOW[order.status].label}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
