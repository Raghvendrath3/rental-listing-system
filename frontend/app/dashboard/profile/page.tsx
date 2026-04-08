'use client';

import { useAuth } from '@/hooks/useAuth';
import LoadingState from '@/components/common/LoadingState';

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingState message="Loading profile..." />;

  if (!user) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">No user data available</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md">
        {/* Avatar */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl mb-4">
            👤
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-lg font-semibold text-gray-900">{user.email}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Role</p>
            <p className="text-lg font-semibold">
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

          <div>
            <p className="text-sm text-gray-600">Account Type</p>
            <p className="text-lg font-semibold text-gray-900">
              {user.role === 'owner'
                ? 'Property Owner'
                : user.role === 'admin'
                ? 'Administrator'
                : 'Regular User'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium">
            Edit Profile
          </button>
          <button className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium">
            Change Password
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-700 text-sm">
          <strong>Tip:</strong> Additional profile features coming soon. You can update your profile
          details, change password, and manage notifications.
        </p>
      </div>
    </div>
  );
}
