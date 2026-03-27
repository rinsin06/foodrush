import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ClockIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { formatDate, formatCurrency } from '../../utils/formatters.js';

const STATUS_CONFIG = {
  PLACED:            { label: 'Order Placed',        color: 'blue',   emoji: '📋' },
  CONFIRMED:         { label: 'Confirmed',            color: 'indigo', emoji: '✅' },
  PREPARING:         { label: 'Preparing',            color: 'amber',  emoji: '👨‍🍳' },
  READY_FOR_PICKUP:  { label: 'Ready for Pickup',     color: 'purple', emoji: '📦' },
  OUT_FOR_DELIVERY:  { label: 'Out for Delivery',     color: 'orange', emoji: '🛵' },
  DELIVERED:         { label: 'Delivered',            color: 'green',  emoji: '🎉' },
  CANCELLED:         { label: 'Cancelled',            color: 'red',    emoji: '❌' },
  REFUNDED:          { label: 'Refunded',             color: 'gray',   emoji: '💰' },
};

const COLOR_CLASSES = {
  blue:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  amber:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  green:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  red:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  gray:   'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

export default function OrderCard({ order, index = 0 }) {
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PLACED;
  const isActive = !['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="card p-5 hover:border-orange-200 dark:hover:border-orange-800 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-gray-900 dark:text-white text-sm">
              {order.orderNumber}
            </span>
            {isActive && (
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs">{formatDate(order.placedAt)}</p>
        </div>
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${COLOR_CLASSES[config.color]}`}>
          {config.emoji} {config.label}
        </span>
      </div>

      {/* Restaurant */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center text-base">
          🍽️
        </div>
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
            {order.restaurantName}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Items preview */}
      <div className="text-gray-600 dark:text-gray-400 text-xs mb-4 line-clamp-1">
        {order.items?.map((i) => `${i.itemName} x${i.quantity}`).join(', ')}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300 font-bold">
          <CurrencyRupeeIcon className="w-4 h-4" />
          <span>{formatCurrency(order.totalAmount)}</span>
        </div>

        <div className="flex items-center gap-2">
          {isActive && (
            <Link
              to={`/orders/${order.id}/track`}
              className="text-orange-500 hover:text-orange-600 text-xs font-semibold flex items-center gap-1"
            >
              Track Order <ChevronRightIcon className="w-3.5 h-3.5" />
            </Link>
          )}
          {order.status === 'DELIVERED' && (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-medium">
              <CheckCircleIcon className="w-4 h-4" /> Delivered
            </span>
          )}
          {order.status === 'CANCELLED' && (
            <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
              <XCircleIcon className="w-4 h-4" /> Cancelled
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
