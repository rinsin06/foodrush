import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const OFFERS = [
  {
    id: 1,
    title: '50% OFF on First Order',
    subtitle: 'Use code FIRST50 • Max discount ₹150',
    code: 'FIRST50',
    gradient: 'from-orange-500 to-pink-500',
    emoji: '🎉',
  },
  {
    id: 2,
    title: 'Free Delivery All Week',
    subtitle: 'On orders above ₹199 • No code needed',
    code: null,
    gradient: 'from-purple-500 to-indigo-500',
    emoji: '🚀',
  },
  {
    id: 3,
    title: 'Flat ₹100 Off',
    subtitle: 'Use code SAVE100 • Min order ₹399',
    code: 'SAVE100',
    gradient: 'from-green-400 to-teal-500',
    emoji: '💚',
  },
  {
    id: 4,
    title: 'Weekend Special 30% Off',
    subtitle: 'Use code WEEKEND30 • Valid Sat & Sun',
    code: 'WEEKEND30',
    gradient: 'from-yellow-400 to-orange-500',
    emoji: '🌟',
  },
];

export default function OfferBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((i) => (i + 1) % OFFERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (idx) => {
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  const prev = () => {
    setDirection(-1);
    setCurrentIndex((i) => (i - 1 + OFFERS.length) % OFFERS.length);
  };

  const next = () => {
    setDirection(1);
    setCurrentIndex((i) => (i + 1) % OFFERS.length);
  };

  const offer = OFFERS[currentIndex];

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-xl">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={offer.id}
          custom={direction}
          variants={{
            enter: (d) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (d) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className={`bg-gradient-to-r ${offer.gradient} p-6 md:p-8`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-4xl mb-2">{offer.emoji}</div>
              <h2 className="text-white font-bold text-xl md:text-2xl mb-1">
                {offer.title}
              </h2>
              <p className="text-white/80 text-sm md:text-base mb-4">
                {offer.subtitle}
              </p>
              {offer.code && (
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                  <span className="text-white text-xs font-medium uppercase tracking-wide">Code:</span>
                  <span className="text-white font-bold tracking-widest">{offer.code}</span>
                </div>
              )}
            </div>
            <div className="hidden md:block text-8xl opacity-20 select-none">
              {offer.emoji}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm"
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm"
      >
        <ChevronRightIcon className="w-4 h-4" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {OFFERS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === currentIndex ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
