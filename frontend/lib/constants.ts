/**
 * Application-wide Constants
 * Centralized values used throughout the application
 */

// ============================================================
// Listing Status
// ============================================================

export const LISTING_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export const LISTING_STATUS_LABELS = {
  [LISTING_STATUS.DRAFT]: 'Draft',
  [LISTING_STATUS.PUBLISHED]: 'Published',
  [LISTING_STATUS.ARCHIVED]: 'Archived',
} as const;

export const LISTING_STATUS_COLORS = {
  [LISTING_STATUS.DRAFT]: 'bg-gray-100 text-gray-800',
  [LISTING_STATUS.PUBLISHED]: 'bg-green-100 text-green-800',
  [LISTING_STATUS.ARCHIVED]: 'bg-red-100 text-red-800',
} as const;

// ============================================================
// User Roles
// ============================================================

export const USER_ROLES = {
  USER: 'user',
  OWNER: 'owner',
  ADMIN: 'admin',
} as const;

export const USER_ROLE_LABELS = {
  [USER_ROLES.USER]: 'User',
  [USER_ROLES.OWNER]: 'Property Owner',
  [USER_ROLES.ADMIN]: 'Administrator',
} as const;

// ============================================================
// Listing Types
// ============================================================

export const LISTING_TYPES = ['apartment', 'house', 'studio', 'condo', 'townhouse'] as const;

export const LISTING_TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartment',
  house: 'House',
  studio: 'Studio',
  condo: 'Condo',
  townhouse: 'Townhouse',
};

// ============================================================
// Pagination
// ============================================================

export const DEFAULT_PAGE_SIZE = 10;
export const LISTING_PAGE_SIZE = 12;
export const ADMIN_PAGE_SIZE = 20;

// ============================================================
// Forms
// ============================================================

export const PASSWORD_MIN_LENGTH = 8;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_STRENGTH = {
  WEAK: 'weak',
  FAIR: 'fair',
  GOOD: 'good',
  STRONG: 'strong',
  VERY_STRONG: 'very-strong',
} as const;

// ============================================================
// Timeouts & Delays
// ============================================================

export const API_TIMEOUT_MS = 30000; // 30 seconds
export const TOAST_DURATION_MS = 4000; // 4 seconds
export const DEBOUNCE_DELAY_MS = 500; // 500ms for input debouncing
export const SESSION_WARNING_MS = 300000; // 5 minutes before session expires

// ============================================================
// Error Messages
// ============================================================

export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'Session expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  CONFLICT: 'This action conflicts with existing data. Please refresh and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable. Please try again later.',
  FORM_INVALID: 'Please check your form and try again.',
  PASSWORD_WEAK: 'Password is too weak. Please use a stronger password.',
  EMAIL_INVALID: 'Please enter a valid email address.',
  EMAIL_EXISTS: 'This email address is already registered.',
  LOGIN_FAILED: 'Invalid email or password. Please try again.',
} as const;

// ============================================================
// Success Messages
// ============================================================

export const SUCCESS_MESSAGES = {
  LOGIN: 'Logged in successfully!',
  LOGOUT: 'Logged out successfully.',
  REGISTER: 'Account created successfully! Please log in.',
  LISTING_CREATED: 'Listing created successfully!',
  LISTING_UPDATED: 'Listing updated successfully!',
  LISTING_DELETED: 'Listing deleted successfully!',
  LISTING_PUBLISHED: 'Listing published successfully!',
  LISTING_ARCHIVED: 'Listing archived successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
} as const;

// ============================================================
// Route Paths
// ============================================================

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  DASHBOARD_LISTINGS: '/dashboard/myListings',
  DASHBOARD_PROFILE: '/dashboard/profile',
  ADMIN: '/dashboard/admin',
  ADMIN_USERS: '/dashboard/admin/users',
} as const;

// ============================================================
// API Paths
// ============================================================

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/users/login',
  REGISTER: '/users/',
  
  // Listings
  LISTINGS: '/listings',
  LISTINGS_BROWSE: '/listings/browse',
  LISTINGS_OWNER: '/listings/owner',
  LISTINGS_ADMIN: '/listings/admin',
  
  // Listing Operations
  LISTING_GET: (id: number) => `/listings/${id}`,
  LISTING_CREATE: '/listings',
  LISTING_UPDATE: (id: number) => `/listings/${id}`,
  LISTING_DELETE: (id: number) => `/listings/${id}`,
  LISTING_PUBLISH: (id: number) => `/listings/${id}/publish`,
  LISTING_ARCHIVE: (id: number) => `/listings/${id}/archive`,
  
  // Admin
  ADMIN_USERS: '/users/admin',
  ADMIN_STATS: '/admin/stats',
} as const;

// ============================================================
// Sorting Options
// ============================================================

export const SORT_OPTIONS = {
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
  NEWEST: 'newest',
  OLDEST: 'oldest',
} as const;

export const SORT_LABELS = {
  [SORT_OPTIONS.PRICE_ASC]: 'Price: Low to High',
  [SORT_OPTIONS.PRICE_DESC]: 'Price: High to Low',
  [SORT_OPTIONS.NEWEST]: 'Newest First',
  [SORT_OPTIONS.OLDEST]: 'Oldest First',
} as const;

// ============================================================
// Price Ranges
// ============================================================

export const PRICE_RANGES = [
  { min: 0, max: 1000, label: 'Under $1,000' },
  { min: 1000, max: 2000, label: '$1,000 - $2,000' },
  { min: 2000, max: 3000, label: '$2,000 - $3,000' },
  { min: 3000, max: 5000, label: '$3,000 - $5,000' },
  { min: 5000, max: Infinity, label: '$5,000+' },
] as const;
