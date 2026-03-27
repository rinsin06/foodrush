import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRestaurants, selectRestaurants, selectRestaurantLoading, selectFilters, setFilters } from '../../store/slices/restaurantSlice.js';
import RestaurantCard from './RestaurantCard.jsx';
import { SkeletonCard } from '../common/Skeleton.jsx';
import FilterPanel from './FilterPanel.jsx';

export default function RestaurantGrid({ city, searchQuery }) {
  const dispatch = useDispatch();
  const restaurants = useSelector(selectRestaurants);
  const isLoading = useSelector(selectRestaurantLoading);
  const filters = useSelector(selectFilters);

  useEffect(() => {
    dispatch(fetchRestaurants({ city }));
  }, [dispatch, city]);

  // Apply client-side filters
  const filtered = restaurants.filter((r) => {
    if (filters.vegOnly && !r.isVegOnly) return false;
    if (filters.maxDeliveryTime && r.avgDeliveryTimeMinutes > filters.maxDeliveryTime) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return r.name.toLowerCase().includes(q) ||
        (r.cuisines || []).some((c) => c.toLowerCase().includes(q));
    }
    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (filters.sortBy === 'deliveryTime') return (a.avgDeliveryTimeMinutes || 0) - (b.avgDeliveryTimeMinutes || 0);
    if (filters.sortBy === 'deliveryFee') return (a.deliveryFee || 0) - (b.deliveryFee || 0);
    return 0;
  });

  return (
    <div>
      <FilterPanel filters={filters} onFilterChange={(f) => dispatch(setFilters(f))} />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-6">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No restaurants found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-6">
          {filtered.map((restaurant, index) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
