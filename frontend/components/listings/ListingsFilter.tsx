'use client';

import { useState } from 'react';
import { ListingFilter, PropertyType } from '@/types/listing.types';

const CITIES = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
const PROPERTY_TYPES: PropertyType[] = ['apartment', 'house', 'studio', 'condo', 'townhouse'];

interface ListingsFilterProps {
  onFilterChange: (filters: ListingFilter) => void;
  isLoading?: boolean;
}

export default function ListingsFilter({
  onFilterChange,
  isLoading,
}: ListingsFilterProps) {
  const [filters, setFilters] = useState<ListingFilter>({
    page: 1,
    limit: 12,
    city: '',
    type: undefined,
    priceMin: undefined,
    priceMax: undefined,
    q: '',
  });

  const handleFilterChange = (key: keyof ListingFilter, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: ListingFilter = {
      page: 1,
      limit: 12,
      city: '',
      type: undefined,
      priceMin: undefined,
      priceMax: undefined,
      q: '',
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            placeholder="Search listings..."
            disabled={isLoading}
            value={filters.q || ''}
            onChange={(e) => handleFilterChange('q', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <select
            disabled={isLoading}
            value={filters.city || ''}
            onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">All Cities</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <select
            disabled={isLoading}
            value={filters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">All Types</option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Price Min */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Price
          </label>
          <input
            type="number"
            placeholder="0"
            disabled={isLoading}
            value={filters.priceMin || ''}
            onChange={(e) =>
              handleFilterChange('priceMin', e.target.value ? parseInt(e.target.value) : undefined)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        {/* Price Max */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Price
          </label>
          <input
            type="number"
            placeholder="999999"
            disabled={isLoading}
            value={filters.priceMax || ''}
            onChange={(e) =>
              handleFilterChange('priceMax', e.target.value ? parseInt(e.target.value) : undefined)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>
      </div>

      {/* Reset Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleReset}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium transition-colors disabled:opacity-50"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
