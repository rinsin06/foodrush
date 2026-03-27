// src/store/slices/locationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const detectLocation = createAsyncThunk('location/detect', async (_, { rejectWithValue }) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(rejectWithValue('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Use free reverse geocode API
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const city = data.address?.city
                    || data.address?.town
                    || data.address?.village
                    || data.address?.state_district
                    || 'Unknown';
          resolve({ city, latitude, longitude });
        } catch {
          reject(rejectWithValue('Failed to reverse geocode'));
        }
      },
      (error) => reject(rejectWithValue(error.message)),
      { timeout: 10000 }
    );
  });
});

const locationSlice = createSlice({
  name: 'location',
  initialState: {
    city:      null,
    latitude:  null,
    longitude: null,
    detecting: false,
    detected:  false,
    error:     null,
  },
  reducers: {
    setCity: (state, action) => {
      state.city     = action.payload;
      state.detected = true;
    },
    clearLocation: (state) => {
      state.city      = null;
      state.latitude  = null;
      state.longitude = null;
      state.detected  = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(detectLocation.pending,   (state) => { state.detecting = true; state.error = null; })
      .addCase(detectLocation.fulfilled, (state, action) => {
        state.detecting  = false;
        state.detected   = true;
        state.city       = action.payload.city;
        state.latitude   = action.payload.latitude;
        state.longitude  = action.payload.longitude;
      })
      .addCase(detectLocation.rejected,  (state, action) => {
        state.detecting = false;
        state.error     = action.payload;
      });
  },
});

export const { setCity, clearLocation } = locationSlice.actions;
export const selectCity      = (state) => state.location.city;
export const selectDetecting = (state) => state.location.detecting;
export const selectDetected  = (state) => state.location.detected;
export default locationSlice.reducer;