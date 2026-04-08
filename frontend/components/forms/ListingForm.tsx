'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Listing, CreateListingPayload, PropertyType } from '@/types/listing.types';
import { createListing, updateListing } from '@/lib/api';

const PROPERTY_TYPES: PropertyType[] = ['apartment', 'house', 'studio', 'condo', 'townhouse'];
const CITIES = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];

interface ListingFormProps {
  initialListing?: Listing;
  onSuccess?: () => void;
}

export default function ListingForm({ initialListing, onSuccess }: ListingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateListingPayload>({
    title: initialListing?.title || '',
    description: initialListing?.description || '',
    type: initialListing?.type || 'apartment',
    city: initialListing?.city || '',
    area: initialListing?.area || 0,
    price: initialListing?.price || 0,
    is_available: initialListing?.is_available ?? true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (initialListing) {
        await updateListing(initialListing.id, formData);
      } else {
        await createListing(formData);
      }
      onSuccess?.();
      router.push('/dashboard/myListings');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save listing';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg border border-gray-200 p-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Title
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="e.g., Beautiful 2BR Apartment with City View"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="Describe your property..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>

      {/* Property Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Property Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            disabled={isLoading}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            City
          </label>
          <select
            name="city"
            value={formData.city}
            onChange={handleChange}
            disabled={isLoading}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Select City</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Area */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Area (m²)
          </label>
          <input
            type="number"
            name="area"
            value={formData.area}
            onChange={handleChange}
            disabled={isLoading}
            required
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Monthly Price ($)
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            disabled={isLoading}
            required
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>
      </div>

      {/* Availability */}
      <div className="flex items-center">
        <input
          type="checkbox"
          name="is_available"
          id="is_available"
          checked={formData.is_available}
          onChange={handleChange}
          disabled={isLoading}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <label htmlFor="is_available" className="ml-3 text-sm font-medium text-gray-700">
          Property is available for rent
        </label>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Saving...' : initialListing ? 'Update Listing' : 'Create Listing'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
