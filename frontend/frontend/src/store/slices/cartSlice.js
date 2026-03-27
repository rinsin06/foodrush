import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    restaurantId: null,
    restaurantName: '',
    couponCode: null,
    couponDiscount: 0,
    conflictPending: null,
  },
  reducers: {
    addToCart: (state, { payload }) => {
      const { menuItem, restaurantId, restaurantName } = payload;
      if (state.restaurantId && state.restaurantId !== restaurantId) {
        state.conflictPending = payload;
        return;
      }
      if (!state.restaurantId) {
        state.restaurantId = restaurantId;
        state.restaurantName = restaurantName;
      }
      const existing = state.items.find((i) => i.menuItem.id === menuItem.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ menuItem, quantity: 1 });
        toast.success(`${menuItem.name} added! 🛒`, { duration: 1500 });
      }
    },
    removeOneFromCart: (state, { payload: itemId }) => {
      const existing = state.items.find((i) => i.menuItem.id === itemId);
      if (!existing) return;
      if (existing.quantity > 1) {
        existing.quantity -= 1;
      } else {
        state.items = state.items.filter((i) => i.menuItem.id !== itemId);
      }
      if (state.items.length === 0) {
        state.restaurantId = null; state.restaurantName = '';
        state.couponCode = null; state.couponDiscount = 0;
      }
    },
    removeFromCart: (state, { payload: itemId }) => {
      state.items = state.items.filter((i) => i.menuItem.id !== itemId);
      if (state.items.length === 0) {
        state.restaurantId = null; state.restaurantName = '';
        state.couponCode = null; state.couponDiscount = 0;
      }
    },
    clearCart: (state) => {
      state.items = []; state.restaurantId = null; state.restaurantName = '';
      state.couponCode = null; state.couponDiscount = 0; state.conflictPending = null;
    },
    confirmRestaurantSwitch: (state) => {
      if (!state.conflictPending) return;
      const { menuItem, restaurantId, restaurantName } = state.conflictPending;
      state.items = [{ menuItem, quantity: 1 }];
      state.restaurantId = restaurantId; state.restaurantName = restaurantName;
      state.couponCode = null; state.couponDiscount = 0; state.conflictPending = null;
      toast.success('Cart cleared. New item added 🛒');
    },
    cancelRestaurantSwitch: (state) => { state.conflictPending = null; },
    applyCoupon: (state, { payload }) => {
      state.couponCode = payload.code; state.couponDiscount = payload.discount;
      toast.success(`Coupon applied! Saved ₹${payload.discount} 🎉`);
    },
    removeCoupon: (state) => {
      state.couponCode = null; state.couponDiscount = 0;
      toast.success('Coupon removed');
    },
  },
});

export const selectCartItems = (state) => state.cart.items;
export const selectCartRestaurantName = (state) => state.cart.restaurantName;
export const selectCartRestaurantId = (state) => state.cart.restaurantId;
export const selectCartConflict = (state) => state.cart.conflictPending;
export const selectCartCount = (state) => state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + (i.menuItem.discountedPrice || i.menuItem.price) * i.quantity, 0);
export const selectCartTotals = (state) => {
  const subtotal = selectCartSubtotal(state);
  const deliveryFee = subtotal > 299 ? 0 : 40;
  const taxAmount = parseFloat((subtotal * 0.05).toFixed(2));
  const discount = state.cart.couponDiscount || 0;
  const total = parseFloat((subtotal + deliveryFee + taxAmount - discount).toFixed(2));
  return { subtotal, deliveryFee, taxAmount, discount, total };
};
export const selectItemQuantity = (menuItemId) => (state) => {
  const item = state.cart.items.find((i) => i.menuItem.id === menuItemId);
  return item ? item.quantity : 0;
};

export const { addToCart, removeOneFromCart, removeFromCart, clearCart, confirmRestaurantSwitch, cancelRestaurantSwitch, applyCoupon, removeCoupon } = cartSlice.actions;
export default cartSlice.reducer;
