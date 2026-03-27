import { useDispatch, useSelector } from 'react-redux';
import {
  selectCartItems,
  selectCartCount,
  selectCartSubtotal,
  selectCartTotals,
  selectCartRestaurantId,
  selectItemQuantity,
  addToCart,
  removeOneFromCart,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
} from '../store/slices/cartSlice.js';

export function useCart() {
  const dispatch     = useDispatch();
  const items        = useSelector(selectCartItems);
  const count        = useSelector(selectCartCount);
  const subtotal     = useSelector(selectCartSubtotal);
  const totals       = useSelector(selectCartTotals);
  const restaurantId = useSelector(selectCartRestaurantId);

  function add(menuItem, restaurantId, restaurantName) {
    dispatch(addToCart({ menuItem, restaurantId, restaurantName }));
  }

  function removeOne(menuItemId) {
    dispatch(removeOneFromCart(menuItemId));
  }

  function remove(menuItemId) {
    dispatch(removeFromCart(menuItemId));
  }

  function clear() {
    dispatch(clearCart());
  }

  function applyDiscount(code, discount) {
    dispatch(applyCoupon({ code, discount }));
  }

  function removeDiscount() {
    dispatch(removeCoupon());
  }

  function getItemQuantity(menuItemId) {
    return items.find((i) => i.menuItem.id === menuItemId)?.quantity || 0;
  }

  return {
    items,
    count,
    subtotal,
    totals,
    restaurantId,
    isEmpty: items.length === 0,
    add,
    removeOne,
    remove,
    clear,
    applyDiscount,
    removeDiscount,
    getItemQuantity,
  };
}
