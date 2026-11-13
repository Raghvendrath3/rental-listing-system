'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';
import { useDebounce } from '@/hooks/use-debounce';
import { LISTING_TYPES, LISTING_TYPE_LABELS, DEFAULT_PAGE, DEFAULT_LIMIT, SEARCH_DEBOUNCE_MS } from '@/constants';
import { formatPrice, capitalizeWords } from '@/utils/format';
import type { PaginatedResponse, PublicListing, ListingFilters, ListingType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Home, Filter, X, ChevronLeft, ChevronRight, Building2, Users, Sparkles, BedDouble } from 'lucide-react';

const ListingImagePlaceholder = ({ type }: { type: string }) => {
  const gradients = {
    apartment: 'from-teal-50 to-teal-100/60',
    house: 'from-amber-50 to-amber-100/60',
    room: 'from-blue-50 to-blue-100/60',
    pg: 'from-orange-50 to-orange-100/60',
    studio: 'from-indigo-50 to-indigo-100/60',
    villa: 'from-rose-50 to-rose-100/60',
  };
  
  const icons = {
    apartment: <Building2 className="h-10 w-10 text-primary/80" />,
    house: <Home className="h-10 w-10 text-primary/80" />,
    room: <BedDouble className="h-10 w-10 text-primary/80" />,
    pg: <Users className="h-10 w-10 text-primary/80" />,
    studio: <Sparkles className="h-10 w-10 text-primary/80" />,
    villa: <Building2 className="h-10 w-10 text-primary/80" />,
  };

  const gradient = gradients[type as keyof typeof gradients] || 'from-slate-50 to-slate-100/60';
  const icon = icons[type as keyof typeof icons] || <Home className="h-10 w-10 text-primary/80" />;

  return (
    <div className={`h-40 w-full bg-gradient-to-br ${gradient} flex items-center justify-center border-b border-border/50 relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(var(--foreground) 1px, transparent 0)', backgroundSize: '12px 12px' }} />
      {icon}
    </div>
  );
};

async function fetchListings(filters: ListingFilters, signal?: AbortSignal) {
  const response = await api.get<PaginatedResponse<PublicListing>>('/listings', {
    params: {
      q: filters.q,
      city: filters.city,
      type: filters.type,
      priceMin: filters.priceMin,
      priceMax: filters.priceMax,
      page: filters.page || DEFAULT_PAGE,
      limit: filters.limit || DEFAULT_LIMIT,
    },
    signal,
  });
  return response.data;
}

function ListingCardsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading listings" aria-busy="true">
      {Array.from({ length: DEFAULT_LIMIT }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
          <div className="h-40 animate-pulse bg-muted" />
          <div className="space-y-4 p-5">
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-9 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ListingsView({
  initialData,
  initialFilters,
}: {
  initialData: PaginatedResponse<PublicListing> | null;
  initialFilters: ListingFilters;
}) {
  const [search, setSearch] = useState(initialFilters.q ?? '');
  const [city, setCity] = useState(initialFilters.city ?? '');
  const [type, setType] = useState<ListingType | 'all'>(initialFilters.type ?? 'all');
  const [priceMin, setPriceMin] = useState(initialFilters.priceMin === undefined ? '' : String(initialFilters.priceMin));
  const [priceMax, setPriceMax] = useState(initialFilters.priceMax === undefined ? '' : String(initialFilters.priceMax));
  const [page, setPage] = useState(initialFilters.page ?? DEFAULT_PAGE);
  const [limit, setLimit] = useState(initialFilters.limit ?? DEFAULT_LIMIT);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);
  const debouncedCity = useDebounce(city, SEARCH_DEBOUNCE_MS);
  const queryClient = useQueryClient();

  const filterSignature = JSON.stringify([
    debouncedSearch,
    debouncedCity,
    type,
    priceMin,
    priceMax,
  ]);
  const previousFilterSignature = useRef(filterSignature);

  useEffect(() => {
    if (previousFilterSignature.current !== filterSignature) {
      setPage(DEFAULT_PAGE);
    }
    previousFilterSignature.current = filterSignature;
  }, [filterSignature]);

  const filters: ListingFilters = {
    q: debouncedSearch || undefined,
    city: debouncedCity || undefined,
    type: type === 'all' ? undefined : type,
    priceMin: priceMin ? Number(priceMin) : undefined,
    priceMax: priceMax ? Number(priceMax) : undefined,
    page,
    limit,
  };

  const isInitialQuery = filters.q === initialFilters.q
    && filters.city === initialFilters.city
    && filters.type === initialFilters.type
    && filters.priceMin === initialFilters.priceMin
    && filters.priceMax === initialFilters.priceMax
    && filters.page === initialFilters.page
    && filters.limit === initialFilters.limit;
  const {
    data,
    isLoading,
    isFetching,
    isError,
    isPlaceholderData,
    error,
  } = useQuery({
    queryKey: ['listings', filters],
    queryFn: ({ signal }) => fetchListings(filters, signal),
    initialData: isInitialQuery ? initialData ?? undefined : undefined,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.city) params.set('city', filters.city);
    if (filters.type) params.set('type', filters.type);
    if (filters.priceMin !== undefined) params.set('priceMin', String(filters.priceMin));
    if (filters.priceMax !== undefined) params.set('priceMax', String(filters.priceMax));
    if (filters.page !== DEFAULT_PAGE) params.set('page', String(filters.page));
    if (filters.limit !== DEFAULT_LIMIT) params.set('limit', String(filters.limit));
    const query = params.toString();
    const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(window.history.state, '', url);
  }, [filters.q, filters.city, filters.type, filters.priceMin, filters.priceMax, filters.page, filters.limit]);

  useEffect(() => {
    if (!data || isPlaceholderData || page >= data.meta.totalPages) return;

    const nextPageFilters = { ...filters, page: page + 1 };
    void queryClient.prefetchQuery({
      queryKey: ['listings', nextPageFilters],
      queryFn: ({ signal }) => fetchListings(nextPageFilters, signal),
      staleTime: 30 * 1000,
    });
  }, [
    data,
    debouncedSearch,
    debouncedCity,
    isPlaceholderData,
    page,
    priceMin,
    priceMax,
    queryClient,
    type,
  ]);

  const hasActiveFilters = debouncedSearch || debouncedCity || type !== 'all' || priceMin || priceMax;

  const clearFilters = () => {
    setSearch('');
    setCity('');
    setType('all');
    setPriceMin('');
    setPriceMax('');
    setPage(DEFAULT_PAGE);
    setLimit(DEFAULT_LIMIT);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Available Rentals</h1>
          <p className="text-sm text-muted-foreground">
            {data?.meta?.totalItems ?? 0} properties found
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="sm:hidden"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter row - visible on desktop, toggleable on mobile */}
        <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${showFilters ? '' : 'hidden sm:grid'}`}>
          <div className="space-y-1.5">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="Filter by city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="type">Property Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as ListingType | 'all')}>
              <SelectTrigger id="type">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {LISTING_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {LISTING_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="priceMin">Min Price</Label>
            <Input
              id="priceMin"
              type="number"
              placeholder="0"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="priceMax">Max Price</Label>
            <Input
              id="priceMax"
              type="number"
              placeholder="Any"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
            />
          </div>
        </div>

        {/* Active filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-3 w-3" />
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Results */}
      {isError && data && (
        <p role="status" className="text-sm text-destructive">
          Could not refresh listings. Showing the previous results.
        </p>
      )}
      {isFetching && data && !isError && (
        <p role="status" className="text-sm text-muted-foreground">
          Updating listings...
        </p>
      )}
      {!data && isError ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">{getErrorMessage(error)}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      ) : !data && isLoading ? (
        <ListingCardsSkeleton />
      ) : data?.data.length === 0 ? (
        <div className="rounded-lg border border-border bg-muted/50 p-12 text-center">
          <Home className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No listings found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Listings Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data?.data.map((listing) => (
              <Card key={listing.id} className="flex flex-col overflow-hidden bg-card border border-border/80 shadow-sm rounded-xl hover-lift group animate-fade-up">
                {/* Visual Image Placeholder */}
                <ListingImagePlaceholder type={listing.type} />
                
                {/* Details Content */}
                <div className="px-5 pt-4 pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {LISTING_TYPE_LABELS[listing.type]}
                    </span>
                    <Badge variant={listing.is_available ? 'default' : 'secondary'} className="text-[11px] font-medium px-2 py-0.5">
                      {listing.is_available ? 'Available' : 'Rented'}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-lg text-foreground mt-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {capitalizeWords(listing.title)}
                  </h3>
                </div>

                <CardContent className="px-5 pb-4 space-y-2.5 flex-1">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                    <MapPin className="h-4 w-4 shrink-0 text-primary" />
                    <span className="truncate">{capitalizeWords(listing.area)}, {capitalizeWords(listing.city)}</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-extrabold text-primary">
                      {formatPrice(listing.price)}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">/month</span>
                  </div>
                </CardContent>

                <CardFooter className="px-5 pb-5 pt-0 border-t-0 flex items-center justify-between w-full">
                  <Link href={`/listings/${listing.id}`} className="w-full">
                    <Button size="default" variant="outline" className="w-full h-10 text-sm font-semibold rounded-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200">
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {data && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="px-4 text-sm text-muted-foreground">
                Page {data.meta.page} of {data.meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                disabled={page === data.meta.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
