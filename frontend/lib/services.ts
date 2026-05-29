/**
 * Centralized API service functions.
 * All server state fetching/mutation logic lives here.
 */
import api from './api';
import type {
  LoginResponse,
  ApiResponse,
  PaginatedResponse,
  OwnerStatusResponse,
  OwnerListingsResponse,
  AdminStats,
  OwnerRequest,
  User,
  Listing,
  ListingFilters,
} from '@/types';
import type { CreateListingFormData, UpdateListingFormData } from '@/schemas/listing.schema';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '@/constants';

// ============ Auth Services ============

export async function loginUser(data: { email: string; password: string }) {
  const response = await api.post<LoginResponse>('/auth/login', data);
  return response.data;
}

export async function registerUser(data: { email: string; password: string }) {
  await api.post('/auth/register', data);
  // Immediately login after registration
  return loginUser(data);
}

export async function fetchOwnerStatus() {
  const response = await api.get<OwnerStatusResponse>('/auth/owner-status');
  return response.data.data;
}

export async function submitBecomeOwner() {
  const response = await api.post<ApiResponse<{ id: number; user_id: number; status: string; created_at: string }>>('/auth/become-owner');
  return response.data;
}

// ============ Public Listings Services ============

export async function fetchPublicListings(filters: ListingFilters) {
  const params = new URLSearchParams();
  if (filters.q) params.append('q', filters.q);
  if (filters.city) params.append('city', filters.city);
  if (filters.type) params.append('type', filters.type);
  if (filters.priceMin !== undefined) params.append('priceMin', String(filters.priceMin));
  if (filters.priceMax !== undefined) params.append('priceMax', String(filters.priceMax));
  params.append('page', String(filters.page || DEFAULT_PAGE));
  params.append('limit', String(filters.limit || DEFAULT_LIMIT));

  const response = await api.get<PaginatedResponse<Listing>>(`/listings?${params.toString()}`);
  return response.data;
}

// ============ Owner Listings Services ============

export async function fetchOwnerListings() {
  const response = await api.get<OwnerListingsResponse>('/owner/owner-listings');
  // Quirky nested response: data.data.result
  return response.data.data.result;
}

export async function createListing(data: CreateListingFormData) {
  // POST /owner/ requires body.payload structure
  const response = await api.post<ApiResponse<Listing>>('/owner/', { payload: data });
  return response.data.data;
}

export async function updateListing({ id, data }: { id: number; data: UpdateListingFormData }) {
  // PATCH /owner/:id reads from body directly
  const response = await api.patch<ApiResponse<Listing>>(`/owner/${id}`, data);
  return response.data.data;
}

export async function deleteListing(id: number) {
  const response = await api.delete<ApiResponse<Listing>>(`/owner/${id}`);
  return response.data.data;
}

export async function publishListing(id: number) {
  const response = await api.patch<ApiResponse<Listing>>(`/owner/${id}/publish`);
  return response.data.data;
}

export async function archiveListing(id: number) {
  const response = await api.patch<ApiResponse<Listing>>(`/owner/${id}/archive`);
  return response.data.data;
}

// ============ Admin Services ============

export async function fetchAdminStats() {
  const response = await api.get<ApiResponse<AdminStats>>('/admin/stats');
  return response.data.data;
}

export async function fetchOwnerRequests() {
  const response = await api.get<ApiResponse<OwnerRequest[]>>('/admin/requests');
  return response.data.data;
}

export async function approveRequest(id: number) {
  const response = await api.patch<ApiResponse<OwnerRequest>>(`/admin/requests/${id}/approve`);
  return response.data.data;
}

export async function rejectRequest(id: number) {
  const response = await api.patch<ApiResponse<OwnerRequest>>(`/admin/requests/${id}/reject`);
  return response.data.data;
}

export async function fetchUsers() {
  const response = await api.get<ApiResponse<User[]>>('/admin/admin');
  return response.data.data;
}
