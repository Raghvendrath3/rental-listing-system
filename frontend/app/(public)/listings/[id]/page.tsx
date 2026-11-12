'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore, selectUserRole, selectUserId } from '@/stores/authStore';
import api, { getErrorMessage } from '@/lib/api';
import { formatPrice, capitalizeWords } from '@/utils/format';
import type { Listing, ApiResponse } from '@/types';
import { LISTING_TYPE_LABELS } from '@/constants';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { toast } from 'sonner';
import { ArrowLeft, MapPin, Home, User, Send, Info, CheckCircle2, Building2, Sparkles, BedDouble, Users as UsersIcon } from 'lucide-react';

async function fetchListingDetail(id: string) {
  const response = await api.get<ApiResponse<Listing>>(`/listings/${id}`);
  return response.data.data;
}

const ListingImagePlaceholder = ({ type }: { type: string }) => {
  const gradients = {
    apartment: 'from-teal-50 to-teal-100/60',
    house: 'from-amber-50 to-amber-100/60',
    room: 'from-blue-50 to-blue-100/60',
    pg: 'from-orange-50 to-orange-100/60',
    studio: 'from-indigo-50 to-indigo-100/60',
    villa: 'from-rose-50 to-rose-100/60',
  };
  
  const icons = {
    apartment: <Building2 className="h-12 w-12 text-primary/80" />,
    house: <Home className="h-12 w-12 text-primary/80" />,
    room: <BedDouble className="h-12 w-12 text-primary/80" />,
    pg: <UsersIcon className="h-12 w-12 text-primary/80" />,
    studio: <Sparkles className="h-12 w-12 text-primary/80" />,
    villa: <Building2 className="h-12 w-12 text-primary/80" />,
  };

  const gradient = gradients[type as keyof typeof gradients] || 'from-slate-50 to-slate-100/60';
  const icon = icons[type as keyof typeof icons] || <Home className="h-12 w-12 text-primary/80" />;

  return (
    <div className={`h-56 w-full bg-gradient-to-br ${gradient} flex items-center justify-center border-b border-border/50 relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(var(--foreground) 1px, transparent 0)', backgroundSize: '12px 12px' }} />
      {icon}
    </div>
  );
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;

  const userRole = useAuthStore(selectUserRole);
  const userId = useAuthStore(selectUserId);

  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch listing detail query
  const { data: listing, isLoading, isError, error } = useQuery({
    queryKey: ['listing-detail', listingId],
    queryFn: () => fetchListingDetail(listingId),
    enabled: !!listingId,
  });

  // Submit inquiry mutation
  const submitInquiryMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const token = useAuthStore.getState().token;
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          listing_id: Number(listingId),
          message: messageText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send inquiry');
      }
      return data;
    },
    onSuccess: () => {
      toast.success('Inquiry sent successfully!');
      setMessage('');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to send inquiry');
    },
  });

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Inquiry message cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitInquiryMutation.mutateAsync(message.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOwner = listing && listing.owner_id === userId;

  return (
    <ProtectedRoute allowedRoles={['user', 'owner', 'admin']}>
      <div className="space-y-6 animate-fade-up">
        {/* Back Button & Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/listings')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Listings
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <Card className="border-destructive/50 bg-destructive/10 rounded-xl">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <Info className="h-10 w-10 text-destructive mb-2" />
              <CardTitle className="text-destructive font-bold">Error Loading Listing</CardTitle>
              <CardDescription className="mt-1 text-destructive/80">
                {getErrorMessage(error)}
              </CardDescription>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push('/listings')}
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        ) : !listing ? (
          <Card className="rounded-xl">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <Home className="h-10 w-10 text-muted-foreground mb-2" />
              <CardTitle className="font-bold">Listing Not Found</CardTitle>
              <CardDescription className="mt-1">
                The requested property could not be found or is no longer available.
              </CardDescription>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push('/listings')}
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-3 items-start">
            {/* Listing details */}
            <div className="md:col-span-2 space-y-6">
              <Card className="overflow-hidden bg-card border border-border/80 shadow-sm rounded-xl">
                {/* Visual Image Header */}
                <ListingImagePlaceholder type={listing.type} />

                <div className="p-6 border-b border-border/50">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize px-2.5 py-0.5 font-semibold text-xs">
                          {LISTING_TYPE_LABELS[listing.type] || listing.type}
                        </Badge>
                        <Badge variant={listing.is_available ? 'default' : 'secondary'} className="px-2.5 py-0.5 font-semibold text-xs">
                          {listing.is_available ? 'Available' : 'Rented'}
                        </Badge>
                      </div>
                      <h1 className="text-3xl font-extrabold tracking-tight text-foreground mt-2">
                        {capitalizeWords(listing.title)}
                      </h1>
                    </div>
                    <div className="text-left md:text-right shrink-0">
                      <div className="text-3xl font-black text-primary">
                        {formatPrice(listing.price)}
                      </div>
                      <p className="text-xs text-muted-foreground font-semibold mt-0.5">per month</p>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 space-y-6">
                  {/* Location Info */}
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-[17px]">Location</h3>
                      <p className="text-muted-foreground text-sm font-medium mt-1">
                        {capitalizeWords(listing.area)}, {capitalizeWords(listing.city)}
                      </p>
                    </div>
                  </div>

                  <hr className="border-border/60" />

                  {/* Safe display Owner Info */}
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-[17px]">Listed By</h3>
                      <p className="text-foreground text-sm font-semibold mt-1">
                        {listing.owner_name ? capitalizeWords(listing.owner_name) : 'Verified Owner'}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium mt-1">
                        Member since {new Date(listing.published_at || Date.now()).getFullYear()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Inquiry Form Sidebar */}
            <div className="space-y-6">
              <Card className="bg-card border border-border/80 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <Send className="h-5 w-5 text-primary" />
                    Inquire Property
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Send a message to the owner of this property.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userRole !== 'user' ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 text-amber-800 text-sm">
                      <div className="flex gap-2">
                        <Info className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                        <div>
                          <p className="font-bold">Inquiries Restricted</p>
                          <p className="mt-1 text-xs text-amber-700 leading-relaxed font-medium">
                            Only standard users (tenants) can send inquiries. You are logged in with role:{' '}
                            <span className="font-bold capitalize">{userRole}</span>.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : isOwner ? (
                    <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 text-blue-800 text-sm">
                      <div className="flex gap-2">
                        <Info className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-bold">Your Property</p>
                          <p className="mt-1 text-xs text-blue-700 leading-relaxed font-medium">
                            You are the owner of this property listing. Owners cannot send inquiries on their own listings.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleInquirySubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-sm font-bold text-foreground">
                          Your Message
                        </Label>
                        <Textarea
                          id="message"
                          placeholder="Introduce yourself and specify when you'd like to visit or move in..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={6}
                          disabled={isSubmitting || !listing.is_available}
                          className="resize-none text-[16px] rounded-lg border-input px-3 py-2 bg-card text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        />
                        <p className="text-xs text-muted-foreground font-medium">
                          Explain your requirements or list questions you have for the owner.
                        </p>
                      </div>
                      <Button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-lg shadow-sm border-0"
                        disabled={isSubmitting || !listing.is_available}
                      >
                        {isSubmitting ? (
                          <Spinner size="sm" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                      </Button>
                      {!listing.is_available && (
                        <p className="text-xs text-center text-destructive font-medium mt-1">
                          Inquiries are closed for this property as it is currently rented/unavailable.
                        </p>
                      )}
                    </form>
                  )}
                </CardContent>
                {userRole === 'user' && !isOwner && (
                  <CardFooter className="border-t bg-muted/20 p-4 flex gap-2 text-xs text-muted-foreground font-medium">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                    <span>Your contact details (Full Name, Phone) will be shared with the owner upon inquiry.</span>
                  </CardFooter>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
