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
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Base fetcher ─────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? 'Request failed');
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

export { apiFetch, listings };
export type { Listing, ListingsResponse, ListingsParams };
