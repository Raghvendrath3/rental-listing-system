// Domain types derived from backend API contract

export type Role = 'user' | 'owner' | 'admin';
export type ListingStatus = 'draft' | 'published' | 'archived';
export type OwnerRequestStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type ListingType = 'room' | 'house' | 'apartment' | 'pg' | 'studio' | 'villa';

export interface Listing {
  id: number;
  title: string;
  type: ListingType;
  city: string;
  area: string;
  price: string; // PostgreSQL returns numeric as string
  is_available: boolean;
  owner_id: number;
  status: ListingStatus;
  published_at: string | null;
  archived_at: string | null;
}

export interface OwnerRequest {
  id: number;
  user_id: number;
  status: OwnerRequestStatus;
  created_at: string;
  email: string;
}

export interface User {
  id: number;
  email: string;
  role: Role;
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  totalListings: number;
  publishedListings: number;
  draftListings: number;
  archivedListings: number;
}

// API Response types
export interface ApiResponse<T> {
  status: string;
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  status: string;
  meta: PaginationMeta;
  data: T[];
}

export interface LoginResponse {
  status: string;
  token: string;
  data: {
    id: number;
    role: Role;
  };
}

export interface OwnerStatusResponse {
  status: string;
  data: {
    status: OwnerRequestStatus;
    created_at?: string;
  };
}

export interface OwnerListingsResponse {
  status: 'success';
  data: {
    status: 'success';
    result: Listing[];
  };
}

export interface ErrorResponse {
  status: 'error';
  message: string;
}

// Request payload types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface CreateListingPayload {
  title: string;
  type: ListingType;
  city: string;
  area: string;
  price: number;
  is_available?: boolean;
}

export interface UpdateListingPayload {
  title?: string;
  type?: ListingType;
  city?: string;
  area?: string;
  price?: number;
  is_available?: boolean;
}

// Filter types for listings
export interface ListingFilters {
  q?: string;
  city?: string;
  type?: ListingType;
  priceMin?: number;
  priceMax?: number;
  page?: number;
  limit?: number;
}

// Auth store types
export interface AuthUser {
  id: number;
  role: Role;
}
