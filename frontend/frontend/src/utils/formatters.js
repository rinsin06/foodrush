export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const formatDate = (dateString) =>
  dateString ? new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

export const formatTime = (dateString) =>
  dateString ? new Date(dateString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-';

export const truncate = (str, maxLength = 50) =>
  str && str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
