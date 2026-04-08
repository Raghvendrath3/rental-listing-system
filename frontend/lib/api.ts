import { getJWT } from './tokenManager';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Guard at module load time — fail fast
if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined in environment variables');
}

// ─── Types ────────────────────────────────────────────────

type Listing = {
  id: number;
  title: string;
  city: string;
  price: number; // normalized to number here, not at call site
};

type ListingsResponse = {
  status: string;
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  data: Listing[];
};

type ListingsParams = {
  page?: number;
  limit?: number;
  city?: string;
};



// ─── Custom error class ───────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper to get user-friendly error message
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    // Map common error codes to user-friendly messages
    const errorMap: Record<number, string> = {
      400: 'Invalid request. Please check your input and try again.',
      401: 'Your session has expired. Please log in again.',
      403: 'You do not have permission to perform this action.',
      404: 'The requested resource was not found.',
      409: 'This action conflicts with existing data. Please refresh and try again.',
      500: 'Server error. Please try again later.',
      503: 'Service temporarily unavailable. Please try again later.',
    };
    return errorMap[error.status] || error.message || 'An unexpected error occurred.';
  }
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return 'Network error. Please check your connection and try again.';
  }
  return 'An unexpected error occurred. Please try again.';
}

// ─── Base fetcher ─────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  includeAuth = true
): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };

  // Inject Bearer token if available and needed
  if (includeAuth) {
    const jwt = getJWT();
    if (jwt) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${jwt}`;
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized - user token is invalid/expired
  if (res.status === 401) {
    // Clear token and redirect to login
    const { clearToken } = await import('./tokenManager');
    clearToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
    throw new ApiError(401, 'Session expired. Please login again.');
  }

  if (!res.ok) {
    let errorMessage = 'Request failed';
    try {
      const body = await res.json();
      errorMessage = body.message || body.error || errorMessage;
    } catch {
      // If JSON parsing fails, use status text
      errorMessage = res.statusText || errorMessage;
    }
    throw new ApiError(res.status, errorMessage);
  }

  return res.json() as Promise<T>;
}

// ─── API functions ────────────────────────────────────────

async function listings(params: ListingsParams = {}): Promise<ListingsResponse> {
  const query = new URLSearchParams();
  if (params.page  !== undefined) query.set('page',  String(params.page));
  if (params.limit !== undefined) query.set('limit', String(params.limit));
  if (params.city)                query.set('city',  params.city);

  const path = query.size ? `/listings?${query}` : '/listings';

  // Raw shape from backend — price is still a string here
  type RawListing = Omit<Listing, 'price'> & { price: string };
  type RawResponse = Omit<ListingsResponse, 'data'> & { data: RawListing[] };

  const raw = await apiFetch<RawResponse>(path);

  // Normalize price to number at the boundary
  return {
    ...raw,
    data: raw.data.map((item) => ({
      ...item,
      price: parseFloat(item.price),
    })),
  };
}

// Owner-specific functions
async function getOwnerListings(filters: ListingsParams = {}): Promise<ListingsResponse> {
  const query = new URLSearchParams();
  if (filters.page !== undefined) query.set('page', String(filters.page));
  if (filters.limit !== undefined) query.set('limit', String(filters.limit));
  
  const path = query.size ? `/listings/owner?${query}` : '/listings/owner';
  
  type RawListing = Omit<Listing, 'price'> & { price: string };
  type RawResponse = Omit<ListingsResponse, 'data'> & { data: RawListing[] };
  
  const raw = await apiFetch<RawResponse>(path);
  
  return {
    ...raw,
    data: raw.data.map((item) => ({
      ...item,
      price: parseFloat(item.price),
    })),
  };
}

async function createListing(listing: any): Promise<any> {
  return apiFetch('/listings', {
    method: 'POST',
    body: JSON.stringify(listing),
  });
}

async function updateListing(id: number, updates: any): Promise<any> {
  return apiFetch(`/listings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

async function deleteListing(id: number): Promise<any> {
  return apiFetch(`/listings/${id}`, {
    method: 'DELETE',
  });
}

async function publishListing(id: number): Promise<any> {
  return apiFetch(`/listings/${id}/publish`, {
    method: 'PUT',
  });
}

async function archiveListing(id: number): Promise<any> {
  return apiFetch(`/listings/${id}/archive`, {
    method: 'PUT',
  });
}

// Admin functions
async function getAllListings(filters: ListingsParams = {}): Promise<ListingsResponse> {
  const query = new URLSearchParams();
  if (filters.page !== undefined) query.set('page', String(filters.page));
  if (filters.limit !== undefined) query.set('limit', String(filters.limit));
  
  const path = query.size ? `/listings/admin?${query}` : '/listings/admin';
  
  type RawListing = Omit<Listing, 'price'> & { price: string };
  type RawResponse = Omit<ListingsResponse, 'data'> & { data: RawListing[] };
  
  const raw = await apiFetch<RawResponse>(path);
  
  return {
    ...raw,
    data: raw.data.map((item) => ({
      ...item,
      price: parseFloat(item.price),
    })),
  };
}

async function getAllUsers(): Promise<any> {
  return apiFetch('/users/admin');
}

async function getAdminStats(): Promise<any> {
  return apiFetch('/admin/stats');
}

export { apiFetch, listings, getOwnerListings, createListing, updateListing, deleteListing, publishListing, archiveListing, getAllListings, getAllUsers, getAdminStats };
export type { Listing, ListingsResponse, ListingsParams };
