'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';
import { useDebounce } from '@/hooks/use-debounce';
import { LISTING_TYPES, LISTING_TYPE_LABELS, DEFAULT_PAGE, DEFAULT_LIMIT, SEARCH_DEBOUNCE_MS } from '@/constants';
import { formatPrice, capitalizeWords } from '@/utils/format';
import type { PaginatedResponse, Listing, ListingFilters, ListingType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Search, MapPin, Home, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';

async function fetchListings(filters: ListingFilters) {
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

export default function ListingsPage() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState<ListingType | 'all'>('all');
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);
  const debouncedCity = useDebounce(city, SEARCH_DEBOUNCE_MS);

  // Reset page when filters change
  useEffect(() => {
    setPage(DEFAULT_PAGE);
  }, [debouncedSearch, debouncedCity, type, priceMin, priceMax]);

  const filters: ListingFilters = {
    q: debouncedSearch || undefined,
    city: debouncedCity || undefined,
    type: type === 'all' ? undefined : type,
    priceMin: priceMin ? Number(priceMin) : undefined,
    priceMax: priceMax ? Number(priceMax) : undefined,
    page,
    limit: DEFAULT_LIMIT,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['listings', filters],
    queryFn: () => fetchListings(filters),
  });

  const hasActiveFilters = debouncedSearch || debouncedCity || type !== 'all' || priceMin || priceMax;

  const clearFilters = () => {
    setSearch('');
    setCity('');
    setType('all');
    setPriceMin('');
    setPriceMax('');
    setPage(DEFAULT_PAGE);
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
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">{getErrorMessage(error)}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.data.map((listing) => (
              <Card key={listing.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2 text-lg leading-tight">
                      {capitalizeWords(listing.title)}
                    </CardTitle>
                    <Badge variant="secondary" className="shrink-0">
                      {LISTING_TYPE_LABELS[listing.type]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{capitalizeWords(listing.area)}, {capitalizeWords(listing.city)}</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(listing.price)}
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Badge variant={listing.is_available ? 'default' : 'secondary'}>
                    {listing.is_available ? 'Available' : 'Not Available'}
                  </Badge>
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
