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
import { logoutUser } from '@/lib/services';

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

  const handleLogoutAndRelogin = async () => {
    try {
      await logoutUser();
    } finally {
      logout();
    router.push('/login');
    }
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
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="bg-card p-6 border border-border/70 rounded-xl shadow-sm max-w-md mx-auto">
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-center">Owner Status</h1>
        <p className="text-sm text-muted-foreground text-center mt-0.5">
          View the status of your property owner request
        </p>
      </div>

      <div className="mx-auto max-w-md">
        <Card className="border border-border/80 bg-card shadow-md rounded-xl p-1 overflow-hidden hover-lift">
          <CardHeader className="text-center pb-4">
            <StatusIcon />
            <CardTitle className="text-xl font-bold text-foreground">Owner Request Status</CardTitle>
            <CardDescription className="text-sm font-semibold text-muted-foreground mt-1">
              Your current role: <Badge variant="secondary" className="ml-1 capitalize font-bold bg-secondary/80 border-primary/20 text-primary">{userRole}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border/70 p-4 bg-secondary/15">
              <span className="text-[16px] font-bold text-foreground/80">Request Status</span>
              <Badge variant={statusBadgeVariant[status]} className="font-bold border px-3 py-1 text-xs">
                {statusLabels[status]}
              </Badge>
            </div>

            {statusData?.created_at && (
              <div className="flex items-center justify-between rounded-lg border border-border/70 p-4 bg-secondary/15">
                <span className="text-[16px] font-bold text-foreground/80">Submitted</span>
                <span className="text-[16px] font-semibold text-muted-foreground">
                  {formatRelativeTime(statusData.created_at)}
                </span>
              </div>
            )}

            {/* Special case: Approved but role not updated (stale JWT) */}
            {status === 'approved' && userRole === 'user' && (
              <Alert className="border-amber-200 bg-amber-50 text-amber-900 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                <div className="ml-2">
                  <AlertTitle className="font-bold text-amber-800 text-sm">Action Required</AlertTitle>
                  <AlertDescription className="text-xs font-semibold mt-0.5">
                    Your request was approved but your session needs to be refreshed. Please logout and login again to access owner features.
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {/* Already an owner */}
            {userRole === 'owner' && (
              <Alert className="border-green-200 bg-green-50 text-green-900 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                <div className="ml-2">
                  <AlertTitle className="font-bold text-green-800 text-sm">You&apos;re an Owner</AlertTitle>
                  <AlertDescription className="text-xs font-semibold mt-0.5">
                    You have full access to create and manage listings.
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-4 pb-4">
            {status === 'none' && (
              <Button className="w-full h-12 text-sm font-bold bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg shadow-sm border-0" onClick={() => router.push('/become-owner')}>
                <UserPlus className="mr-2 h-4 w-4" />
                Submit Owner Request
              </Button>
            )}

            {status === 'approved' && userRole === 'user' && (
              <Button className="w-full h-12 text-sm font-bold bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg shadow-sm border-0" onClick={handleLogoutAndRelogin}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout and Re-login
              </Button>
            )}

            {userRole === 'owner' && (
              <Button className="w-full h-12 text-sm font-bold bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg shadow-sm border-0" onClick={() => router.push('/dashboard')}>
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            )}

            <Button variant="outline" className="w-full h-12 text-sm font-semibold rounded-lg border-border bg-card hover:bg-secondary/40 text-foreground" onClick={() => router.push('/listings')}>
              Back to Listings
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
