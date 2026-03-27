import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon, ShoppingCartIcon, TrashIcon } from '@heroicons/react/24/outline';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid';
import { selectCartItems, selectCartTotals, selectCartCount, addToCart, removeOneFromCart, removeFromCart, clearCart } from '../../store/slices/cartSlice.js';
import { selectCartOpen, closeCart } from '../../store/slices/uiSlice.js';
import { selectIsAuthenticated } from '../../store/slices/authSlice.js';
import Button from '../common/Button.jsx';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOpen = useSelector(selectCartOpen);
  const items = useSelector(selectCartItems);
  const totals = useSelector(selectCartTotals);
  const cartCount = useSelector(selectCartCount);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const handleCheckout = () => {
    dispatch(closeCart());
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => dispatch(closeCart())}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-white dark:bg-gray-900
                       shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl
                                flex items-center justify-center">
                  <ShoppingCartIcon className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white">Your Cart</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button onClick={() => dispatch(clearCart())}
                    className="p-2 rounded-xl text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Clear cart">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => dispatch(closeCart())}
                  className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center px-8">
                  <div className="text-7xl mb-5">🛒</div>
                  <h3 className="font-bold text-gray-800 dark:text-white text-xl mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                    Add items from a restaurant to get started
                  </p>
                  <Button onClick={() => { dispatch(closeCart()); navigate('/restaurants'); }}>
                    Browse Restaurants
                  </Button>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {/* Restaurant name */}
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    From: {items[0] && 'restaurantName' in items[0] ? items[0].restaurantName : ''}
                  </p>

                  {items.map(({ menuItem, quantity }) => (
                    <motion.div
                      key={menuItem.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3"
                    >
                      {/* Thumbnail */}
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 shrink-0">
                        {menuItem.imageUrl
                          ? <img src={menuItem.imageUrl} alt={menuItem.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                        }
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">{menuItem.name}</p>
                        <p className="text-orange-500 font-bold text-sm">
                          ₹{((menuItem.discountedPrice || menuItem.price) * quantity).toFixed(0)}
                        </p>
                      </div>

                      {/* Counter */}
                      <div className="flex items-center gap-2 bg-orange-500 text-white rounded-xl px-2 py-1">
                        <button onClick={() => dispatch(removeOneFromCart(menuItem.id))}
                          className="hover:bg-orange-600 rounded p-0.5 transition-colors">
                          <MinusIcon className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-bold min-w-[16px] text-center">{quantity}</span>
                        <button onClick={() => dispatch(addToCart({ menuItem, restaurantId: null, restaurantName: '' }))}
                          className="hover:bg-orange-600 rounded p-0.5 transition-colors">
                          <PlusIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Bill Summary + Checkout */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-800 p-5 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Subtotal</span>
                    <span>₹{totals.subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Delivery Fee</span>
                    {totals.deliveryFee === 0
                      ? <span className="text-green-600 font-medium">FREE</span>
                      : <span>₹{totals.deliveryFee}</span>
                    }
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Taxes (5%)</span>
                    <span>₹{totals.taxAmount.toFixed(0)}</span>
                  </div>
                  {totals.discount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Coupon Discount</span>
                      <span>- ₹{totals.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span>Total</span>
                    <span>₹{totals.total.toFixed(0)}</span>
                  </div>
                </div>

                <Button onClick={handleCheckout} fullWidth className="text-base py-4">
                  Proceed to Checkout →
                </Button>

                {totals.deliveryFee > 0 && (
                  <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                    Add ₹{(299 - totals.subtotal).toFixed(0)} more for free delivery!
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
