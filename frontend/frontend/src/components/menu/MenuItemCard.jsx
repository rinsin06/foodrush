import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { addToCart, removeOneFromCart, selectItemQuantity } from '../../store/slices/cartSlice.js';
import { selectCartRestaurantId } from '../../store/slices/cartSlice.js';

export default function MenuItemCard({ item, restaurant }) {
  const dispatch = useDispatch();
  const quantity = useSelector(selectItemQuantity(item.id));
  const cartRestaurantId = useSelector(selectCartRestaurantId);

  const handleAdd = () => {
    dispatch(addToCart({
      menuItem: item,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
    }));
  };

  const handleRemove = () => {
    dispatch(removeOneFromCart(item.id));
  };

  const effectivePrice = item.discountedPrice || item.price;
  const hasDiscount = item.discountedPrice && item.discountedPrice < item.price;

  return (
    <div className={`flex gap-4 p-4 border-b border-gray-100 dark:border-gray-700/50 last:border-0
                     hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                       !item.isAvailable ? 'opacity-50' : ''
                     }`}>
      {/* Info */}
      <div className="flex-1 min-w-0">
        {/* Veg/Non-veg indicator */}
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center ${
            item.isVeg
              ? 'border-green-500'
              : 'border-red-500'
          }`}>
            <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          {item.isBestseller && (
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700
                             dark:text-yellow-400 px-2 py-0.5 rounded-full font-medium">
              ⭐ Bestseller
            </span>
          )}
        </div>

        <h4 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
          {item.name}
        </h4>

        {/* Price */}
        <div className="flex items-center gap-2 mt-1">
          <span className="font-bold text-gray-900 dark:text-white">₹{effectivePrice}</span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">₹{item.price}</span>
          )}
        </div>

        {item.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {item.description}
          </p>
        )}

        {item.calories && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{item.calories} kcal</p>
        )}
      </div>

      {/* Image + Add button */}
      <div className="relative shrink-0">
        <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name}
              className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
          )}
        </div>

        {/* Add/Remove Controls */}
        {item.isAvailable && (
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
            <AnimatePresence mode="wait">
              {quantity === 0 ? (
                <motion.button
                  key="add"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  onClick={handleAdd}
                  className="flex items-center gap-1 bg-white dark:bg-gray-800 text-orange-500
                             border-2 border-orange-500 rounded-xl px-4 py-1 text-sm font-bold
                             hover:bg-orange-500 hover:text-white transition-all shadow-lg"
                >
                  <PlusIcon className="w-4 h-4" />
                  ADD
                </motion.button>
              ) : (
                <motion.div
                  key="counter"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex items-center gap-2 bg-orange-500 text-white
                             rounded-xl px-2 py-1 shadow-lg"
                >
                  <button onClick={handleRemove}
                    className="hover:bg-orange-600 rounded-lg p-0.5 transition-colors">
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold min-w-[16px] text-center">{quantity}</span>
                  <button onClick={handleAdd}
                    className="hover:bg-orange-600 rounded-lg p-0.5 transition-colors">
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 rounded-xl flex items-center justify-center">
            <span className="text-xs font-medium text-gray-500">Unavailable</span>
          </div>
        )}
      </div>
    </div>
  );
}
