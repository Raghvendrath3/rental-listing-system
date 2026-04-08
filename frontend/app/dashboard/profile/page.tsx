'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import LoadingState from '@/components/common/LoadingState';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <LoadingState message="Loading profile..." />;

  if (!user) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">No user data available</p>
      </div>
    );
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and role</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-2xl">
        {/* Avatar */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl mb-4">
            👤
          </div>
        </div>

        {/* User Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border-b md:border-b-0 md:border-r md:pr-6 pb-6 md:pb-0">
            <p className="text-sm text-gray-600 mb-2">Email Address</p>
            <p className="text-lg font-semibold text-gray-900">{user.email}</p>
          </div>

          <div className="pb-6 md:pb-0">
            <p className="text-sm text-gray-600 mb-2">Role</p>
            <p>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                  user.role === 'admin'
                    ? 'bg-red-100 text-red-700'
                    : user.role === 'owner'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </p>
          </div>

          <div className="border-b md:border-b-0 md:border-r md:pr-6 pb-6 md:pb-0">
            <p className="text-sm text-gray-600 mb-2">Account Type</p>
            <p className="text-lg font-semibold text-gray-900">
              {user.role === 'owner'
                ? 'Property Owner'
                : user.role === 'admin'
                ? 'Administrator'
                : 'Regular User'}
            </p>
          </div>

          <div className="pb-6 md:pb-0">
            <p className="text-sm text-gray-600 mb-2">Member Since</p>
            <p className="text-lg font-semibold text-gray-900">
              {user.created_at ? formatDate(user.created_at) : 'N/A'}
            </p>
          </div>
        </div>

        {/* Role-specific Info */}
        {user.role === 'user' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-blue-700 text-sm mb-4">
              Ready to list your properties? As a regular user, you can request to become an owner and start listing your rental properties.
            </p>
            <button
              onClick={() => router.push('/dashboard/become-owner')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Request to Become Owner
            </button>
          </div>
        )}

        {user.role === 'owner' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <p className="text-green-700 text-sm">
              You have owner privileges! You can create and manage listings from the dashboard.
            </p>
          </div>
        )}

        {user.role === 'admin' && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-8">
            <p className="text-purple-700 text-sm">
              You have administrator privileges. You can manage users, listings, and system settings.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium text-sm disabled opacity-50 cursor-not-allowed"
            disabled
            title="Coming soon">
            Change Password
          </button>
          <button
            onClick={() => router.back()}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium text-sm"
          >
            Back
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl">
        <p className="text-blue-700 text-sm">
          <strong>Note:</strong> Some profile features like password change are coming soon. Contact support if you need to reset your password.
        </p>
      </div>
    </div>
  );
}
