import { format, formatDistanceToNow, parseISO } from 'date-fns';

// Date formatting utilities
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

export const formatTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'hh:mm a');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy hh:mm a');
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

// Permission utilities
export const hasPermission = (user, permission) => {
  const permissions = {
    admin: ['all'],
    manager: ['view_team', 'approve', 'assign_tasks', 'view_reports'],
    salesperson: ['view_own', 'create_visit', 'create_order', 'update_status'],
  };

  const userPermissions = permissions[user?.role] || [];
  return userPermissions.includes('all') || userPermissions.includes(permission);
};

export const canViewTeamData = (user) => {
  return user?.role === 'admin' || user?.role === 'manager';
};

export const canApprove = (user) => {
  return user?.role === 'admin' || user?.role === 'manager';
};

// Status utilities
export const getStatusColor = (status) => {
  const colors = {
    completed: 'bg-success-500 text-white',
    'in-progress': 'bg-primary-500 text-white',
    pending: 'bg-warning-500 text-white',
    approved: 'bg-success-500 text-white',
    rejected: 'bg-danger-500 text-white',
    active: 'bg-success-500 text-white',
    inactive: 'bg-gray-500 text-white',
    new: 'bg-blue-500 text-white',
    closed: 'bg-gray-600 text-white',
    lost: 'bg-danger-500 text-white',
  };
  return colors[status] || 'bg-gray-500 text-white';
};

export const getStatusBadgeColor = (status) => {
  const colors = {
    completed: 'bg-green-100 text-green-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    new: 'bg-blue-100 text-blue-800',
    closed: 'bg-gray-100 text-gray-800',
    lost: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Number formatting
export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (number) => {
  return new Intl.NumberFormat('en-IN').format(number);
};

export const formatDistance = (km) => {
  return `${km.toFixed(2)} km`;
};

// String utilities
export const truncate = (str, length = 50) => {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Location utilities
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

export const isWithinGeofence = (currentLocation, geofenceCenter, radiusKm) => {
  const distance = calculateDistance(
    currentLocation.lat,
    currentLocation.lng,
    geofenceCenter.lat,
    geofenceCenter.lng
  );
  return distance <= radiusKm;
};

// Validation utilities
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const isValidPhone = (phone) => {
  const re = /^[6-9]\d{9}$/;
  return re.test(phone.replace(/\D/g, ''));
};

// Class name utilities
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
