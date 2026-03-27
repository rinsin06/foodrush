export const ORDER_STATUS = {
  PLACED: 'Order Placed',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY_FOR_PICKUP: 'Ready for Pickup',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const ROLES = { USER: 'USER', ADMIN: 'ADMIN', RESTAURANT: 'RESTAURANT' };

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
