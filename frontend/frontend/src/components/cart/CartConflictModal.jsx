import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import {
  selectCartConflict,
  confirmRestaurantSwitch,
  cancelRestaurantSwitch,
  selectCartRestaurantId,
} from '../../store/slices/cartSlice.js';
import { selectRestaurants } from '../../store/slices/restaurantSlice.js';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function CartConflictModal() {
  const dispatch   = useDispatch();
  const conflict   = useSelector(selectCartConflict);
  const restaurantId = useSelector(selectCartRestaurantId);

  if (!conflict) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Start a new cart?
            </h2>
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
            Your cart already has items from{' '}
            <span className="font-semibold text-gray-900 dark:text-white">another restaurant</span>.
            Adding this item will clear your existing cart.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => dispatch(cancelRestaurantSwitch())}
              className="btn-secondary flex-1 py-2.5"
            >
              Keep Current
            </button>
            <button
              onClick={() => dispatch(confirmRestaurantSwitch())}
              className="btn-primary flex-1 py-2.5"
            >
              Start New Cart
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
