import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPinIcon, TagIcon, CreditCardIcon,
  XMarkIcon, PlusIcon, CheckIcon
} from '@heroicons/react/24/outline';
import { selectCartItems, selectCartTotals, clearCart, applyCoupon, removeCoupon, selectCartRestaurantId, selectCartRestaurantName } from '../../store/slices/cartSlice.js';
import { placeOrder, validateCoupon, selectOrderPlacing, selectCouponValidating } from '../../store/slices/orderSlice.js';
import { createPaymentOrder, verifyPayment, resetPayment, selectPaymentCreating } from '../../store/slices/paymentSlice.js';
import { selectUser } from '../../store/slices/authSlice.js';
import { fetchAddresses, selectAddresses } from '../../store/slices/addressSlice.js';
import { selectCity } from '../../store/slices/locationSlice.js';
import AddressFormModal from '../../components/address/AddressFormModal.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import toast from 'react-hot-toast';
import {
  fetchAvailableCoupons,
  selectCoupons
} from '../../store/slices/orderSlice.js';

const PAYMENT_METHODS = [
  { value: 'RAZORPAY', label: 'Razorpay', icon: '💳', desc: 'UPI, Cards, Wallets' },
  { value: 'CASH_ON_DELIVERY', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when delivered' },
];
const LABEL_ICON = { Home: '🏠', Work: '💼', Other: '📍' };

function Section({ icon, iconBg, title, delay, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay }} className="card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center`}>{icon}</div>
        <h2 className="font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const totals = useSelector(selectCartTotals);
  const user = useSelector(selectUser);
  const isPlacing = useSelector(selectOrderPlacing);
  const isCreating = useSelector(selectPaymentCreating);
  const isValidating = useSelector(selectCouponValidating);
  const savedAddresses = useSelector(selectAddresses);
  const city = useSelector(selectCity);

  const [address, setAddress] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (items.length === 0) { navigate('/restaurants'); return null; }
  const restaurantId = useSelector(selectCartRestaurantId);
  const restaurantName = useSelector(selectCartRestaurantName);
  const selectedAddr = savedAddresses.find(a => a.id === selectedAddressId);

  const availableCoupons = useSelector(selectCoupons);

  useEffect(() => {
    dispatch(fetchAvailableCoupons());
  }, []);

  useEffect(() => { dispatch(fetchAddresses(city)); }, [city]);

  useEffect(() => {
    const def = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
    if (def && !selectedAddressId) {
      setSelectedAddressId(def.id);
      setAddress(def.addressLine + (def.landmark ? `, ${def.landmark}` : ''));
    }
  }, [savedAddresses]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    const result = await dispatch(validateCoupon({ code: couponCode, orderAmount: totals.subtotal }));
    if (result.payload?.valid) {
      dispatch(applyCoupon({ code: couponCode, discount: result.payload.discountAmount }));
      setAppliedCoupon(couponCode);
      toast.success(`Coupon applied! Saved ₹${result.payload.discountAmount}`);
    } else {
      toast.error(result.payload?.message || 'Invalid coupon');
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handlePlaceOrder = async () => {
    if (!address.trim()) { toast.error('Please select a delivery address'); return; }
    console.log(items);

    const orderData = {
      restaurantId, restaurantName,
      items: items.map(({ menuItem, quantity }) => ({
        menuItemId: menuItem.id,
        itemName: menuItem.name,
        price: menuItem.discountedPrice || menuItem.price,
        quantity,
        isVeg: menuItem.isVeg,
      })),
      deliveryAddress: address,
      paymentMethod,
      couponCode: appliedCoupon,
      specialInstructions,
    };

    if (paymentMethod === 'CASH_ON_DELIVERY') {
      const res = await dispatch(placeOrder(orderData));
      if (!res.payload?.id) { toast.error('Failed to place order. Please try again.'); return; }
      toast.success('🛵 Order placed! Pay on delivery.');
      dispatch(clearCart());
      navigate(`/orders/${res.payload.id}/track`);
      return;
    }

    if (!window.Razorpay) { toast.error('Razorpay not loaded. Please refresh.'); return; }

    setIsProcessing(true);
    const payRes = await dispatch(createPaymentOrder({ amount: totals.total }));
    setIsProcessing(false);
    if (!payRes.payload) { toast.error('Could not initiate payment. Try again.'); return; }

    const rzp = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: payRes.payload.amount,
      currency: payRes.payload.currency || 'INR',
      name: 'FoodRush',
      description: 'Food Order Payment',
      order_id: payRes.payload.razorpayOrderId,
      prefill: { name: user?.name || '', email: user?.email || '', contact: user?.phone || '' },
      theme: { color: '#f97316' },
      handler: async (response) => {
        const tid = toast.loading('Confirming your order...');
        try {
          const orderRes = await dispatch(placeOrder({
            ...orderData,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          }));
          if (!orderRes.payload?.id) {
            toast.dismiss(tid);
            toast.error('Order confirmation failed. Save payment ID: ' + response.razorpay_payment_id);
            return;
          }
          await dispatch(verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            orderId: orderRes.payload.id,
          }));
          toast.dismiss(tid);
          toast.success('🎉 Payment successful! Order confirmed.');
          dispatch(clearCart());
          dispatch(resetPayment());
          navigate(`/orders/${orderRes.payload.id}/track`);
        } catch {
          toast.dismiss(tid);
          toast.error('Something went wrong. Contact support.');
        }
      },
      modal: {
        ondismiss: () => {
          toast('Payment cancelled — your order was not placed.', { icon: '⚠️' });
          dispatch(resetPayment());
        },
      },
    });
    rzp.on('payment.failed', (r) => {
      toast.error(`Payment failed: ${r.error.description}`);
      dispatch(resetPayment());
    });
    rzp.open();
  };

  const isLoading = isPlacing || isCreating || isProcessing;

  /* ── helpers ── */
  const selectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setAddress(addr.addressLine + (addr.landmark ? `, ${addr.landmark}` : ''));
    setShowPicker(false);
  };

  const openAddressForm = () => {
    setShowPicker(false);
    setShowAddressForm(true);
  };

  const onAddressFormSuccess = (newAddr) => {
    if (newAddr?.id) {
      dispatch(fetchAddresses(city));
      setSelectedAddressId(newAddr.id);
      setAddress(newAddr.addressLine + (newAddr.landmark ? `, ${newAddr.landmark}` : ''));
    }
    setShowAddressForm(false);
  };

  return (
    <>
      {/* ── ADDRESS FORM MODAL — rendered at top level, outside everything ── */}
      {showAddressForm && (
        <AddressFormModal
          onClose={() => setShowAddressForm(false)}
          onSuccess={onAddressFormSuccess}
        />
      )}

      <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="page-container py-8">
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Checkout
          </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── LEFT ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* DELIVERY ADDRESS */}
              <Section icon={<MapPinIcon className="w-5 h-5 text-orange-500" />}
                iconBg="bg-orange-100 dark:bg-orange-900/30" title="Delivery Address" delay={0.05}>
                {selectedAddr ? (
                  <div className="flex items-start justify-between gap-3 bg-orange-50 dark:bg-orange-900/20
                                  border-2 border-orange-400 rounded-2xl p-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 bg-white dark:bg-gray-800 rounded-xl flex items-center
                                      justify-center shrink-0 shadow-sm text-lg">
                        {LABEL_ICON[selectedAddr.label] || '📍'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {selectedAddr.label}
                          </p>
                          {selectedAddr.isDefault && (
                            <span className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-600
                                             dark:text-orange-400 px-2 py-0.5 rounded-full font-medium">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-0.5 leading-relaxed">
                          {selectedAddr.addressLine}
                          {selectedAddr.landmark && <span className="text-gray-400"> · {selectedAddr.landmark}</span>}
                        </p>
                        {selectedAddr.city && <p className="text-gray-400 text-xs mt-1">{selectedAddr.city}</p>}
                      </div>
                    </div>
                    <button onClick={() => setShowPicker(true)}
                      className="shrink-0 text-xs font-semibold text-orange-500 hover:text-orange-600
                                 transition-colors underline underline-offset-2 whitespace-nowrap mt-1">
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => savedAddresses.length > 0 ? setShowPicker(true) : openAddressForm()}
                    className="w-full border-2 border-dashed border-gray-200 dark:border-gray-700
                               rounded-2xl p-6 text-center hover:border-orange-400 hover:bg-orange-50
                               dark:hover:bg-orange-900/10 transition-all group">
                    <MapPinIcon className="w-7 h-7 text-gray-300 group-hover:text-orange-400 mx-auto mb-2 transition-colors" />
                    <p className="text-sm font-medium text-gray-500 group-hover:text-orange-500 transition-colors">
                      {savedAddresses.length > 0 ? 'Select a delivery address' : 'Add a delivery address'}
                    </p>
                  </button>
                )}
              </Section>

              {/* COUPON */}
              <Section icon={<TagIcon className="w-5 h-5 text-green-500" />}
                iconBg="bg-green-100 dark:bg-green-900/30" title="Apply Coupon" delay={0.1}>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20
                                  border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
                    <div>
                      <p className="font-bold text-green-700 dark:text-green-400 font-mono">{appliedCoupon}</p>
                      <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">Discount applied ✓</p>
                    </div>
                    <button onClick={handleRemoveCoupon}
                      className="text-red-500 text-sm font-medium hover:text-red-700 transition-colors">
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code" className="flex-1 font-mono" />
                      <Button onClick={handleApplyCoupon} loading={isValidating} variant="secondary">Apply</Button>
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {availableCoupons.map((coupon) => (
                        <button
                          key={coupon.id}
                          onClick={() => setCouponCode(coupon.code)}
                          className="text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-600
               dark:text-orange-400 border border-orange-200 dark:border-orange-800
               px-3 py-1.5 rounded-full font-medium hover:bg-orange-100 transition-colors"
                        >
                          {coupon.code}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </Section>

              {/* PAYMENT METHOD */}
              <Section icon={<CreditCardIcon className="w-5 h-5 text-blue-500" />}
                iconBg="bg-blue-100 dark:bg-blue-900/30" title="Payment Method" delay={0.15}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map((m) => (
                    <button key={m.value} onClick={() => setPaymentMethod(m.value)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left
                        ${paymentMethod === m.value
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                      <span className="text-2xl">{m.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{m.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{m.desc}</p>
                      </div>
                      {paymentMethod === m.value && (
                        <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                          <CheckIcon className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </Section>

              {/* SPECIAL INSTRUCTIONS */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }} className="card p-5">
                <h2 className="font-bold text-gray-900 dark:text-white mb-3">Special Instructions</h2>
                <textarea value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special requests? (e.g., extra spicy, no onions...)"
                  rows={2} className="input-field resize-none" />
              </motion.div>
            </div>

            {/* ── ORDER SUMMARY ── */}
            <div className="lg:col-span-1">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }} className="card p-5 sticky top-24">
                <h2 className="font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>
                <div className="space-y-3 mb-5 max-h-56 overflow-y-auto pr-1">
                  {items.map(({ menuItem, quantity }) => (
                    <div key={menuItem.id} className="flex items-center justify-between text-sm gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600
                                         text-xs font-bold px-2 py-0.5 rounded shrink-0">×{quantity}</span>
                        <span className="text-gray-700 dark:text-gray-200 truncate">{menuItem.name}</span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-200 font-medium shrink-0">
                        ₹{((menuItem.discountedPrice || menuItem.price) * quantity).toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 text-sm border-t border-gray-100 dark:border-gray-700 pt-4 mb-5">
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Subtotal</span><span>₹{totals.subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Delivery</span>
                    {totals.deliveryFee === 0
                      ? <span className="text-green-600 font-medium">FREE</span>
                      : <span>₹{totals.deliveryFee}</span>}
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Tax (5%)</span><span>₹{totals.taxAmount.toFixed(0)}</span>
                  </div>
                  {totals.discount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Discount</span><span>- ₹{totals.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base text-gray-900 dark:text-white
                                  border-t border-gray-200 dark:border-gray-700 pt-3 mt-1">
                    <span>Total</span><span>₹{totals.total.toFixed(0)}</span>
                  </div>
                </div>
                <Button onClick={handlePlaceOrder} loading={isLoading} fullWidth className="text-base py-4">
                  {isLoading ? 'Processing...'
                    : paymentMethod === 'CASH_ON_DELIVERY' ? '🛵 Place Order'
                      : `💳 Pay ₹${totals.total.toFixed(0)}`}
                </Button>
                <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-3">
                  🔒 Secure & encrypted payment
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── ADDRESS PICKER MODAL ── */}
        <AnimatePresence>
          {showPicker && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowPicker(false)}
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />

              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 16 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
              >
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm
                                flex flex-col overflow-hidden pointer-events-auto"
                  style={{ maxHeight: '80vh' }}>

                  {/* Header */}
                  <div className="flex items-center justify-between px-5 pt-5 pb-4
                                  border-b border-gray-100 dark:border-gray-800 shrink-0">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base">Deliver to</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{savedAddresses.length} saved addresses</p>
                    </div>
                    <button onClick={() => setShowPicker(false)}
                      className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center
                                 justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      <XMarkIcon className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>

                  {/* List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <button key={addr.id} onClick={() => selectAddress(addr)}
                          className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-left
                                      transition-all ${isSelected
                              ? 'bg-orange-50 dark:bg-orange-900/20 ring-2 ring-orange-400'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                                           shrink-0 text-lg ${isSelected
                              ? 'bg-orange-100 dark:bg-orange-900/40'
                              : 'bg-gray-100 dark:bg-gray-800'}`}>
                            {LABEL_ICON[addr.label] || '📍'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className={`font-semibold text-sm ${isSelected
                                ? 'text-orange-600 dark:text-orange-400'
                                : 'text-gray-900 dark:text-white'}`}>
                                {addr.label}
                              </p>
                              {addr.isDefault && (
                                <span className="text-[10px] bg-orange-100 dark:bg-orange-900/40
                                                 text-orange-500 px-1.5 py-0.5 rounded-full font-semibold">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5 truncate">
                              {addr.addressLine}{addr.landmark && ` · ${addr.landmark}`}
                            </p>
                          </div>
                          <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center
                                           transition-all ${isSelected
                              ? 'bg-orange-500'
                              : 'border-2 border-gray-200 dark:border-gray-700'}`}>
                            {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Add new — using a plain <a>-style button, no state timing issues */}
                  <div className="p-4 pt-2 shrink-0">
                    <button
                      onClick={openAddressForm}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl
                                 bg-orange-500 hover:bg-orange-600 active:scale-95
                                 text-white font-semibold text-sm transition-all"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Add New Address
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}