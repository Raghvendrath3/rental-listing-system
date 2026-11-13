import { API_BASE_URL, DEFAULT_LIMIT, DEFAULT_PAGE, LISTING_TYPES } from '@/constants';
import type { ListingFilters, ListingType, PaginatedResponse, PublicListing } from '@/types';
import ListingsView from './ListingsView';

export const revalidate = 30;

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function positiveInteger(value: string | undefined, fallback: number, max = Number.MAX_SAFE_INTEGER) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= max ? parsed : fallback;
}

function optionalPrice(value: string | undefined) {
  if (value === undefined || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const search = await searchParams;
  const rawType = firstValue(search.type)?.trim().toLowerCase();
  const initialFilters: ListingFilters = {
    q: firstValue(search.q)?.trim() || undefined,
    city: firstValue(search.city)?.trim() || undefined,
    type: LISTING_TYPES.includes(rawType as ListingType) ? rawType as ListingType : undefined,
    priceMin: optionalPrice(firstValue(search.priceMin)),
    priceMax: optionalPrice(firstValue(search.priceMax)),
    page: positiveInteger(firstValue(search.page), DEFAULT_PAGE),
    limit: positiveInteger(firstValue(search.limit), DEFAULT_LIMIT, 100),
  };
  if (initialFilters.priceMin !== undefined && initialFilters.priceMax !== undefined
    && initialFilters.priceMax <= initialFilters.priceMin) {
    initialFilters.priceMin = undefined;
    initialFilters.priceMax = undefined;
  }

  const apiBaseUrl = (
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    API_BASE_URL
  ).replace(/\/+$/, '');
  const params = new URLSearchParams();
  Object.entries(initialFilters).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });
  const response = await fetch(`${apiBaseUrl}/listings?${params}`, {
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`Failed to load listings (${response.status})`);
  }

  const initialData = await response.json() as PaginatedResponse<PublicListing>;

  return <ListingsView initialData={initialData} initialFilters={initialFilters} />;
}
