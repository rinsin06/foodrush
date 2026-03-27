import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPinIcon, MagnifyingGlassIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { StarIcon, ClockIcon, TruckIcon } from '@heroicons/react/24/solid';
import RestaurantGrid from '../../components/restaurant/RestaurantGrid.jsx';
import { useSelector, useDispatch } from 'react-redux';
import { detectLocation, selectCity, selectDetected } from '../../store/slices/locationSlice';
import LocationModal from '../../components/location/LocationModal.jsx';
import { selectIsAuthenticated } from '../../store/slices/authSlice.js';
import { fetchAddresses, selectAddresses } from '../../store/slices/addressSlice.js';
import {
  fetchAvailableCoupons,
  selectCoupons
} from '../../store/slices/orderSlice.js';

const HEADLINES = [
  'Craving something delicious? 🍕',
  'Delivered hot in 30 minutes ⚡',
  '500+ restaurants near you 🏪',
];

const CATEGORIES = [
  { emoji: '🍕', name: 'Pizza', color: 'from-red-400 to-orange-400' },
  { emoji: '🍔', name: 'Burgers', color: 'from-yellow-400 to-orange-400' },
  { emoji: '🍜', name: 'Chinese', color: 'from-orange-400 to-red-500' },
  { emoji: '🍛', name: 'Indian', color: 'from-amber-400 to-orange-500' },
  { emoji: '🌮', name: 'Mexican', color: 'from-green-400 to-teal-500' },
  { emoji: '🍣', name: 'Sushi', color: 'from-blue-400 to-indigo-500' },
  { emoji: '🥗', name: 'Healthy', color: 'from-green-400 to-emerald-500' },
  { emoji: '🍰', name: 'Desserts', color: 'from-pink-400 to-rose-500' },
];

const COUPON_STYLES = [
  { gradient: 'from-orange-500 to-pink-500',   emoji: '🍕' },
  { gradient: 'from-purple-500 to-indigo-500', emoji: '🎉' },
  { gradient: 'from-green-500 to-teal-500',    emoji: '💸' },
  { gradient: 'from-blue-500 to-cyan-500',     emoji: '🛵' },
  { gradient: 'from-red-500 to-orange-400',    emoji: '🔥' },
];
export default function HomePage() {
  const navigate = useNavigate();
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();
  const city = useSelector(selectCity);
  const locationDetected = useSelector(selectDetected);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const addresses = useSelector(selectAddresses);

   const availableCoupons = useSelector(selectCoupons);

  useEffect(() => {
    dispatch(fetchAvailableCoupons());
  }, []);


  // Get nearest address (matching city) or first saved address
  const nearbyAddress = addresses.find(a =>
    a.city?.toLowerCase() === city?.toLowerCase()
  ) || addresses[0];

  const displayLocation = nearbyAddress?.addressLine
    ? `${nearbyAddress.label} — ${nearbyAddress.addressLine.slice(0, 40)}${nearbyAddress.addressLine.length > 40 ? '...' : ''}`
    : city || 'Select location';

  useEffect(() => {
    if (!locationDetected) dispatch(detectLocation());
  }, [locationDetected]);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchAddresses(city));
  }, [isAuthenticated, city]);

  useEffect(() => {
    if (!locationDetected) {
      dispatch(detectLocation());  // silently detect, no modal
    }
  }, [locationDetected]);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeadlineIndex((i) => (i + 1) % HEADLINES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/restaurants?search=${searchQuery}`);
  };

  return (
    <div className="min-h-screen pt-16">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-pink-500 py-16 md:py-24">
        {/* Animated blobs */}
        <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <motion.div animate={{ x: [0, -20, 0], y: [0, 30, 0] }} transition={{ duration: 6, repeat: Infinity }}
          className="absolute -bottom-10 -left-10 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative page-container text-center">
          {/* Animated headline */}
          <div className="h-14 mb-4 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.h1
                key={headlineIndex}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="text-3xl md:text-5xl font-bold text-white leading-tight"
              >
                {HEADLINES[headlineIndex]}
              </motion.h1>
            </AnimatePresence>
          </div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-white/80 text-lg md:text-xl mb-10"
          >
            Order from your favourite restaurants — fast & fresh
          </motion.p>

          {/* Search Form */}
          <motion.form
            initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
          >
            <button type="button"
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-2 bg-white/20 backdrop-blur-md text-white
                         border border-white/30 rounded-2xl px-4 py-4 hover:bg-white/30
                         transition-all whitespace-nowrap font-medium"
            >
              <MapPinIcon className="w-5 h-5" />
              {displayLocation}
            </button>

            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search restaurants, dishes, cuisines..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-gray-800
                           placeholder-gray-400 shadow-xl focus:outline-none focus:ring-2
                           focus:ring-orange-300 text-base"
              />
            </div>

            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="submit"
              className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold
                         hover:bg-gray-800 transition-colors shadow-xl"
            >
              Search
            </motion.button>
          </motion.form>
          
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-8 mt-10"
          >
            {[
              { icon: StarIcon, value: '4.8★', label: 'Avg Rating' },
              { icon: ClockIcon, value: '30 min', label: 'Avg Delivery' },
              { icon: TruckIcon, value: '500+', label: 'Restaurants' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center text-white">
                <p className="font-bold text-xl">{value}</p>
                <p className="text-white/70 text-sm">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Offer Banners ── */}
{availableCoupons.length > 0 && (
  <section className="page-container -mt-6 mb-10 relative z-10">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {availableCoupons.slice(0, 3).map((offer, i) => {
        const style = COUPON_STYLES[i % COUPON_STYLES.length];
        return (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className={`bg-gradient-to-r ${style.gradient} rounded-2xl p-5 text-white
                        cursor-pointer shadow-lg overflow-hidden relative`}
            onClick={() => navigate('/restaurants')}
          >
            <div className="absolute top-0 right-0 text-7xl opacity-20 -mt-2 -mr-2">
              {style.emoji}
            </div>
            <div className="relative">
              <h3 className="text-2xl font-black">{offer.code}</h3>
              <p className="text-white/80 text-sm mt-0.5">{offer.description}</p>
              <div className="mt-3 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm
                              px-3 py-1.5 rounded-lg text-xs font-bold">
                USE: {offer.code}
                <ChevronRightIcon className="w-3 h-3" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  </section>
)}

      {/* ── Food Categories ── */}
      <section className="page-container mb-12">
        <h2 className="section-heading mb-6">What's on your mind? 🤔</h2>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.08, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/restaurants?search=${cat.name}`)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color}
                              flex items-center justify-center text-3xl shadow-lg
                              group-hover:shadow-xl transition-shadow`}>
                {cat.emoji}
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {cat.name}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ── Restaurant Grid ── */}
      <section className="page-container pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-heading">🍽️ Restaurants Near You</h2>
          <button onClick={() => navigate('/restaurants')}
            className="text-orange-500 font-semibold text-sm hover:text-orange-600 flex items-center gap-1">
            View All <ChevronRightIcon className="w-4 h-4" />
          </button>

        </div>
        <RestaurantGrid city={city} />
        {showLocationModal && (
          <LocationModal onClose={() => setShowLocationModal(false)} />
        )}
      </section>

    </div>


  );
}
