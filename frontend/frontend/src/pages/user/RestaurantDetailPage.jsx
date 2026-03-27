import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, StarIcon, ClockIcon, TruckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { fetchRestaurantById, fetchMenu, selectSelectedRestaurant, selectMenu, selectRestaurantLoading, selectMenuLoading } from '../../store/slices/restaurantSlice.js';
import MenuItemCard from '../../components/menu/MenuItemCard.jsx';
import { SkeletonCard, SkeletonMenuItem } from '../../components/common/Skeleton.jsx';
import { selectCartCount, selectCartTotals } from '../../store/slices/cartSlice.js';
import { openCart } from '../../store/slices/uiSlice.js';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const restaurant = useSelector(selectSelectedRestaurant);
  const menu = useSelector(selectMenu);
  const isLoading = useSelector(selectRestaurantLoading);
  const isMenuLoading = useSelector(selectMenuLoading);
  const cartCount = useSelector(selectCartCount);
  const cartTotals = useSelector(selectCartTotals);

  const [activeCategory, setActiveCategory] = useState(null);
  const [vegOnly, setVegOnly] = useState(false);

  useEffect(() => {
    dispatch(fetchRestaurantById(id));
    dispatch(fetchMenu({ restaurantId: id, vegOnly: false }));
  }, [dispatch, id]);

  useEffect(() => {
    if (menu.length > 0 && !activeCategory) {
      setActiveCategory(menu[0]?.id || null);
    }
  }, [menu]);

  if (isLoading) {
    return (
      <div className="pt-16 page-container py-8">
        <div className="h-64 skeleton rounded-2xl mb-6" />
        <SkeletonCard />
      </div>
    );
  }

  if (!restaurant) return null;

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-56 md:h-72 bg-gray-200 dark:bg-gray-700 overflow-hidden">
        {restaurant.coverImageUrl || restaurant.imageUrl ? (
          <img src={restaurant.coverImageUrl || restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl">🍽️</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Back button */}
        <button onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm
                     p-2.5 rounded-xl text-gray-700 dark:text-white hover:bg-white transition-colors shadow-lg">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="page-container">
        {/* Restaurant Info Card */}
        <motion.div
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl -mt-8 relative z-10 p-5 mb-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {restaurant.isVegOnly && (
                  <span className="badge-veg text-xs">🌿 Pure Veg</span>
                )}
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  restaurant.status === 'OPEN'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {restaurant.status === 'OPEN' ? '● Open Now' : '● Closed'}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{restaurant.name}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {(restaurant.cuisines || []).join(' · ')}
              </p>
              {restaurant.address && (
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{restaurant.address}</p>
              )}
            </div>

            {restaurant.rating && (
              <div className="rating-chip text-lg px-3 py-1.5 shrink-0">
                <StarSolid className="w-4 h-4" />
                {restaurant.rating}
              </div>
            )}
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 text-sm">
              <ClockIcon className="w-4 h-4 text-orange-500" />
              <span>{restaurant.avgDeliveryTimeMinutes}–{(restaurant.avgDeliveryTimeMinutes || 30) + 10} min</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 text-sm">
              <TruckIcon className="w-4 h-4 text-orange-500" />
              {restaurant.deliveryFee === 0
                ? <span className="text-green-600 font-medium">Free Delivery</span>
                : <span>₹{restaurant.deliveryFee} delivery</span>
              }
            </div>
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 text-sm">
              <ShieldCheckIcon className="w-4 h-4 text-orange-500" />
              <span>Min ₹{restaurant.minimumOrderAmount}</span>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-6 pb-24">
          {/* Category Sidebar */}
          {menu.length > 1 && (
            <div className="hidden md:block w-44 shrink-0">
              <div className="sticky top-24 space-y-1">
                {menu.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeCategory === cat.id
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-l-2 border-orange-500'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {cat.name}
                    <span className="text-xs text-gray-400 ml-1">({(cat.menuItems || []).length})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Menu */}
          <div className="flex-1">
            {/* Veg Filter */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Menu</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-gray-600 dark:text-gray-400">Veg Only</span>
                <div
                  onClick={() => setVegOnly(!vegOnly)}
                  className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${vegOnly ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${vegOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </label>
            </div>

            {isMenuLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonMenuItem key={i} />)}
              </div>
            ) : (
              menu.map((category) => {
                const items = (category.menuItems || []).filter((item) =>
                  !vegOnly || item.isVeg
                );
                if (items.length === 0) return null;
                return (
                  <div key={category.id} id={`cat-${category.id}`} className="mb-8">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 pb-2
                                   border-b border-gray-100 dark:border-gray-700">
                      {category.name}
                      <span className="text-gray-400 text-sm font-normal ml-2">({items.length})</span>
                    </h3>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm">
                      {items.map((item) => (
                        <MenuItemCard key={item.id} item={item} restaurant={restaurant} />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Floating Cart Bar */}
      {cartCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-0 left-0 right-0 z-30 p-4"
        >
          <button
            onClick={() => dispatch(openCart())}
            className="w-full max-w-lg mx-auto flex items-center justify-between
                       bg-gradient-to-r from-orange-500 to-pink-500 text-white
                       rounded-2xl px-5 py-4 shadow-2xl shadow-orange-300 dark:shadow-orange-900/50"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-xl p-1.5">
                <ShoppingCartIcon className="w-5 h-5" />
              </div>
              <span className="font-bold">{cartCount} item{cartCount > 1 ? 's' : ''} added</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">₹{cartTotals.total.toFixed(0)}</span>
              <span className="text-white/80">→</span>
            </div>
          </button>
        </motion.div>
      )}
    </div>
  );
}
