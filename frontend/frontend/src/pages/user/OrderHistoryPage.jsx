import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchMyOrders, selectOrders, selectOrderLoading } from '../../store/slices/orderSlice.js';
import Spinner from '../../components/common/Spinner.jsx';
import { ClockIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const STATUS_COLORS = {
  PLACED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CONFIRMED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  PREPARING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function OrderHistoryPage() {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);
  const isLoading = useSelector(selectOrderLoading);

  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);

  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="page-container py-8 max-w-3xl mx-auto">
        <h1 className="section-heading mb-6">My Orders</h1>
        {isLoading ? <Spinner size="lg" className="py-20" /> : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No orders yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Start ordering your favorite food!</p>
            <Link to="/restaurants" className="btn-primary">Browse Restaurants</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/orders/${order.id}/track`}>
                  <div className="card p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{order.restaurantName}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{order.orderNumber}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || ''}`}>
                          {order.status?.replace(/_/g, ' ')}
                        </span>
                        <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-3">
                      {(order.items || []).map((i) => `${i.itemName} ×${i.quantity}`).join(', ')}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <ClockIcon className="w-4 h-4" />
                        <span>{order.placedAt ? new Date(order.placedAt).toLocaleDateString() : '-'}</span>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">₹{order.totalAmount}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
