'use client';

import { useState, useCallback, useEffect } from 'react';
import { listings } from '@/lib/api';
import { ListingFilter, Listing, ListingsResponse } from '@/types/listing.types';
import ListingsFilter from '@/components/listings/ListingsFilter';
import ListingGrid from '@/components/listings/ListingGrid';
import LoadingState from '@/components/common/LoadingState';

export default function UserDashboard() {
  const [data, setData] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ListingFilter>({
    page: 1,
    limit: 12,
  });
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
  });

  const fetchListings = useCallback(async (filterParams: ListingFilter) => {
    try {
      setIsLoading(true);
      setError(null);
      const response: ListingsResponse = await listings(filterParams);
      setData(response.data);
      setPagination({
        totalItems: response.meta.totalItems,
        totalPages: response.meta.totalPages,
        currentPage: response.meta.page,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch listings';
      setError(message);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings(filters);
  }, [filters, fetchListings]);

  const handleFilterChange = (newFilters: ListingFilter) => {
    setFilters(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Listings</h1>
        <p className="text-gray-600 mt-2">
          Find your perfect rental property among our available listings
        </p>
      </div>

      {/* Filters */}
      <ListingsFilter onFilterChange={handleFilterChange} isLoading={isLoading} />

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={() => fetchListings(filters)}
            className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {/* Listings Grid */}
      {isLoading && data.length === 0 ? (
        <LoadingState message="Loading listings..." />
      ) : (
        <>
          <ListingGrid
            listings={data}
            isLoading={false}
            emptyMessage="No listings found matching your criteria"
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button
                disabled={pagination.currentPage === 1}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
