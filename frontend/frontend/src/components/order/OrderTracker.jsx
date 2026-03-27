import { motion } from 'framer-motion';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import { formatTime } from '../../utils/formatters.js';

const STEPS = [
  { status: 'PLACED',           label: 'Order Placed',      icon: '📋', desc: 'Your order has been placed' },
  { status: 'CONFIRMED',        label: 'Confirmed',          icon: '✅', desc: 'Restaurant confirmed your order' },
  { status: 'PREPARING',        label: 'Being Prepared',     icon: '👨‍🍳', desc: 'Your food is being freshly made' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery',   icon: '🛵', desc: 'Rider is on the way to you' },
  { status: 'DELIVERED',        label: 'Delivered',          icon: '🎉', desc: 'Enjoy your meal!' },
];

const STATUS_ORDER = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export default function OrderTracker({ trackingInfo, order }) {
  const currentStatusIndex = STATUS_ORDER.indexOf(order?.status || 'PLACED');

  const isStepCompleted = (stepStatus) => {
    const stepIndex = STATUS_ORDER.indexOf(stepStatus);
    return stepIndex <= currentStatusIndex;
  };

  const isCurrentStep = (stepStatus) => order?.status === stepStatus;

  if (order?.status === 'CANCELLED') {
    return (
      <div className="text-center py-10">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Order Cancelled</h3>
        <p className="text-gray-500 dark:text-gray-400">
          {order.cancellationReason || 'This order was cancelled'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estimated delivery */}
      {order?.estimatedDeliveryTime && order?.status !== 'DELIVERED' && (
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-4 flex items-center gap-3">
          <ClockIcon className="w-6 h-6 text-orange-500 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Estimated arrival</p>
            <p className="font-bold text-orange-600 dark:text-orange-400 text-lg">
              {formatTime(order.estimatedDeliveryTime)}
            </p>
          </div>
        </div>
      )}

      {/* Delivery person info */}
      {order?.deliveryPersonName && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-xl">
            🛵
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Your delivery person</p>
            <p className="font-semibold text-gray-800 dark:text-white">{order.deliveryPersonName}</p>
            {order.deliveryPersonPhone && (
              <a
                href={`tel:${order.deliveryPersonPhone}`}
                className="text-orange-500 text-xs font-medium hover:underline"
              >
                {order.deliveryPersonPhone}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Progress steps */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200 dark:bg-gray-700" />

        <div className="space-y-6">
          {STEPS.map((step, i) => {
            const completed = isStepCompleted(step.status);
            const current = isCurrentStep(step.status);

            return (
              <div key={step.status} className="relative flex items-start gap-4 pl-0">
                {/* Step indicator */}
                <div className="relative z-10 flex-shrink-0">
                  {completed ? (
                    <motion.div
                      initial={current ? { scale: 0 } : false}
                      animate={{ scale: 1 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
                        ${current
                          ? 'bg-orange-500 ring-4 ring-orange-200 dark:ring-orange-900'
                          : 'bg-green-500'
                        }`}
                    >
                      {current ? step.icon : <CheckCircleIcon className="w-5 h-5 text-white" />}
                    </motion.div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-lg opacity-40">
                      {step.icon}
                    </div>
                  )}
                </div>

                {/* Step content */}
                <div className={`pt-1.5 ${!completed ? 'opacity-40' : ''}`}>
                  <p className={`font-semibold text-sm ${current ? 'text-orange-500' : completed ? 'text-gray-800 dark:text-white' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{step.desc}</p>
                  {current && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.5, ease: 'easeInOut' }}
                      className="h-0.5 bg-orange-300 mt-2 rounded-full max-w-[120px]"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
