import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    darkMode: false,
    cartOpen: false,
    searchOpen: false,
    mobileMenuOpen: false,
    activeModal: null, // 'login' | 'register' | 'restaurantSwitch' | null
  },
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setDarkMode: (state, { payload }) => {
      state.darkMode = payload;
      if (payload) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    openCart: (state) => { state.cartOpen = true; },
    closeCart: (state) => { state.cartOpen = false; },
    toggleCart: (state) => { state.cartOpen = !state.cartOpen; },
    openSearch: (state) => { state.searchOpen = true; },
    closeSearch: (state) => { state.searchOpen = false; },
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen; },
    closeMobileMenu: (state) => { state.mobileMenuOpen = false; },
    openModal: (state, { payload }) => { state.activeModal = payload; },
    closeModal: (state) => { state.activeModal = null; },
  },
});

export const selectDarkMode = (state) => state.ui.darkMode;
export const selectCartOpen = (state) => state.ui.cartOpen;
export const selectSearchOpen = (state) => state.ui.searchOpen;
export const selectMobileMenuOpen = (state) => state.ui.mobileMenuOpen;
export const selectActiveModal = (state) => state.ui.activeModal;

export const {
  toggleDarkMode, setDarkMode,
  openCart, closeCart, toggleCart,
  openSearch, closeSearch,
  toggleMobileMenu, closeMobileMenu,
  openModal, closeModal,
} = uiSlice.actions;

export default uiSlice.reducer;
