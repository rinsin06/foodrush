import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { StarIcon, ClockIcon, TruckIcon } from '@heroicons/react/24/solid';
import { FireIcon } from '@heroicons/react/24/outline';

export default function RestaurantCard({ restaurant, index = 0 }) {
  const {
    id, name, imageUrl, rating, avgDeliveryTimeMinutes,
    deliveryFee, minimumOrderAmount, isVegOnly, cuisines = [],
    status, isOpen,
  } = restaurant;

  // Mock offer for demo
  const mockOffers = [
    '50% OFF up to ₹100', '20% OFF above ₹299', 'Free delivery on first order'
  ];
  const offer = mockOffers[id % mockOffers.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="group h-full"
    >
      <Link to={`/restaurant/${id}`} className="block h-full">
        <div className="card h-full flex flex-col overflow-hidden">
          {/* Image */}
          <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl">
                🍽️
              </div>
            )}

            {/* Offer overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
              <span className="text-white text-xs font-semibold">🏷️ {offer}</span>
            </div>

            {/* Veg badge */}
            {isVegOnly && (
              <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                🌿 Pure Veg
              </div>
            )}

            {/* Closed overlay */}
            {!isOpen && status !== 'OPEN' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-white text-gray-800 font-bold px-4 py-2 rounded-full text-sm">
                  Currently Closed
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col flex-1">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight
                             group-hover:text-orange-500 transition-colors line-clamp-1">
                {name}
              </h3>
              {rating && (
                <div className="rating-chip shrink-0">
                  <StarIcon className="w-3 h-3" />
                  <span className="text-xs">{rating}</span>
                </div>
              )}
            </div>

            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-1 mb-3">
              {cuisines.slice(0, 3).join(' · ')}
            </p>

            {/* Stats row */}
            <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700 text-sm">
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <ClockIcon className="w-4 h-4" />
                <span>{avgDeliveryTimeMinutes}–{(avgDeliveryTimeMinutes || 30) + 10} min</span>
              </div>

              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <TruckIcon className="w-4 h-4" />
                {deliveryFee === 0 || deliveryFee === null
                  ? <span className="text-green-600 font-medium">Free</span>
                  : <span>₹{deliveryFee}</span>}
              </div>

              {minimumOrderAmount && (
                <span className="text-gray-400 dark:text-gray-500 text-xs">
                  Min ₹{minimumOrderAmount}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
