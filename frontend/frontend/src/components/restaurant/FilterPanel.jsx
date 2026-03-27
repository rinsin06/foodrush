import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdjustmentsHorizontalIcon, XMarkIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const SORT_OPTIONS = [
  { value: 'rating',       label: 'Top Rated',  emoji: '⭐' },
  { value: 'deliveryTime', label: 'Fastest',     emoji: '⚡' },
  { value: 'deliveryFee',  label: 'Low Fee',     emoji: '🚚' },
];

const DELIVERY_TIME_OPTIONS = [
  { value: null, label: 'Any Time', emoji: '🕐' },
  { value: 30,   label: '< 30 min', emoji: '🔥' },
  { value: 45,   label: '< 45 min', emoji: '⚡' },
  { value: 60,   label: '< 60 min', emoji: '✅' },
];

const CUISINE_OPTIONS = [
  '🍕 Pizza', '🍔 Burgers', '🍜 Asian', '🌮 Mexican',
  '🍛 Indian', '🥗 Healthy', '🍣 Sushi', '🍩 Desserts',
];

const activeCount = (filters) =>
  (filters.vegOnly ? 1 : 0) +
  (filters.sortBy && filters.sortBy !== 'rating' ? 1 : 0) +
  (filters.maxDeliveryTime ? 1 : 0) +
  (filters.cuisines?.length || 0);

export default function FilterPanel({ filters, onFilterChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const count = activeCount(filters);

  const clearAll = () => onFilterChange({
    vegOnly: false,
    sortBy: 'rating',
    maxDeliveryTime: null,
    cuisines: [],
  });

  const toggleCuisine = (cuisine) => {
    const current = filters.cuisines || [];
    const updated = current.includes(cuisine)
      ? current.filter((c) => c !== cuisine)
      : [...current, cuisine];
    onFilterChange({ cuisines: updated });
  };

  return (
    <>
      {/* ── Trigger Button (fixed left side) ── */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.97 }}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-40
                   flex flex-col items-center gap-2 py-5 px-2.5
                   bg-white dark:bg-gray-900
                   border border-l-0 border-gray-200 dark:border-gray-700
                   rounded-r-2xl shadow-xl shadow-black/10
                   text-gray-600 dark:text-gray-300
                   hover:text-orange-500 transition-colors group"
      >
        <AdjustmentsHorizontalIcon className="w-5 h-5" />
        <span className="text-[10px] font-black uppercase tracking-widest
                         [writing-mode:vertical-rl] text-gray-400 dark:text-gray-500
                         group-hover:text-orange-400 transition-colors">
          Filters
        </span>
        <ChevronRightIcon className="w-3.5 h-3.5" />
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full
                       bg-gradient-to-br from-orange-500 to-pink-500
                       text-white text-[10px] font-black
                       flex items-center justify-center shadow-md"
          >
            {count}
          </motion.span>
        )}
      </motion.button>

      {/* ── Backdrop ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* ── Side Drawer ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="fixed left-0 top-0 h-full w-72 z-50
                       bg-white dark:bg-gray-950
                       border-r border-gray-100 dark:border-gray-800
                       shadow-2xl shadow-black/20 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4
                            bg-gradient-to-r from-orange-500 to-pink-500">
              <div className="flex items-center gap-2">
                <AdjustmentsHorizontalIcon className="w-5 h-5 text-white" />
                <h2 className="text-white font-black text-base tracking-tight">Filters</h2>
                {count > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold">
                    {count} active
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30
                           text-white transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">

              {/* Veg Only */}
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-widest
                               text-gray-400 dark:text-gray-500 mb-3">
                  Dietary
                </h3>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onFilterChange({ vegOnly: !filters.vegOnly })}
                  className={`w-full flex items-center justify-between px-4 py-3
                              rounded-2xl border-2 transition-all duration-200 font-semibold text-sm ${
                    filters.vegOnly
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400'
                      : 'border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-green-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">🌿</span>
                    Vegetarian Only
                  </span>
                  <div className={`w-10 h-5 rounded-full transition-all duration-300 ${
                    filters.vegOnly ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    <motion.div
                      animate={{ x: filters.vegOnly ? 20 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="w-4 h-4 mt-0.5 rounded-full bg-white shadow-sm"
                    />
                  </div>
                </motion.button>
              </section>

              {/* Sort By */}
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-widest
                               text-gray-400 dark:text-gray-500 mb-3">
                  Sort By
                </h3>
                <div className="space-y-2">
                  {SORT_OPTIONS.map((opt) => (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onFilterChange({ sortBy: opt.value })}
                      className={`w-full flex items-center gap-3 px-4 py-3
                                  rounded-2xl border-2 transition-all duration-200 text-sm font-semibold ${
                        filters.sortBy === opt.value
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400'
                          : 'border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-orange-200'
                      }`}
                    >
                      <span className="text-lg">{opt.emoji}</span>
                      {opt.label}
                      {filters.sortBy === opt.value && (
                        <motion.div
                          layoutId="sortCheck"
                          className="ml-auto w-5 h-5 rounded-full bg-orange-500
                                     flex items-center justify-center"
                        >
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </section>

              {/* Delivery Time */}
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-widest
                               text-gray-400 dark:text-gray-500 mb-3">
                  Delivery Time
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {DELIVERY_TIME_OPTIONS.map((opt) => {
                    const isSelected = (filters.maxDeliveryTime ?? null) === opt.value;
                    return (
                      <motion.button
                        key={String(opt.value)}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => onFilterChange({ maxDeliveryTime: opt.value })}
                        className={`flex flex-col items-center gap-1 py-3 rounded-2xl
                                    border-2 transition-all duration-200 text-xs font-bold ${
                          isSelected
                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400'
                            : 'border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-violet-200'
                        }`}
                      >
                        <span className="text-xl">{opt.emoji}</span>
                        {opt.label}
                      </motion.button>
                    );
                  })}
                </div>
              </section>

              {/* Cuisines
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-widest
                               text-gray-400 dark:text-gray-500 mb-3">
                  Cuisine
                </h3>
                <div className="flex flex-wrap gap-2">
                  {CUISINE_OPTIONS.map((cuisine) => {
                    const isSelected = filters.cuisines?.includes(cuisine);
                    return (
                      <motion.button
                        key={cuisine}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleCuisine(cuisine)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold
                                    border transition-all duration-200 ${
                          isSelected
                            ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400'
                            : 'border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-pink-200'
                        }`}
                      >
                        {cuisine}
                      </motion.button>
                    );
                  })}
                </div>
              </section> */}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3">
              {count > 0 && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={clearAll}
                  className="flex-1 py-2.5 rounded-2xl border-2 border-gray-200 dark:border-gray-700
                             text-sm font-bold text-gray-500 dark:text-gray-400
                             hover:border-red-300 hover:text-red-500 transition-all"
                >
                  Clear All
                </motion.button>
              )}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2.5 rounded-2xl text-sm font-bold text-white
                           bg-gradient-to-r from-orange-500 to-pink-500
                           shadow-lg shadow-orange-400/30 hover:opacity-90 transition-all"
              >
                Show Results
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}