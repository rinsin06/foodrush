import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, PhoneIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { fetchOrderById, selectCurrentOrder, selectOrderLoading } from '../../store/slices/orderSlice.js';
import Spinner from '../../components/common/Spinner.jsx';

const STATUS_STEPS = [
  { status: 'PLACED',            emoji: '📋', label: 'Order Placed',       desc: 'Your order has been received' },
  { status: 'CONFIRMED',         emoji: '✅', label: 'Confirmed',          desc: 'Restaurant accepted your order' },
  { status: 'PREPARING',         emoji: '👨‍🍳', label: 'Being Prepared',    desc: 'Your food is being freshly cooked' },
  { status: 'READY_FOR_PICKUP',  emoji: '📦', label: 'Ready for Pickup',   desc: 'Waiting for delivery partner' },
  { status: 'OUT_FOR_DELIVERY',  emoji: '🛵', label: 'Out for Delivery',   desc: 'Your order is on the way!' },
  { status: 'DELIVERED',         emoji: '🎉', label: 'Delivered',          desc: 'Enjoy your meal! Rate your experience' },
];

function getStepIndex(status) {
  return STATUS_STEPS.findIndex((s) => s.status === status);
}

export default function OrderTrackingPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const order = useSelector(selectCurrentOrder);
  const isLoading = useSelector(selectOrderLoading);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    dispatch(fetchOrderById(id));
    // Poll every 15 seconds for live updates
    const interval = setInterval(() => {
      dispatch(fetchOrderById(id));
      setPollCount((c) => c + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, [dispatch, id]);

  if (isLoading && !order) {
    return (
      <div className="pt-16 flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) return null;

  const currentStepIndex = getStepIndex(order.status);
  const isDelivered = order.status === 'DELIVERED';
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="page-container py-8 max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/orders')}
            className="p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700
                       text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Track Order</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{order.orderNumber}</p>
          </div>
        </div>

        {/* Cancelled Banner */}
        {isCancelled && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5 mb-6 text-center">
            <div className="text-4xl mb-2">❌</div>
            <h2 className="font-bold text-red-700 dark:text-red-400 text-lg">Order Cancelled</h2>
            {order.cancellationReason && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{order.cancellationReason}</p>
            )}
          </div>
        )}

        {/* Live Banner */}
        {!isDelivered && !isCancelled && (
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-5 mb-6 text-center"
          >
            <p className="text-white font-bold text-lg">
              {STATUS_STEPS[currentStepIndex]?.emoji} {STATUS_STEPS[currentStepIndex]?.label}
            </p>
            <p className="text-white/80 text-sm mt-1">
              {STATUS_STEPS[currentStepIndex]?.desc}
            </p>
            {order.estimatedDeliveryTime && (
              <div className="flex items-center justify-center gap-2 mt-3 text-white/90 text-sm">
                <ClockIcon className="w-4 h-4" />
                <span>Estimated: {new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Delivered Banner */}
        {isDelivered && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800
                          rounded-2xl p-5 mb-6 text-center">
            <div className="text-5xl mb-2">🎉</div>
            <h2 className="font-bold text-green-700 dark:text-green-400 text-xl">Order Delivered!</h2>
            <p className="text-green-600 dark:text-green-500 text-sm mt-1">Enjoy your meal! 😋</p>
          </div>
        )}

        {/* Timeline */}
        {!isCancelled && (
          <div className="card p-6 mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-5">Order Progress</h3>
            <div className="space-y-0">
              {STATUS_STEPS.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isLast = index === STATUS_STEPS.length - 1;

                return (
                  <div key={step.status} className="flex gap-4">
                    {/* Line + Icon */}
                    <div className="flex flex-col items-center">
                      <motion.div
                        initial={{ scale: 0.5 }}
                        animate={{ scale: isCompleted ? 1 : 0.8 }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
                                    shrink-0 transition-colors ${
                          isCompleted
                            ? 'bg-orange-500 shadow-lg shadow-orange-200 dark:shadow-orange-900/30'
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}
                      >
                        {isCompleted
                          ? (isCurrent && !isDelivered
                              ? <span className="animate-bounce">{step.emoji}</span>
                              : <CheckCircleIcon className="w-6 h-6 text-white" />)
                          : <span className="opacity-40">{step.emoji}</span>
                        }
                      </motion.div>
                      {!isLast && (
                        <div className={`w-0.5 flex-1 my-1 min-h-[24px] transition-colors ${
                          index < currentStepIndex ? 'bg-orange-400' : 'bg-gray-200 dark:bg-gray-700'
                        }`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className={`pb-5 ${isLast ? '' : ''}`}>
                      <p className={`font-semibold ${
                        isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {step.label}
                      </p>
                      <p className={`text-sm ${
                        isCurrent ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Delivery Person */}
        {order.deliveryPersonName && (
          <div className="card p-5 mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Delivery Partner</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full
                                flex items-center justify-center text-2xl">
                  🛵
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{order.deliveryPersonName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Delivery Partner</p>
                </div>
              </div>
              {order.deliveryPersonPhone && (
                <a href={`tel:${order.deliveryPersonPhone}`}
                  className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700
                             dark:text-green-400 px-4 py-2 rounded-xl font-medium text-sm hover:bg-green-200 transition-colors">
                  <PhoneIcon className="w-4 h-4" />
                  Call
                </a>
              )}
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="card p-5 mb-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Order Details</h3>
          <div className="space-y-2 text-sm mb-4">
            {(order.items || []).map((item, i) => (
              <div key={i} className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>{item.itemName} × {item.quantity}</span>
                <span>₹{item.totalPrice}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1.5 text-sm border-t border-gray-100 dark:border-gray-700 pt-3">
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Subtotal</span><span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Delivery</span><span>₹{order.deliveryFee}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span><span>-₹{order.discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-1 border-t border-gray-100 dark:border-gray-700">
              <span>Total</span><span>₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="card p-5">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-2">
            <MapPinIcon className="w-4 h-4" />
            <span>Delivered to</span>
          </div>
          <p className="text-gray-900 dark:text-white font-medium">{order.deliveryAddress}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Link to="/orders" className="btn-secondary flex-1 text-center py-3 text-sm font-semibold">
            View All Orders
          </Link>
          <Link to="/restaurants" className="btn-primary flex-1 text-center py-3 text-sm font-semibold">
            Order Again
          </Link>
        </div>
      </div>
    </div>
  );
}
