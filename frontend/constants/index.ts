import type { ListingType, ListingStatus, OwnerRequestStatus, Role } from '@/types';

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// LocalStorage keys
export const STORAGE_KEYS = {
  TOKEN: 'rental_token',
  USER: 'rental_user',
} as const;

// Listing types enforced by DB CHECK constraint
export const LISTING_TYPES: ListingType[] = [
  'apartment',
  'house',
  'room',
  'pg',
  'studio',
  'villa',
] as const;

// Listing type labels for display
export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  apartment: 'Apartment',
  house: 'House',
  room: 'Room',
  pg: 'PG',
  studio: 'Studio',
  villa: 'Villa',
};

// Status badge styles
export const LISTING_STATUS_STYLES: Record<ListingStatus, { bg: string; text: string }> = {
  draft: { bg: 'bg-secondary', text: 'text-secondary-foreground' },
  published: { bg: 'bg-green-100', text: 'text-green-700' },
  archived: { bg: 'bg-red-100', text: 'text-red-600' },
};

export const OWNER_REQUEST_STATUS_STYLES: Record<OwnerRequestStatus, { bg: string; text: string }> = {
  none: { bg: 'bg-secondary', text: 'text-secondary-foreground' },
  pending: { bg: 'bg-amber-100', text: 'text-amber-700' },
  approved: { bg: 'bg-green-100', text: 'text-green-700' },
  rejected: { bg: 'bg-red-100', text: 'text-red-600' },
};

export const ROLE_BADGE_STYLES: Record<Role, { bg: string; text: string }> = {
  user: { bg: 'bg-secondary', text: 'text-secondary-foreground' },
  owner: { bg: 'bg-blue-100', text: 'text-blue-700' },
  admin: { bg: 'bg-purple-100', text: 'text-purple-700' },
};

// Pagination defaults
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;

// Password validation requirements
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSymbol: true,
};

// Token expiry (for reference - actual expiry enforced by backend)
export const TOKEN_EXPIRY_HOURS = 1;

// Debounce timing for search
export const SEARCH_DEBOUNCE_MS = 400;

// Toast auto-dismiss duration
export const TOAST_DURATION_MS = 4000;
