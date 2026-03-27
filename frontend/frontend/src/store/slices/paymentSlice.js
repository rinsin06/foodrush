// src/store/slices/paymentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance.js';

// Step 1: Create Razorpay order from backend
export const createPaymentOrder = createAsyncThunk(
  'payment/createOrder',
  async ({ orderId, amount }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/v1/payments/create-order', {
        orderId,
        amount,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create payment order');
    }
  }
);

// Step 2: Verify payment after Razorpay success callback
export const verifyPayment = createAsyncThunk(
  'payment/verify',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/v1/payments/verify', paymentData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Payment verification failed');
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    isCreatingOrder: false,
    isVerifying:     false,
    paymentOrder:    null,
    paymentResult:   null,
    error:           null,
  },
  reducers: {
    resetPayment: (state) => {
      state.isCreatingOrder = false;
      state.isVerifying     = false;
      state.paymentOrder    = null;
      state.paymentResult   = null;
      state.error           = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPaymentOrder.pending,   (state) => { state.isCreatingOrder = true;  state.error = null; })
      .addCase(createPaymentOrder.fulfilled, (state, { payload }) => { state.isCreatingOrder = false; state.paymentOrder = payload; })
      .addCase(createPaymentOrder.rejected,  (state, { payload }) => { state.isCreatingOrder = false; state.error = payload; })
      .addCase(verifyPayment.pending,        (state) => { state.isVerifying = true;  state.error = null; })
      .addCase(verifyPayment.fulfilled,      (state, { payload }) => { state.isVerifying = false; state.paymentResult = payload; })
      .addCase(verifyPayment.rejected,       (state, { payload }) => { state.isVerifying = false; state.error = payload; });
  },
});

export const selectPaymentCreating = (state) => state.payment.isCreatingOrder;
export const selectPaymentVerifying = (state) => state.payment.isVerifying;
export const selectPaymentError = (state) => state.payment.error;

export const { resetPayment } = paymentSlice.actions;
export default paymentSlice.reducer;