import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { orderApi } from '../../api/orderApi.js';

export const placeOrder = createAsyncThunk(
  'order/place',
  async (orderData, { rejectWithValue }) => {
    try {
      const { data } = await orderApi.placeOrder(orderData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to place order');
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  'order/fetchMine',
  async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
    try {
      const { data } = await orderApi.getMyOrders({ page, size });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load orders');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'order/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await orderApi.getById(id);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Order not found');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'order/cancel',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const { data } = await orderApi.cancel(id, reason);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to cancel order');
    }
  }
);

export const validateCoupon = createAsyncThunk(
  'order/validateCoupon',
  async ({ code, orderAmount }, { rejectWithValue }) => {
    try {
      const { data } = await orderApi.validateCoupon(code, orderAmount);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Invalid coupon');
    }
  }
);

export const fetchAvailableCoupons = createAsyncThunk(
  'order/fetchCoupons',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await orderApi.getCoupons();
      return data;
    } catch (err) {
      return rejectWithValue('Failed to load coupons');
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orders: [],
    currentOrder: null,
    totalPages: 0,
    isLoading: false,
    isPlacing: false,
    error: null,
    coupons: [],
    couponValidation: null,
    isCouponValidating: false,
  },
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearCouponValidation: (state) => {
      state.couponValidation = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => { state.isPlacing = true; state.error = null; })
      .addCase(placeOrder.fulfilled, (state, { payload }) => {
        state.isPlacing = false;
        state.currentOrder = payload;
        toast.success('Order placed successfully! 🎉');
      })
      .addCase(placeOrder.rejected, (state, { payload }) => {
        state.isPlacing = false;
        state.error = payload;
        toast.error(payload);
      })

      .addCase(fetchMyOrders.pending, (state) => { state.isLoading = true; })
      .addCase(fetchMyOrders.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.orders = payload.content || payload;
        state.totalPages = payload.totalPages || 1;
      })
      .addCase(fetchMyOrders.rejected, (state) => { state.isLoading = false; })

      .addCase(fetchOrderById.pending, (state) => { state.isLoading = true; })
      .addCase(fetchOrderById.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.currentOrder = payload;
      })
      .addCase(fetchOrderById.rejected, (state) => { state.isLoading = false; })

      .addCase(cancelOrder.fulfilled, (state, { payload }) => {
        state.currentOrder = payload;
        state.orders = state.orders.map((o) => o.id === payload.id ? payload : o);
        toast.success('Order cancelled successfully');
      })
      .addCase(cancelOrder.rejected, (_, { payload }) => { toast.error(payload); })

      .addCase(validateCoupon.pending, (state) => { state.isCouponValidating = true; })
      .addCase(validateCoupon.fulfilled, (state, { payload }) => {
        state.isCouponValidating = false;
        state.couponValidation = payload;
      })
      .addCase(validateCoupon.rejected, (state, { payload }) => {
        state.isCouponValidating = false;
        state.couponValidation = { valid: false, message: payload };
      })

      .addCase(fetchAvailableCoupons.fulfilled, (state, { payload }) => {
        state.coupons = payload;
      });
  },
});

export const selectOrders = (state) => state.order.orders;
export const selectCurrentOrder = (state) => state.order.currentOrder;
export const selectOrderLoading = (state) => state.order.isLoading;
export const selectOrderPlacing = (state) => state.order.isPlacing;
export const selectCoupons = (state) => state.order.coupons;
export const selectCouponValidation = (state) => state.order.couponValidation;
export const selectCouponValidating = (state) => state.order.isCouponValidating;

export const { clearCurrentOrder, clearCouponValidation } = orderSlice.actions;
export default orderSlice.reducer;
