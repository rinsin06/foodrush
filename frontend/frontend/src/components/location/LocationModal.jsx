import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { MapPinIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { detectLocation, setCity, selectDetecting } from '../../store/slices/locationSlice';

const POPULAR_CITIES = ['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'];

export default function LocationModal({ onClose }) {
  const dispatch    = useDispatch();
  const isDetecting = useSelector(selectDetecting);
  const [search, setSearch] = useState('');
  const [error,  setError]  = useState('');

  const handleDetect = async () => {
    setError('');
    const result = await dispatch(detectLocation());
    if (detectLocation.fulfilled.match(result)) {
      onClose();
    } else {
      setError('Could not detect location. Please select manually.');
    }
  };

  const handleSelectCity = (city) => {
    dispatch(setCity(city));
    onClose();
  };

  const filtered = POPULAR_CITIES.filter(c =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
      className="bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md
                   border border-gray-100 dark:border-gray-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
              <MapPinIcon className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Where are you?</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Find restaurants near you</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100
                       dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-all">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Auto detect */}
          <button onClick={handleDetect} disabled={isDetecting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r
                       from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600
                       text-white font-semibold py-3 px-4 rounded-xl transition-all
                       disabled:opacity-70 shadow-lg shadow-orange-400/20">
            {isDetecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Detecting your location...
              </>
            ) : (
              <>
                <MapPinIcon className="w-5 h-5" />
                Use my current location
              </>
            )}
          </button>

          {error && (
            <p className="text-red-500 text-xs text-center bg-red-50 dark:bg-red-950/20
                          px-3 py-2 rounded-xl">{error}</p>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
            <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
              or select city
            </span>
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
          </div>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search city..."
              className="input-field pl-9 text-sm"
            />
          </div>

          {/* City grid */}
          <div className="grid grid-cols-2 gap-2">
            {filtered.map((city) => (
              <button key={city} onClick={() => handleSelectCity(city)}
                className="text-left px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800
                           hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20
                           hover:text-orange-600 dark:hover:text-orange-400
                           text-sm font-medium text-gray-700 dark:text-gray-300 transition-all">
                📍 {city}
              </button>
            ))}
            {filtered.length === 0 && search && (
              <button onClick={() => handleSelectCity(search)}
                className="col-span-2 text-center px-4 py-3 rounded-xl border border-dashed
                           border-orange-300 text-orange-600 text-sm font-medium
                           hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all">
                Search restaurants in "{search}"
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}