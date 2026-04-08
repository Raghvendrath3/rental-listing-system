'use client';

import { useState, useCallback, useEffect } from 'react';
import { getPendingOwnerRequests, approveOwnerRequest, rejectOwnerRequest } from '@/lib/api';
import LoadingState from '@/components/common/LoadingState';

interface OwnerRequest {
  id: number;
  user_id: number;
  email: string;
  status: string;
  requested_at: string;
}

interface OwnerRequestsResponse {
  status: string;
  data: OwnerRequest[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export default function OwnerRequestsPage() {
  const [requests, setRequests] = useState<OwnerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response: OwnerRequestsResponse = await getPendingOwnerRequests(page, limit);
      setRequests(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch owner requests';
      setError(message);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (id: number) => {
    try {
      setActionLoading(id);
      await approveOwnerRequest(id);
      // Remove the approved request from the list
      setRequests((prev) => prev.filter((req) => req.id !== id));
      // Show success message (you might want to add a toast)
      alert('Owner request approved successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to approve request';
      alert(`Error: ${message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectClick = (id: number) => {
    setRejectingId(id);
    setRejectReason('');
  };

  const handleRejectConfirm = async () => {
    if (!rejectingId) return;
    try {
      setActionLoading(rejectingId);
      await rejectOwnerRequest(rejectingId, rejectReason || undefined);
      // Remove the rejected request from the list
      setRequests((prev) => prev.filter((req) => req.id !== rejectingId));
      // Reset rejection state
      setRejectingId(null);
      setRejectReason('');
      // Show success message
      alert('Owner request rejected successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reject request';
      alert(`Error: ${message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Owner Requests</h1>
        <p className="text-gray-600 mt-2">Review and manage user requests to become owners</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={() => fetchRequests()}
            className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading && <LoadingState message="Loading owner requests..." />}

      {/* Main Content */}
      {!isLoading && (
        <>
          {/* Pending Requests Count */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 font-medium">
              {requests.length} pending owner request{requests.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Requests Table */}
          {requests.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-600">No pending owner requests</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        User Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Requested Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {requests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {request.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(request.requested_at)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(request.id)}
                              disabled={actionLoading === request.id}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {actionLoading === request.id ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleRejectClick(request.id)}
                              disabled={actionLoading === request.id}
                              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {actionLoading === request.id ? 'Processing...' : 'Reject'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Reject Modal */}
      {rejectingId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Reject Owner Request</h2>
            <p className="text-gray-600 text-sm mb-4">
              Optionally provide a reason for rejecting this request. The user will see this message.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason (optional)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRejectingId(null);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={actionLoading === rejectingId}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading === rejectingId ? 'Processing...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
