'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getOwnerListings, deleteListing, publishListing, archiveListing } from '@/lib/api';
import { Listing, ListingsResponse } from '@/types/listing.types';
import StatsCard from '@/components/dashboard/StatsCard';
import ListingGrid from '@/components/listings/ListingGrid';
import LoadingState from '@/components/common/LoadingState';

export default function OwnerListings() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
  });

  const fetchListings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response: ListingsResponse = await getOwnerListings({ page: 1, limit: 50 });
      setListings(response.data);

      // Calculate stats
      setStats({
        total: response.data.length,
        published: response.data.filter((l) => l.status === 'published').length,
        draft: response.data.filter((l) => l.status === 'draft').length,
        archived: response.data.filter((l) => l.status === 'archived').length,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch listings';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    try {
      await deleteListing(id);
      await fetchListings();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete listing');
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await publishListing(id);
      await fetchListings();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to publish listing');
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await archiveListing(id);
      await fetchListings();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to archive listing');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-600 mt-2">Manage all your rental properties</p>
        </div>
        <Link
          href="/dashboard/myListings/new"
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          + New Listing
        </Link>
      </div>

      {/* Stats */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsCard label="Total Listings" value={stats.total} icon="📋" colorClass="blue" />
          <StatsCard label="Published" value={stats.published} icon="✅" colorClass="green" />
          <StatsCard label="Drafts" value={stats.draft} icon="📝" colorClass="orange" />
          <StatsCard label="Archived" value={stats.archived} icon="🗂️" colorClass="red" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={() => fetchListings()}
            className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {/* Listings */}
      {isLoading ? (
        <LoadingState message="Loading your listings..." />
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Listings Yet</h3>
          <p className="text-gray-600 mb-6">Create your first listing to get started</p>
          <Link
            href="/dashboard/myListings/new"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Listing
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{listing.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{listing.city}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    ${listing.price.toLocaleString()}/mo
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        listing.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : listing.status === 'draft'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2 flex">
                    <button
                      onClick={() => router.push(`/dashboard/myListings/${listing.id}`)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Edit
                    </button>
                    {listing.status === 'draft' && (
                      <button
                        onClick={() => handlePublish(listing.id)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                      >
                        Publish
                      </button>
                    )}
                    {listing.status === 'published' && (
                      <button
                        onClick={() => handleArchive(listing.id)}
                        className="px-3 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                      >
                        Archive
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(listing.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
