import { API_BASE_URL, DEFAULT_LIMIT, DEFAULT_PAGE } from '@/constants';
import type { PaginatedResponse, PublicListing } from '@/types';
import ListingsView from './ListingsView';

export default async function ListingsPage() {
  const apiBaseUrl = (
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    API_BASE_URL
  ).replace(/\/+$/, '');
  const params = new URLSearchParams({
    page: String(DEFAULT_PAGE),
    limit: String(DEFAULT_LIMIT),
  });
  const response = await fetch(`${apiBaseUrl}/listings?${params}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to load listings (${response.status})`);
  }

  const initialData = await response.json() as PaginatedResponse<PublicListing>;

  return <ListingsView initialData={initialData} />;
}
