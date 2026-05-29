'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore, selectUserRole } from '@/stores/authStore';
import api, { getErrorMessage } from '@/lib/api';
import { formatRelativeTime } from '@/utils/format';
import type { OwnerStatusResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Clock, CheckCircle, XCircle, AlertTriangle, Home, LogOut, UserPlus } from 'lucide-react';

async function fetchOwnerStatus() {
  const response = await api.get<OwnerStatusResponse>('/auth/owner-status');
  return response.data.data;
}

export default function OwnerStatusPage() {
  const router = useRouter();
  const userRole = useAuthStore(selectUserRole);
  const logout = useAuthStore((state) => state.logout);

  const { data: statusData, isLoading, isError, error } = useQuery({
    queryKey: ['owner-status'],
    queryFn: fetchOwnerStatus,
  });

  const handleLogoutAndRelogin = () => {
    logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-md">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{getErrorMessage(error)}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const status = statusData?.status ?? 'none';

  // Helper function for status icon
  const StatusIcon = () => {
    switch (status) {
      case 'pending':
        return (
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
        );
      case 'approved':
        return (
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        );
      case 'rejected':
        return (
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
        );
      default:
        return (
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <UserPlus className="h-6 w-6 text-muted-foreground" />
          </div>
        );
    }
  };

  const statusBadgeVariant = {
    none: 'secondary' as const,
    pending: 'outline' as const,
    approved: 'default' as const,
    rejected: 'destructive' as const,
  };

  const statusLabels = {
    none: 'No Request',
    pending: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Owner Status</h1>
        <p className="text-sm text-muted-foreground">
          View the status of your property owner request
        </p>
      </div>

      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader className="text-center">
            <StatusIcon />
            <CardTitle>Owner Request Status</CardTitle>
            <CardDescription>
              Your current role: <Badge variant="secondary" className="ml-1 capitalize">{userRole}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <span className="text-sm font-medium">Request Status</span>
              <Badge variant={statusBadgeVariant[status]}>
                {statusLabels[status]}
              </Badge>
            </div>

            {statusData?.created_at && (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <span className="text-sm font-medium">Submitted</span>
                <span className="text-sm text-muted-foreground">
                  {formatRelativeTime(statusData.created_at)}
                </span>
              </div>
            )}

            {/* Special case: Approved but role not updated (stale JWT) */}
            {status === 'approved' && userRole === 'user' && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Action Required</AlertTitle>
                <AlertDescription>
                  Your request was approved but your session needs to be refreshed. Please logout and login again to access owner features.
                </AlertDescription>
              </Alert>
            )}

            {/* Already an owner */}
            {userRole === 'owner' && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>You&apos;re an Owner</AlertTitle>
                <AlertDescription>
                  You have full access to create and manage listings.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            {status === 'none' && (
              <Button className="w-full" onClick={() => router.push('/become-owner')}>
                <UserPlus className="mr-2 h-4 w-4" />
                Submit Owner Request
              </Button>
            )}

            {status === 'approved' && userRole === 'user' && (
              <Button className="w-full" onClick={handleLogoutAndRelogin}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout and Re-login
              </Button>
            )}

            {userRole === 'owner' && (
              <Button className="w-full" onClick={() => router.push('/dashboard')}>
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            )}

            <Button variant="outline" className="w-full" onClick={() => router.push('/listings')}>
              Back to Listings
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
