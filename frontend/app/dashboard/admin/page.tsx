'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getAdminStats, getAllListings } from '@/lib/api';
import { ListingsResponse, Listing } from '@/types/listing.types';
import StatsCard from '@/components/dashboard/StatsCard';
import LoadingState from '@/components/common/LoadingState';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch stats
      try {
        const statsData = await getAdminStats();
        setStats(statsData.data || statsData);
      } catch (err) {
        // Stats might not be available, continue with listings
        console.warn('Failed to fetch stats');
      }

      // Fetch all listings
      const listingsData: ListingsResponse = await getAllListings({ page: 1, limit: 10 });
      setListings(listingsData.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch admin data';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) return <LoadingState message="Loading admin dashboard..." />;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">System overview and management tools</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={() => fetchData()}
            className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            label="Total Users"
            value={stats.totalUsers || 0}
            icon="👥"
            colorClass="blue"
          />
          <StatsCard
            label="Total Listings"
            value={stats.totalListings || 0}
            icon="📋"
            colorClass="green"
          />
          <StatsCard
            label="Published"
            value={stats.publishedListings || 0}
            icon="✅"
            colorClass="green"
          />
          <StatsCard
            label="Pending Review"
            value={stats.draftListings || 0}
            icon="⏳"
            colorClass="orange"
          />
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/dashboard/admin/users"
          className="p-6 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
        >
          <div className="text-3xl mb-3">👥</div>
          <h3 className="font-semibold text-gray-900">User Management</h3>
          <p className="text-sm text-gray-600 mt-2">View and manage all system users</p>
        </Link>

        <Link
          href="#"
          className="p-6 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
        >
          <div className="text-3xl mb-3">📊</div>
          <h3 className="font-semibold text-gray-900">Reports</h3>
          <p className="text-sm text-gray-600 mt-2">View system reports and analytics</p>
        </Link>

        <Link
          href="#"
          className="p-6 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
        >
          <div className="text-3xl mb-3">⚙️</div>
          <h3 className="font-semibold text-gray-900">Settings</h3>
          <p className="text-sm text-gray-600 mt-2">Configure system settings</p>
        </Link>
      </div>

      {/* Recent Listings */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Listings</h2>
        </div>
        {listings.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            <p>No listings yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    City
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{listing.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{listing.owner_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{listing.city}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ${listing.price.toLocaleString()}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
