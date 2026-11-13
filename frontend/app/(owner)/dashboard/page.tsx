'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api, { getErrorMessage } from '@/lib/api';
import { createListingSchema, updateListingSchema, type CreateListingFormData, type UpdateListingFormData } from '@/schemas/listing.schema';
import { LISTING_TYPES, LISTING_TYPE_LABELS } from '@/constants';
import { formatPrice, formatDate, capitalizeWords } from '@/utils/format';
import type { OwnerListingsResponse, Listing, ApiResponse, ListingType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Send, Archive, Home, MapPin, AlertTriangle, MessageSquare, Mail, User, Phone, FileText } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

async function fetchOwnerListings() {
  const response = await api.get<OwnerListingsResponse>('/owner/owner-listings');
  // Quirky nested response: data.data.result
  return response.data.data.result;
}

async function fetchOwnerInquiries() {
  const response = await fetch('/api/owner/inquiries', {
    method: 'GET',
    credentials: 'same-origin',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch inquiries');
  }
  const data = await response.json();
  return data.data;
}

async function createListing(data: CreateListingFormData) {
  // POST /owner/ requires body.payload structure
  const response = await api.post<ApiResponse<Listing>>('/owner/', { payload: data });
  return response.data.data;
}

async function updateListing({ id, data }: { id: number; data: UpdateListingFormData }) {
  // PATCH /owner/:id reads from body directly
  const response = await api.patch<ApiResponse<Listing>>(`/owner/${id}`, data);
  return response.data.data;
}

async function deleteListing(id: number) {
  const response = await api.delete<ApiResponse<Listing>>(`/owner/${id}`);
  return response.data.data;
}

async function publishListing(id: number) {
  const response = await api.patch<ApiResponse<Listing>>(`/owner/${id}/publish`);
  return response.data.data;
}

async function archiveListing(id: number) {
  const response = await api.patch<ApiResponse<Listing>>(`/owner/${id}/archive`);
  return response.data.data;
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'listings' | 'inquiries'>('listings');

  const { data: listings = [], isLoading, isError, error } = useQuery({
    queryKey: ['owner-listings'],
    queryFn: fetchOwnerListings,
  });

  const { data: inquiries = [], isLoading: isInquiriesLoading } = useQuery({
    queryKey: ['owner-inquiries'],
    queryFn: fetchOwnerInquiries,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createListing,
    onSuccess: () => {
      toast.success('Listing created successfully');
      queryClient.invalidateQueries({ queryKey: ['owner-listings'] });
      setIsCreateOpen(false);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: updateListing,
    onSuccess: () => {
      toast.success('Listing updated successfully');
      queryClient.invalidateQueries({ queryKey: ['owner-listings'] });
      setEditingListing(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteListing,
    onSuccess: () => {
      toast.success('Listing deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['owner-listings'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const publishMutation = useMutation({
    mutationFn: publishListing,
    onSuccess: () => {
      toast.success('Listing published successfully');
      queryClient.invalidateQueries({ queryKey: ['owner-listings'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const archiveMutation = useMutation({
    mutationFn: archiveListing,
    onSuccess: () => {
      toast.success('Listing archived successfully');
      queryClient.invalidateQueries({ queryKey: ['owner-listings'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // Filter listings by tab
  const filteredListings = listings.filter((listing) => {
    if (activeTab === 'all') return true;
    return listing.status === activeTab;
  });

  // Count by status
  const draftCount = listings.filter((l) => l.status === 'draft').length;
  const publishedCount = listings.filter((l) => l.status === 'published').length;
  const archivedCount = listings.filter((l) => l.status === 'archived').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
        <p className="mt-2 text-destructive">{getErrorMessage(error)}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  const InquiriesInbox = () => {
    if (inquiries.length === 0) {
      return (
        <Card className="p-12 text-center border border-border bg-card shadow-sm rounded-xl">
          <CardContent className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
              <MessageSquare className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold">No inquiries received yet</h3>
            <p className="text-[16px] text-muted-foreground max-w-sm mx-auto">
              Once tenants inquire about your published properties, their messages and contact details will appear here.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2">
        {inquiries.map((inquiry: any) => (
          <Card key={inquiry.id} className="flex flex-col justify-between hover-lift border border-border/80 bg-card shadow-md rounded-xl overflow-hidden">
            <div className="flex flex-col flex-grow">
              <CardHeader className="pb-3 bg-secondary/30 border-b border-border/50">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1.5">
                    <Badge variant="outline" className="text-xs font-bold bg-card border-primary/20 text-primary">
                      Property ID: #{inquiry.listing_id}
                    </Badge>
                    <CardTitle className="text-lg line-clamp-1 mt-1 font-bold text-foreground">
                      {capitalizeWords(inquiry.listing_title || 'Rental Property')}
                    </CardTitle>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap bg-card px-2.5 py-1 rounded-full border border-border/40">
                    {formatDate(inquiry.created_at)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-5 space-y-4 flex-grow">
                <p className="text-[16px] leading-relaxed text-foreground bg-secondary/20 p-4 rounded-xl border border-border/40 whitespace-pre-wrap min-h-[90px]">
                  &quot;{inquiry.message}&quot;
                </p>
                
                <div className="space-y-2.5 pt-3 text-sm border-t border-border/50">
                  <h4 className="font-bold text-muted-foreground uppercase tracking-wider text-[11px]">Tenant Contact Info</h4>
                  <div className="flex items-center gap-3">
                    <User className="h-4.5 w-4.5 text-primary shrink-0" />
                    <span className="font-bold text-[16px] text-foreground">{capitalizeWords(inquiry.tenant_name || 'Verified Tenant')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4.5 w-4.5 text-primary shrink-0" />
                    <span className="select-all text-[16px] text-foreground/90 font-medium">{inquiry.tenant_email || '-'}</span>
                  </div>
                  {inquiry.tenant_phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4.5 w-4.5 text-primary shrink-0" />
                      <span className="select-all text-[16px] text-foreground/90 font-medium">{inquiry.tenant_phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </div>
            <CardFooter className="border-t border-border/50 pt-4 pb-4 flex justify-end gap-3 bg-secondary/10">
              <Link href={`mailto:${inquiry.tenant_email}?subject=Inquiry regarding ${encodeURIComponent(inquiry.listing_title || '')}`} className="w-full sm:w-auto">
                <Button size="default" variant="outline" className="w-full h-11 text-sm font-bold flex items-center justify-center gap-2 border-border/85 bg-card hover:bg-secondary/50 rounded-lg">
                  <Mail className="h-4 w-4" />
                  Email Reply
                </Button>
              </Link>
              {inquiry.tenant_phone && (
                <Link href={`tel:${inquiry.tenant_phone}`} className="w-full sm:w-auto">
                  <Button size="default" variant="outline" className="w-full h-11 text-sm font-bold flex items-center justify-center gap-2 border-border/85 bg-card hover:bg-secondary/50 rounded-lg">
                    <Phone className="h-4 w-4" />
                    Call Tenant
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Top Level View Switcher */}
      <div className="flex border-b border-border/80 pb-2 gap-8">
        <button
          onClick={() => setViewMode('listings')}
          className={`pb-3 text-lg font-bold relative transition-colors duration-200 flex items-center gap-2 ${
            viewMode === 'listings'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Home className="h-5 w-5" />
          My Listings
        </button>
        <button
          onClick={() => setViewMode('inquiries')}
          className={`pb-3 text-lg font-bold relative transition-colors duration-200 flex items-center gap-2 ${
            viewMode === 'inquiries'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageSquare className="h-5 w-5" />
          Received Inquiries
          {inquiries.length > 0 && (
            <Badge className="ml-1 bg-accent text-accent-foreground font-bold px-2 py-0.5 text-xs rounded-full border-0">
              {inquiries.length}
            </Badge>
          )}
        </button>
      </div>

      {viewMode === 'listings' ? (
        <>
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-6 border border-border/70 rounded-xl shadow-sm">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Manage Listings</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Add, edit, publish, or archive your rental properties
              </p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="h-12 px-5 text-sm font-bold bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg shadow-sm border-0 flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  New Listing
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-card border border-border rounded-xl">
                <CreateListingForm
                  onSubmit={(data) => createMutation.mutate(data)}
                  isLoading={createMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-6 sm:grid-cols-3">
            <Card className="hover-lift border border-border/80 bg-card shadow-sm rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-sm font-bold text-muted-foreground">Draft Properties</CardDescription>
                <div className="rounded-full p-2 bg-secondary text-primary">
                  <FileText className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-4xl font-bold tracking-tight text-foreground">{draftCount}</CardTitle>
              </CardContent>
            </Card>
            <Card className="hover-lift border border-border/80 bg-card shadow-sm rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-sm font-bold text-muted-foreground">Published Properties</CardDescription>
                <div className="rounded-full p-2 bg-green-50 text-green-700">
                  <Send className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-4xl font-bold tracking-tight text-green-600">{publishedCount}</CardTitle>
              </CardContent>
            </Card>
            <Card className="hover-lift border border-border/80 bg-card shadow-sm rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-sm font-bold text-muted-foreground">Archived Properties</CardDescription>
                <div className="rounded-full p-2 bg-red-50 text-red-600">
                  <Archive className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-4xl font-bold tracking-tight text-muted-foreground">{archivedCount}</CardTitle>
              </CardContent>
            </Card>
          </div>

          {/* Listings */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
            <TabsList className="bg-secondary/60 p-1 rounded-xl h-auto flex flex-wrap sm:inline-flex border border-border/40">
              <TabsTrigger value="all" className="rounded-lg py-2.5 px-4 text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">All ({listings.length})</TabsTrigger>
              <TabsTrigger value="draft" className="rounded-lg py-2.5 px-4 text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">Draft ({draftCount})</TabsTrigger>
              <TabsTrigger value="published" className="rounded-lg py-2.5 px-4 text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">Published ({publishedCount})</TabsTrigger>
              <TabsTrigger value="archived" className="rounded-lg py-2.5 px-4 text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">Archived ({archivedCount})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0 focus-visible:outline-none">
              {filteredListings.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
                  <Home className="mx-auto h-14 w-14 text-muted-foreground" />
                  <h3 className="mt-4 text-xl font-bold">No properties found</h3>
                  <p className="mt-2 text-[16px] text-muted-foreground max-w-sm mx-auto">
                    {activeTab === 'all'
                      ? 'Create your first rental listing to start receiving tenant inquiries!'
                      : `You don't have any properties currently in ${activeTab} status.`}
                  </p>
                  {activeTab === 'all' && (
                    <Button className="mt-6 h-12 px-6 text-sm font-bold bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg shadow-sm border-0" onClick={() => setIsCreateOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Listing
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                  {filteredListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onEdit={() => setEditingListing(listing)}
                      onDelete={() => deleteMutation.mutate(listing.id)}
                      onPublish={() => publishMutation.mutate(listing.id)}
                      onArchive={() => archiveMutation.mutate(listing.id)}
                      isDeleting={deleteMutation.isPending}
                      isPublishing={publishMutation.isPending}
                      isArchiving={archiveMutation.isPending}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <>
          {/* Header */}
          <div className="bg-card p-6 border border-border/70 rounded-xl shadow-sm">
            <h1 className="text-2xl font-bold text-foreground">Inquiries Inbox</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Read and reply to inquiries sent by prospective tenants for your properties
            </p>
          </div>

          {isInquiriesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <InquiriesInbox />
          )}
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingListing} onOpenChange={(open) => !open && setEditingListing(null)}>
        <DialogContent className="sm:max-w-md bg-card border border-border rounded-xl">
          {editingListing && (
            <EditListingForm
              listing={editingListing}
              onSubmit={(data) => updateMutation.mutate({ id: editingListing.id, data })}
              isLoading={updateMutation.isPending}
              onCancel={() => setEditingListing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Create Listing Form Component
function CreateListingForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: CreateListingFormData) => void;
  isLoading: boolean;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateListingFormData>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      is_available: true,
    },
  });

  const selectedType = watch('type');

  return (
    <>
      <DialogHeader className="space-y-1.5 pb-2">
        <DialogTitle className="text-xl font-bold text-foreground">Create New Listing</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">Add a new property to your listings.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-bold text-foreground/85">Title</Label>
          <Input id="title" placeholder="e.g., Spacious 2BHK Apartment" className="h-12 text-[16px] rounded-lg border-input px-3 bg-card focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" {...register('title')} />
          {errors.title && <p className="text-sm text-destructive font-medium">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type" className="text-sm font-bold text-foreground/85">Property Type</Label>
          <Select value={selectedType} onValueChange={(v) => setValue('type', v as ListingType)}>
            <SelectTrigger id="type" className="h-12 text-[16px] rounded-lg border-input px-3 bg-card focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {LISTING_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {LISTING_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && <p className="text-sm text-destructive font-medium">{errors.type.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-bold text-foreground/85">City</Label>
            <Input id="city" placeholder="e.g., Bhopal" className="h-12 text-[16px] rounded-lg border-input px-3 bg-card focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" {...register('city')} />
            {errors.city && <p className="text-sm text-destructive font-medium">{errors.city.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="area" className="text-sm font-bold text-foreground/85">Area</Label>
            <Input id="area" placeholder="e.g., Arera Colony" className="h-12 text-[16px] rounded-lg border-input px-3 bg-card focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" {...register('area')} />
            {errors.area && <p className="text-sm text-destructive font-medium">{errors.area.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price" className="text-sm font-bold text-foreground/85">Monthly Rent (INR)</Label>
          <Input
            id="price"
            type="number"
            placeholder="e.g., 15000"
            className="h-12 text-[16px] rounded-lg border-input px-3 bg-card focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            {...register('price', { valueAsNumber: true })}
          />
          {errors.price && <p className="text-sm text-destructive font-medium">{errors.price.message}</p>}
        </div>

        <DialogFooter className="pt-2">
          <Button type="submit" className="w-full h-12 text-sm font-bold bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg shadow-sm border-0 mt-2" disabled={isLoading}>
            {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
            {isLoading ? 'Creating...' : 'Create Listing'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

// Edit Listing Form Component
function EditListingForm({
  listing,
  onSubmit,
  isLoading,
  onCancel,
}: {
  listing: Listing;
  onSubmit: (data: UpdateListingFormData) => void;
  isLoading: boolean;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateListingFormData>({
    resolver: zodResolver(updateListingSchema),
    defaultValues: {
      title: listing.title,
      type: listing.type,
      city: listing.city,
      area: listing.area,
      price: Number(listing.price),
      is_available: listing.is_available,
    },
  });

  const selectedType = watch('type');

  return (
    <>
      <DialogHeader className="space-y-1.5 pb-2">
        <DialogTitle className="text-xl font-bold text-foreground">Edit Listing</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">Update your property details.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-title" className="text-sm font-bold text-foreground/85">Title</Label>
          <Input id="edit-title" className="h-12 text-[16px] rounded-lg border-input px-3 bg-card focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" {...register('title')} />
          {errors.title && <p className="text-sm text-destructive font-medium">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-type" className="text-sm font-bold text-foreground/85">Property Type</Label>
          <Select value={selectedType} onValueChange={(v) => setValue('type', v as ListingType)}>
            <SelectTrigger id="edit-type" className="h-12 text-[16px] rounded-lg border-input px-3 bg-card focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LISTING_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {LISTING_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && <p className="text-sm text-destructive font-medium">{errors.type.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-city" className="text-sm font-bold text-foreground/85">City</Label>
            <Input id="edit-city" className="h-12 text-[16px] rounded-lg border-input px-3 bg-card focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" {...register('city')} />
            {errors.city && <p className="text-sm text-destructive font-medium">{errors.city.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-area" className="text-sm font-bold text-foreground/85">Area</Label>
            <Input id="edit-area" className="h-12 text-[16px] rounded-lg border-input px-3 bg-card focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" {...register('area')} />
            {errors.area && <p className="text-sm text-destructive font-medium">{errors.area.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-price" className="text-sm font-bold text-foreground/85">Monthly Rent (INR)</Label>
          <Input
            id="edit-price"
            type="number"
            className="h-12 text-[16px] rounded-lg border-input px-3 bg-card focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            {...register('price', { valueAsNumber: true })}
          />
          {errors.price && <p className="text-sm text-destructive font-medium">{errors.price.message}</p>}
        </div>

        <DialogFooter className="gap-3 pt-2">
          <Button type="button" variant="outline" className="h-12 px-5 text-sm font-semibold rounded-lg border-border bg-card hover:bg-secondary/40 text-foreground" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="h-12 px-5 text-sm font-bold bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg shadow-sm border-0" disabled={isLoading}>
            {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

// Listing Card Component
function ListingCard({
  listing,
  onEdit,
  onDelete,
  onPublish,
  onArchive,
  isDeleting,
  isPublishing,
  isArchiving,
}: {
  listing: Listing;
  onEdit: () => void;
  onDelete: () => void;
  onPublish: () => void;
  onArchive: () => void;
  isDeleting: boolean;
  isPublishing: boolean;
  isArchiving: boolean;
}) {
  const statusColors = {
    draft: 'bg-secondary text-secondary-foreground border-secondary-foreground/20',
    published: 'bg-green-50 text-green-700 border-green-200',
    archived: 'bg-red-50 text-red-600 border-red-200',
  };

  return (
    <Card className="hover-lift flex flex-col justify-between border border-border/80 bg-card shadow-md rounded-xl overflow-hidden">
      <div>
        <CardHeader className="pb-3 bg-secondary/10 border-b border-border/40">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold text-foreground line-clamp-1">{capitalizeWords(listing.title)}</CardTitle>
              <CardDescription className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                {capitalizeWords(listing.area)}, {capitalizeWords(listing.city)}
              </CardDescription>
            </div>
            <Badge variant="outline" className={`capitalize font-bold border ${statusColors[listing.status]}`}>{listing.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 pb-4 space-y-3">
          <div className="flex items-center justify-between text-sm py-1 border-b border-border/30">
            <span className="text-muted-foreground font-semibold">Type</span>
            <Badge variant="outline" className="font-bold border-primary/20 text-primary bg-primary/5">{LISTING_TYPE_LABELS[listing.type]}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm py-1 border-b border-border/30">
            <span className="text-muted-foreground font-semibold">Monthly Rent</span>
            <span className="font-bold text-[16px] text-primary">{formatPrice(listing.price)}/month</span>
          </div>
          {listing.published_at && (
            <div className="text-xs font-medium text-muted-foreground pt-1">
              Published: {formatDate(listing.published_at)}
            </div>
          )}
        </CardContent>
      </div>
      <CardFooter className="flex flex-wrap gap-2 border-t border-border/50 pt-4 pb-4 bg-secondary/10 justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9 text-xs font-bold bg-card border-border/80 hover:bg-secondary/40" onClick={onEdit}>
            <Edit className="mr-1 h-3.5 w-3.5 text-primary" />
            Edit
          </Button>

          {listing.status === 'draft' && (
            <Button
              variant="default"
              size="sm"
              className="h-9 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={onPublish}
              disabled={isPublishing}
            >
              {isPublishing ? <Spinner size="sm" className="mr-1" /> : <Send className="mr-1 h-3.5 w-3.5" />}
              Publish
            </Button>
          )}

          {listing.status === 'published' && (
            <Button
              variant="secondary"
              size="sm"
              className="h-9 text-xs font-bold bg-card border border-border/80 hover:bg-secondary/40 text-foreground"
              onClick={onArchive}
              disabled={isArchiving}
            >
              {isArchiving ? <Spinner size="sm" className="mr-1" /> : <Archive className="mr-1 h-3.5 w-3.5 text-primary" />}
              Archive
            </Button>
          )}
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="h-9 text-xs font-bold">
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card border border-border rounded-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-foreground">Delete Listing</AlertDialogTitle>
              <AlertDialogDescription className="text-[16px] text-muted-foreground">
                Are you sure you want to delete &quot;{capitalizeWords(listing.title)}&quot;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="h-11 font-semibold rounded-lg">Cancel</AlertDialogCancel>
              <AlertDialogAction className="h-11 font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg" onClick={onDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
