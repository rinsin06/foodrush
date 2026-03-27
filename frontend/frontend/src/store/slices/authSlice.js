import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { authApi } from '../../api/authApi.js';

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await authApi.login(credentials);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await authApi.register(userData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  try { await authApi.logout(); } catch {}
  dispatch(clearAuth());
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await authApi.updateProfile(profileData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, accessToken: null, refreshToken: null, isLoading: false, error: null },
  reducers: {
    clearAuth: (state) => { state.user = null; state.accessToken = null; state.refreshToken = null; },
    setTokens: (state, { payload }) => { state.accessToken = payload.accessToken; state.refreshToken = payload.refreshToken; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.user = payload.user;
        state.accessToken = payload.accessToken;
        state.refreshToken = payload.refreshToken;
        toast.success(`Welcome back, ${payload.user.name}! 🎉`);
      })
      .addCase(loginUser.rejected, (state, { payload }) => {
        state.isLoading = false; state.error = payload;
        toast.error(payload);
      })
      .addCase(registerUser.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.user = payload.user;
        state.accessToken = payload.accessToken;
        state.refreshToken = payload.refreshToken;
        toast.success('Welcome to FoodRush! 🎊');
      })
      .addCase(registerUser.rejected, (state, { payload }) => {
        state.isLoading = false; state.error = payload;
        toast.error(payload);
      })
      .addCase(updateProfile.fulfilled, (state, { payload }) => {
        state.user = payload;
        toast.success('Profile updated!');
      });
  },
});

export const selectUser = (state) => state.auth.user;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectIsAuthenticated = (state) => !!state.auth.accessToken;
export const selectUserRoles = (state) => state.auth.user?.roles || [];
export const selectIsAdmin = (state) => state.auth.user?.roles?.includes('ADMIN');
export const selectIsRestaurant = (state) => state.auth.user?.roles?.includes('RESTAURANT');
export const selectAuthLoading = (state) => state.auth.isLoading;

export const { clearAuth, setTokens, clearError } = authSlice.actions;
export default authSlice.reducer;
