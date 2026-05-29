'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore, selectUserRole } from '@/stores/authStore';
import api, { getErrorMessage } from '@/lib/api';
import { formatRelativeTime } from '@/utils/format';
import type { OwnerStatusResponse, ApiResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { Home, Clock, CheckCircle, XCircle, AlertTriangle, LogOut } from 'lucide-react';

async function fetchOwnerStatus() {
  const response = await api.get<OwnerStatusResponse>('/auth/owner-status');
  return response.data.data;
}

async function submitBecomeOwner() {
  const response = await api.post<ApiResponse<{ id: number; user_id: number; status: string; created_at: string }>>('/auth/become-owner');
  return response.data;
}

export default function BecomeOwnerPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userRole = useAuthStore(selectUserRole);
  const logout = useAuthStore((state) => state.logout);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: statusData, isLoading, isError, error } = useQuery({
    queryKey: ['owner-status'],
    queryFn: fetchOwnerStatus,
  });

  const submitMutation = useMutation({
    mutationFn: submitBecomeOwner,
    onSuccess: () => {
      toast.success('Owner request submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['owner-status'] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoutAndRelogin = () => {
    logout();
    router.push('/login');
  };

  // If user is already an owner, redirect to dashboard
  if (userRole === 'owner') {
    return (
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>You&apos;re Already an Owner</CardTitle>
            <CardDescription>
              You have owner privileges and can manage your listings.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => router.push('/dashboard')}>
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

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

  // Show different UI based on status
  const status = statusData?.status ?? 'none';

  // Handle "approved" but JWT still has "user" role (stale role edge case)
  if (status === 'approved' && userRole === 'user') {
    return (
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Request Approved!</CardTitle>
            <CardDescription>
              Your owner request has been approved. Please log out and log back in to access owner features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Action Required</AlertTitle>
              <AlertDescription>
                Your session needs to be refreshed to apply your new owner permissions.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="justify-center">
            <Button onClick={handleLogoutAndRelogin}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout and Re-login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <CardTitle>Request Pending</CardTitle>
            <CardDescription>
              Your owner request is being reviewed by an administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>Submitted {formatRelativeTime(statusData?.created_at ?? null)}</p>
            <p className="mt-2">You will be notified once your request is processed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Request Rejected</CardTitle>
            <CardDescription>
              Unfortunately, your owner request was not approved.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>If you believe this was a mistake, please contact support.</p>
          </CardContent>
          <CardFooter className="justify-center">
            <Button variant="outline" onClick={() => router.push('/listings')}>
              Back to Listings
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Default: no request yet
  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Home className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Become a Property Owner</CardTitle>
          <CardDescription>
            List your properties and reach potential tenants.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>As a property owner, you can:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Create and manage rental listings</li>
              <li>Publish properties for tenants to see</li>
              <li>Track your listing performance</li>
              <li>Archive listings when no longer available</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Spinner size="sm" className="mr-2" /> : null}
            {isSubmitting ? 'Submitting...' : 'Submit Owner Request'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
