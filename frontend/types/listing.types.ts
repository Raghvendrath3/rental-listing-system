// Listing Status enum
export type ListingStatus = 'draft' | 'published' | 'archived';
export type PropertyType = 'apartment' | 'house' | 'studio' | 'condo' | 'townhouse';

// Main Listing interface
export interface Listing {
  id: number;
  owner_id: string;
  title: string;
  description?: string;
  type: PropertyType;
  city: string;
  area: number; // in sq meters or sq feet
  price: number; // monthly rental price
  is_available: boolean;
  status: ListingStatus;
  created_at: string;
  updated_at?: string;
  images?: string[]; // image URLs
}

// Listing filter options
export interface ListingFilter {
  page?: number;
  limit?: number;
  city?: string;
  type?: PropertyType;
  priceMin?: number;
  priceMax?: number;
  q?: string; // search query
  status?: ListingStatus;
}

// API response for listings list
export interface ListingsResponse {
  status: string;
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  data: Listing[];
}

// Single listing response
export interface ListingResponse {
  status: string;
  data: Listing;
}

// Stats for user dashboard
export interface UserStats {
  browsedCount: number;
  savedCount: number;
  inquiredCount: number;
}

// Stats for owner dashboard
export interface OwnerStats {
  totalListings: number;
  publishedListings: number;
  draftListings: number;
  archivedListings: number;
  totalViews: number;
  monthlyInquiries: number;
}

// Stats for admin dashboard
export interface AdminStats {
  totalUsers: number;
  totalOwners: number;
  totalListings: number;
  publishedListings: number;
  draftListings: number;
  archivedListings: number;
  totalInquiries: number;
}

// Create/Update listing payload
export interface CreateListingPayload {
  title: string;
  description?: string;
  type: PropertyType;
  city: string;
  area: number;
  price: number;
  is_available: boolean;
  images?: string[];
}

// Form context for listing operations
export interface ListingFormState {
  listing: Listing | null;
  isLoading: boolean;
  error: string | null;
  isDirty: boolean;
}
