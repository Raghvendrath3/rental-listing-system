'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllUsers } from '@/lib/api';
import { User } from '@/types/user.types';
import LoadingState from '@/components/common/LoadingState';
import DataTable from '@/components/dashboard/DataTable';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getAllUsers();
      setUsers(response.data || response || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const columns = [
    {
      header: 'Email',
      accessor: 'email' as const,
    },
    {
      header: 'Role',
      accessor: 'role' as const,
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
          value === 'admin'
            ? 'bg-red-100 text-red-700'
            : value === 'owner'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      header: 'Created',
      accessor: 'created_at' as const,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">View and manage all system users</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={() => fetchUsers()}
            className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Owners</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {users.filter((u) => u.role === 'owner').length}
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Regular Users</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {users.filter((u) => u.role === 'user').length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <LoadingState message="Loading users..." />
      ) : (
        <DataTable
          columns={columns}
          data={users}
          isLoading={false}
          isEmpty={users.length === 0}
        />
      )}
    </div>
  );
}
