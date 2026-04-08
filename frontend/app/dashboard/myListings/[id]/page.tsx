'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Listing } from '@/types/listing.types';
import ListingForm from '@/components/forms/ListingForm';
import LoadingState from '@/components/common/LoadingState';

export default function EditListingPage() {
  const params = useParams();
  const id = params.id as string;
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setIsLoading(true);
        const response = await apiFetch<{ data: Listing }>(`/listings/${id}`);
        setListing(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load listing');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (isLoading) return <LoadingState message="Loading listing..." />;

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700">Listing not found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Listing</h1>
        <p className="text-gray-600 mt-2">Update your listing details</p>
      </div>
      <ListingForm initialListing={listing} />
    </div>
  );
}
