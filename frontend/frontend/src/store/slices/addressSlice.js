import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const fetchAddresses = createAsyncThunk('addresses/fetchAll',
  async (city, { rejectWithValue }) => {
    try {
      const params = city ? `?city=${city}` : '';
      const res = await axiosInstance.get(`/api/v1/auth/addresses${params}`);
      return res.data;
    } catch (e) { return rejectWithValue(e.response?.data?.message); }
  }
);

export const addAddress = createAsyncThunk('addresses/add',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/api/v1/auth/addresses', data);
      return res.data;
    } catch (e) { return rejectWithValue(e.response?.data?.message); }
  }
);

export const updateAddress = createAsyncThunk('addresses/update',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/api/v1/auth/addresses/${id}`, data);
      return res.data;
    } catch (e) { return rejectWithValue(e.response?.data?.message); }
  }
);

export const deleteAddress = createAsyncThunk('addresses/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/api/v1/auth/addresses/${id}`);
      return id;
    } catch (e) { return rejectWithValue(e.response?.data?.message); }
  }
);

export const setDefaultAddress = createAsyncThunk('addresses/setDefault',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/api/v1/auth/addresses/${id}/default`);
      return res.data;
    } catch (e) { return rejectWithValue(e.response?.data?.message); }
  }
);

const addressSlice = createSlice({
  name: 'addresses',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending,        (s) => { s.loading = true; })
      .addCase(fetchAddresses.fulfilled,      (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchAddresses.rejected,       (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(addAddress.fulfilled,          (s, a) => { s.items.unshift(a.payload); })
      .addCase(updateAddress.fulfilled,       (s, a) => {
        const i = s.items.findIndex(x => x.id === a.payload.id);
        if (i !== -1) s.items[i] = a.payload;
      })
      .addCase(deleteAddress.fulfilled,       (s, a) => {
        s.items = s.items.filter(x => x.id !== a.payload);
      })
      .addCase(setDefaultAddress.fulfilled,   (s, a) => {
        s.items = s.items.map(x => ({ ...x, isDefault: x.id === a.payload.id }));
      });
  }
});

export const selectAddresses      = (s) => s.addresses.items;
export const selectAddressLoading = (s) => s.addresses.loading;
export const selectDefaultAddress = (s) => s.addresses.items.find(a => a.isDefault);
export default addressSlice.reducer;