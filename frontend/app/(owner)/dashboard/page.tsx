'use client';

import { useState } from 'react';
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
import { Plus, Edit, Trash2, Send, Archive, Home, MapPin, AlertTriangle } from 'lucide-react';

async function fetchOwnerListings() {
  const response = await api.get<OwnerListingsResponse>('/owner/owner-listings');
  // Quirky nested response: data.data.result
  return response.data.data.result;
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

  const { data: listings = [], isLoading, isError, error } = useQuery({
    queryKey: ['owner-listings'],
    queryFn: fetchOwnerListings,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">My Listings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your rental properties
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Listing
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <CreateListingForm
              onSubmit={(data) => createMutation.mutate(data)}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Draft</CardDescription>
            <CardTitle className="text-3xl">{draftCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Published</CardDescription>
            <CardTitle className="text-3xl text-green-600">{publishedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Archived</CardDescription>
            <CardTitle className="text-3xl text-muted-foreground">{archivedCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Listings */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({listings.length})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({draftCount})</TabsTrigger>
          <TabsTrigger value="published">Published ({publishedCount})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({archivedCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredListings.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted/50 p-12 text-center">
              <Home className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No listings yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {activeTab === 'all'
                  ? 'Create your first listing to get started'
                  : `No ${activeTab} listings`}
              </p>
              {activeTab === 'all' && (
                <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Listing
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
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

      {/* Edit Dialog */}
      <Dialog open={!!editingListing} onOpenChange={(open) => !open && setEditingListing(null)}>
        <DialogContent className="sm:max-w-md">
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
      <DialogHeader>
        <DialogTitle>Create New Listing</DialogTitle>
        <DialogDescription>Add a new property to your listings.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" placeholder="e.g., Spacious 2BHK Apartment" {...register('title')} />
          {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Property Type</Label>
          <Select value={selectedType} onValueChange={(v) => setValue('type', v as ListingType)}>
            <SelectTrigger>
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
          {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" placeholder="e.g., Bhopal" {...register('city')} />
            {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="area">Area</Label>
            <Input id="area" placeholder="e.g., Arera Colony" {...register('area')} />
            {errors.area && <p className="text-sm text-destructive">{errors.area.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Monthly Rent (INR)</Label>
          <Input
            id="price"
            type="number"
            placeholder="e.g., 15000"
            {...register('price', { valueAsNumber: true })}
          />
          {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
        </div>

        <DialogFooter>
          <Button type="submit" disabled={isLoading}>
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
      <DialogHeader>
        <DialogTitle>Edit Listing</DialogTitle>
        <DialogDescription>Update your property details.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-title">Title</Label>
          <Input id="edit-title" {...register('title')} />
          {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-type">Property Type</Label>
          <Select value={selectedType} onValueChange={(v) => setValue('type', v as ListingType)}>
            <SelectTrigger>
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
          {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-city">City</Label>
            <Input id="edit-city" {...register('city')} />
            {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-area">Area</Label>
            <Input id="edit-area" {...register('area')} />
            {errors.area && <p className="text-sm text-destructive">{errors.area.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-price">Monthly Rent (INR)</Label>
          <Input
            id="edit-price"
            type="number"
            {...register('price', { valueAsNumber: true })}
          />
          {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
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
    draft: 'bg-secondary text-secondary-foreground',
    published: 'bg-green-100 text-green-700',
    archived: 'bg-red-100 text-red-600',
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg">{capitalizeWords(listing.title)}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {capitalizeWords(listing.area)}, {capitalizeWords(listing.city)}
            </CardDescription>
          </div>
          <Badge className={statusColors[listing.status]}>{listing.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">Type:</span>
          <Badge variant="outline">{LISTING_TYPE_LABELS[listing.type]}</Badge>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">Rent:</span>
          <span className="font-semibold text-primary">{formatPrice(listing.price)}/month</span>
        </div>
        {listing.published_at && (
          <div className="text-sm text-muted-foreground">
            Published: {formatDate(listing.published_at)}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 border-t pt-4">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="mr-1 h-3 w-3" />
          Edit
        </Button>

        {listing.status === 'draft' && (
          <Button
            variant="default"
            size="sm"
            onClick={onPublish}
            disabled={isPublishing}
          >
            {isPublishing ? <Spinner size="sm" className="mr-1" /> : <Send className="mr-1 h-3 w-3" />}
            Publish
          </Button>
        )}

        {listing.status === 'published' && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onArchive}
            disabled={isArchiving}
          >
            {isArchiving ? <Spinner size="sm" className="mr-1" /> : <Archive className="mr-1 h-3 w-3" />}
            Archive
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-1 h-3 w-3" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Listing</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{capitalizeWords(listing.title)}&quot;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
