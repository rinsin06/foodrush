import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { selectDarkMode, setDarkMode } from './store/slices/uiSlice.js';
import Navbar from './components/layout/Navbar.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';
import Spinner from './components/common/Spinner.jsx';
import ChatbotFAB from './components/chatbot/ChatbotFAB.jsx';
import CartDrawer from './components/cart/CartDrawer.jsx';
import RestaurantSwitchModal from './components/cart/RestaurantSwitchModal.jsx';

// Lazy-loaded pages
const HomePage             = lazy(() => import('./pages/user/HomePage.jsx'));
const RestaurantListPage   = lazy(() => import('./pages/user/RestaurantListPage.jsx'));
const RestaurantDetailPage = lazy(() => import('./pages/user/RestaurantDetailPage.jsx'));
const CheckoutPage         = lazy(() => import('./pages/user/CheckoutPage.jsx'));
const OrderTrackingPage    = lazy(() => import('./pages/user/OrderTrackingPage.jsx'));
const OrderHistoryPage     = lazy(() => import('./pages/user/OrderHistoryPage.jsx'));
const ProfilePage          = lazy(() => import('./pages/user/ProfilePage.jsx'));
const LoginPage            = lazy(() => import('./pages/auth/LoginPage.jsx'));
const RegisterPage         = lazy(() => import('./pages/auth/RegisterPage.jsx'));
const AdminDashboard       = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const RestaurantDashboard  = lazy(() => import('./pages/restaurant/RestaurantDashboard.jsx'));

export default function App() {
  const dispatch = useDispatch();
  const darkMode = useSelector(selectDarkMode);

  // Apply dark mode class on mount and change
  useEffect(() => {
    dispatch(setDarkMode(darkMode));
  }, [darkMode, dispatch]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <Navbar />

        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <Spinner size="lg" />
          </div>
        }>
          <Routes>
            {/* ── Public Routes ── */}
            <Route path="/"                      element={<HomePage />} />
            <Route path="/restaurants"           element={<RestaurantListPage />} />
            <Route path="/restaurant/:id"        element={<RestaurantDetailPage />} />
            <Route path="/login"                 element={<LoginPage />} />
            <Route path="/register"              element={<RegisterPage />} />

            {/* ── User Protected Routes ── */}
            <Route element={<ProtectedRoute roles={['USER', 'ADMIN', 'RESTAURANT']} />}>
              <Route path="/checkout"            element={<CheckoutPage />} />
              <Route path="/orders"              element={<OrderHistoryPage />} />
              <Route path="/orders/:id/track"    element={<OrderTrackingPage />} />
              <Route path="/profile"             element={<ProfilePage />} />
            </Route>

            {/* ── Admin Protected Routes ── */}
            <Route element={<ProtectedRoute roles={['ADMIN']} />}>
              <Route path="/admin/*"             element={<AdminDashboard />} />
            </Route>

            {/* ── Restaurant Protected Routes ── */}
            <Route element={<ProtectedRoute roles={['RESTAURANT', 'ADMIN']} />}>
              <Route path="/restaurant-panel/*"  element={<RestaurantDashboard />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        {/* Global Overlays */}
        <CartDrawer />
        <RestaurantSwitchModal />
        <ChatbotFAB />

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: darkMode ? '#1f2937' : '#ffffff',
              color: darkMode ? '#f9fafb' : '#111827',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
          }}
        />
      </div>
    </BrowserRouter>
  );
}

