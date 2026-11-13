'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore, selectUserRole } from '@/stores/authStore';
import api, { getErrorMessage } from '@/lib/api';
import { formatRelativeTime } from '@/utils/format';
import type { OwnerStatusResponse, ApiResponse } from '@/types';
import { LISTING_TYPES, LISTING_TYPE_LABELS } from '@/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Home, Clock, CheckCircle, XCircle, AlertTriangle, LogOut } from 'lucide-react';
import { logoutUser } from '@/lib/services';

async function fetchOwnerStatus() {
  const response = await api.get<OwnerStatusResponse>('/auth/owner-status');
  return response.data.data;
}

async function submitBecomeOwner(data: { property_type: string; location: string; reason: string }) {
  const response = await api.post<ApiResponse<{ id: number; user_id: number; status: string; created_at: string }>>('/auth/become-owner', data);
  return response.data;
}

export default function BecomeOwnerPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userRole = useAuthStore(selectUserRole);
  const logout = useAuthStore((state) => state.logout);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [propertyType, setPropertyType] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  const { data: statusData, isLoading, isError, error } = useQuery({
    queryKey: ['owner-status'],
    queryFn: fetchOwnerStatus,
  });

  const submitMutation = useMutation({
    mutationFn: (data: { property_type: string; location: string; reason: string }) => submitBecomeOwner(data),
    onSuccess: () => {
      toast.success('Owner request submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['owner-status'] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyType) {
      toast.error('Property type is required');
      return;
    }
    if (!location.trim()) {
      toast.error('Location is required');
      return;
    }
    if (!reason.trim()) {
      toast.error('Reason is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync({
        property_type: propertyType,
        location: location.trim(),
        reason: reason.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoutAndRelogin = async () => {
    try {
      await logoutUser();
    } finally {
      logout();
    router.push('/login');
    }
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
    <div className="mx-auto max-w-md animate-fade-up">
      <Card className="bg-card border border-border/80 shadow-md rounded-xl hover-lift p-2">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Home className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Become a Property Owner</CardTitle>
          <CardDescription className="text-sm">
            Apply to list your properties and manage tenant inquiries.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="property_type" className="text-sm font-bold text-foreground/80">Property Type</Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger id="property_type" className="h-12 text-[16px] rounded-lg border-input px-3 bg-card focus:visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  {LISTING_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {LISTING_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground font-medium">Select the main type of property you want to list.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-bold text-foreground/80">Location</Label>
              <Input
                id="location"
                placeholder="e.g. Mumbai, Maharashtra"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-12 text-[16px] rounded-lg border-input px-3 bg-card focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              />
              <p className="text-xs text-muted-foreground font-medium">Specify the city and area where your properties reside.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-bold text-foreground/80">Reason for Application</Label>
              <Textarea
                id="reason"
                placeholder="Explain why you want to list properties on RentalHub..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="text-[16px] rounded-lg border-input px-3 py-2 bg-card focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 resize-none"
              />
              <p className="text-xs text-muted-foreground font-medium">Describe your listing plans (e.g. rent out a personal home, manage multiple PG rentals).</p>
            </div>
          </CardContent>
          <CardFooter className="justify-center mt-2">
            <Button type="submit" className="w-full h-12 text-sm font-bold bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg shadow-sm border-0" disabled={isSubmitting}>
              {isSubmitting ? <Spinner size="sm" className="mr-2" /> : null}
              {isSubmitting ? 'Submitting request...' : 'Submit Application'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
