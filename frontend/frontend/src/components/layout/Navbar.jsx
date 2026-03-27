import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCartIcon, SunIcon, MoonIcon,
  Bars3Icon, XMarkIcon, MagnifyingGlassIcon,
  ChevronDownIcon, SparklesIcon,
  UserIcon, ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon, Cog6ToothIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { selectIsAuthenticated, selectUser, selectIsAdmin, selectIsRestaurant, logoutUser } from '../../store/slices/authSlice.js';
import { selectCartCount } from '../../store/slices/cartSlice.js';
import { toggleDarkMode, selectDarkMode, toggleCart, toggleMobileMenu, selectMobileMenuOpen } from '../../store/slices/uiSlice.js';
import { selectCity } from '../../store/slices/locationSlice';
import LocationModal from '../location/LocationModal.jsx';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();


const city = useSelector(selectCity);
const [showModal, setShowModal] = useState(false);

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const isAdmin = useSelector(selectIsAdmin);
  const isRestaurant = useSelector(selectIsRestaurant);
  const cartCount = useSelector(selectCartCount);
  const darkMode = useSelector(selectDarkMode);
  const mobileMenuOpen = useSelector(selectMobileMenuOpen);

  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setUserMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const navLinks = [
    { to: '/restaurants', label: 'Explore' },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
    ...(isRestaurant ? [{ to: '/restaurant-panel', label: 'Dashboard' }] : []),
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-white/20 dark:border-white/5'
        : 'bg-transparent'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {city && (
  <button onClick={() => setShowModal(true)}
    className="hidden sm:flex items-center gap-1 text-sm font-medium
               text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors">
    <MapPinIcon className="w-4 h-4 text-orange-500" />
    <span className="max-w-[100px] truncate">{city}</span>
    <ChevronDownIcon className="w-3 h-3" />
  </button>
)}
{showModal && <LocationModal onClose={() => setShowModal(false)} />}
          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative w-9 h-9">
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 blur-md opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
              <div className="relative w-9 h-9 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-lg leading-none">F</span>
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-lg text-gray-900 dark:text-white tracking-tight">
                Food<span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">Rush</span>
              </span>
              <span className="text-[9px] font-semibold tracking-[0.15em] text-gray-400 dark:text-gray-500 uppercase">
                Delivered Fast
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav Pills ── */}
          <div className="hidden md:flex items-center bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-1 gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive(link.to)
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {isActive(link.to) && (
                  <motion.div
                    layoutId="navPill"
                    className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl shadow-lg shadow-orange-500/30"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-1">

            {/* Dark Mode */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => dispatch(toggleDarkMode())}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400
                         hover:text-gray-900 dark:hover:text-white
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={darkMode ? 'sun' : 'moon'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {darkMode
                    ? <SunIcon className="w-5 h-5 text-amber-400" />
                    : <MoonIcon className="w-5 h-5" />
                  }
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {/* Cart */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => dispatch(toggleCart())}
              className="relative p-2 rounded-xl text-gray-600 dark:text-gray-300
                         hover:text-gray-900 dark:hover:text-white
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <ShoppingCartIcon className="w-5 h-5" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
                               bg-gradient-to-r from-orange-500 to-pink-500 text-white
                               text-[10px] font-black rounded-full flex items-center justify-center
                               shadow-md shadow-orange-400/50"
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-2xl transition-all duration-200 ${
                    userMenuOpen
                      ? 'bg-gray-100 dark:bg-gray-800'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 via-red-400 to-pink-500
                                    flex items-center justify-center text-white text-sm font-black shadow-md">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-900" />
                  </div>
                  <span className="hidden sm:block text-sm font-semibold text-gray-800 dark:text-gray-100 max-w-[70px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <motion.div animate={{ rotate: userMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-900
                                 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40
                                 border border-gray-100 dark:border-gray-800 overflow-hidden"
                    >
                      {/* User info header */}
                      <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-950/30 dark:to-pink-950/30 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500
                                          flex items-center justify-center text-white font-black text-base shadow-md">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        {[
                          { to: '/profile', label: 'My Profile', icon: UserIcon },
                          { to: '/orders', label: 'My Orders', icon: ClipboardDocumentListIcon },
                          ...(isAdmin ? [{ to: '/admin', label: 'Admin Panel', icon: SparklesIcon }] : []),
                          ...(isRestaurant ? [{ to: '/restaurant-panel', label: 'Restaurant Panel', icon: Cog6ToothIcon }] : []),
                        ].map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                                       text-gray-700 dark:text-gray-300
                                       hover:bg-orange-50 dark:hover:bg-gray-800
                                       hover:text-orange-600 dark:hover:text-orange-400
                                       transition-all duration-150 font-medium group"
                          >
                            <item.icon className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                            {item.label}
                          </Link>
                        ))}

                        <div className="my-1.5 border-t border-gray-100 dark:border-gray-800" />

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                                     text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30
                                     transition-all duration-150 font-medium"
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4" />
                          Log Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 ml-1">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300
                             hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  Log In
                </Link>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white
                               bg-gradient-to-r from-orange-500 to-pink-500
                               hover:from-orange-600 hover:to-pink-600
                               shadow-lg shadow-orange-400/30 transition-all"
                  >
                    Sign Up Free
                  </Link>
                </motion.div>
              </div>
            )}

            {/* Mobile menu toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => dispatch(toggleMobileMenu())}
              className="md:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition-all ml-1"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={mobileMenuOpen ? 'x' : 'menu'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {mobileMenuOpen
                    ? <XMarkIcon className="w-5 h-5" />
                    : <Bars3Icon className="w-5 h-5" />
                  }
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-3 px-1 space-y-1 border-t border-gray-100 dark:border-gray-800">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={link.to}
                      className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive(link.to)
                          ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md shadow-orange-400/30'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {!isAuthenticated && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: navLinks.length * 0.05 }}
                    className="pt-2 flex flex-col gap-2 px-1"
                  >
                    <Link to="/login"
                      className="text-center py-2.5 rounded-xl text-sm font-semibold
                                 text-gray-700 dark:text-gray-300 border border-gray-200
                                 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                      Log In
                    </Link>
                    <Link to="/register"
                      className="text-center py-2.5 rounded-xl text-sm font-semibold text-white
                                 bg-gradient-to-r from-orange-500 to-pink-500 shadow-lg shadow-orange-400/30">
                      Sign Up Free
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}