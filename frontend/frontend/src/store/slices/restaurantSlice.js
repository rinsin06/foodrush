import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { restaurantApi } from '../../api/restaurantApi.js';

export const fetchRestaurants = createAsyncThunk('restaurant/fetchAll', async ({ city, page = 0, size = 12 } = {}, { rejectWithValue }) => {
  try {
    const { data } = await restaurantApi.getAll({ city, page, size });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load restaurants');
  }
});

export const searchRestaurants = createAsyncThunk('restaurant/search', async ({ query, page = 0 }, { rejectWithValue }) => {
  try {
    const { data } = await restaurantApi.search({ query, page });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Search failed');
  }
});

export const fetchRestaurantById = createAsyncThunk('restaurant/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await restaurantApi.getById(id);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Restaurant not found');
  }
});

export const fetchMenu = createAsyncThunk('restaurant/fetchMenu', async ({ restaurantId, vegOnly }, { rejectWithValue }) => {
  try {
    const { data } = await restaurantApi.getMenu(restaurantId, vegOnly);
    return { restaurantId, menu: data };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load menu');
  }
});

const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState: {
    list: [], totalPages: 0, totalElements: 0, currentPage: 0,
    selectedRestaurant: null, menu: [], searchResults: [],
    isLoading: false, isMenuLoading: false, error: null,
    filters: { vegOnly: false, sortBy: 'rating', maxDeliveryTime: null },
  },
  reducers: {
    setFilters: (state, { payload }) => { state.filters = { ...state.filters, ...payload }; },
    clearSearch: (state) => { state.searchResults = []; },
    clearSelectedRestaurant: (state) => { state.selectedRestaurant = null; state.menu = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurants.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchRestaurants.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.list = payload.content || payload;
        state.totalPages = payload.totalPages || 1;
        state.totalElements = payload.totalElements || (payload.content || payload).length;
        state.currentPage = payload.number || 0;
      })
      .addCase(fetchRestaurants.rejected, (state, { payload }) => { state.isLoading = false; state.error = payload; })
      .addCase(searchRestaurants.pending, (state) => { state.isLoading = true; })
      .addCase(searchRestaurants.fulfilled, (state, { payload }) => { state.isLoading = false; state.searchResults = payload.content || payload; })
      .addCase(searchRestaurants.rejected, (state) => { state.isLoading = false; })
      .addCase(fetchRestaurantById.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchRestaurantById.fulfilled, (state, { payload }) => { state.isLoading = false; state.selectedRestaurant = payload; })
      .addCase(fetchRestaurantById.rejected, (state, { payload }) => { state.isLoading = false; state.error = payload; })
      .addCase(fetchMenu.pending, (state) => { state.isMenuLoading = true; })
      .addCase(fetchMenu.fulfilled, (state, { payload }) => { state.isMenuLoading = false; state.menu = payload.menu; })
      .addCase(fetchMenu.rejected, (state) => { state.isMenuLoading = false; });
  },
});

export const selectRestaurants = (state) => state.restaurant.list;
export const selectSelectedRestaurant = (state) => state.restaurant.selectedRestaurant;
export const selectMenu = (state) => state.restaurant.menu;
export const selectRestaurantLoading = (state) => state.restaurant.isLoading;
export const selectMenuLoading = (state) => state.restaurant.isMenuLoading;
export const selectSearchResults = (state) => state.restaurant.searchResults;
export const selectFilters = (state) => state.restaurant.filters;

export const { setFilters, clearSearch, clearSelectedRestaurant } = restaurantSlice.actions;
export default restaurantSlice.reducer;
