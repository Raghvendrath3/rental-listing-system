'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';
import { formatRelativeTime, capitalizeWords } from '@/utils/format';
import { LISTING_TYPE_LABELS } from '@/constants';
import type { OwnerRequest, ApiResponse, ListingType } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, AlertTriangle, ClipboardList, Mail, MapPin, Home, User } from 'lucide-react';

async function fetchOwnerRequests() {
  const response = await api.get<ApiResponse<OwnerRequest[]>>('/admin/requests');
  return response.data.data;
}

async function approveRequest(id: number) {
  const response = await api.patch<ApiResponse<OwnerRequest>>(`/admin/requests/${id}/approve`);
  return response.data.data;
}

async function rejectRequest(id: number) {
  const response = await api.patch<ApiResponse<OwnerRequest>>(`/admin/requests/${id}/reject`);
  return response.data.data;
}

export default function AdminRequestsPage() {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading, isError, error } = useQuery({
    queryKey: ['admin-requests'],
    queryFn: fetchOwnerRequests,
  });

  const approveMutation = useMutation({
    mutationFn: approveRequest,
    onSuccess: () => {
      toast.success('Request approved successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectRequest,
    onSuccess: () => {
      toast.success('Request rejected');
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const approvedRequests = requests.filter((r) => r.status === 'approved');
  const rejectedRequests = requests.filter((r) => r.status === 'rejected');

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

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-100 text-amber-700">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-700">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-600">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const RequestTable = ({ items, showActions = false }: { items: OwnerRequest[]; showActions?: boolean }) => {
    if (items.length === 0) {
      return (
        <Card className="p-12 text-center border border-border bg-card shadow-sm rounded-xl">
          <CardContent className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
              <ClipboardList className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold">No requests found</h3>
            <p className="text-[16px] text-muted-foreground max-w-sm mx-auto">
              There are currently no owner registration applications in this status filter.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {items.map((request) => (
          <Card key={request.id} className="hover-lift flex flex-col justify-between border border-border/80 bg-card shadow-md rounded-xl overflow-hidden">
            <div className="flex flex-col flex-grow">
              <CardHeader className="pb-3 bg-secondary/10 border-b border-border/40">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-bold bg-card border-primary/20 text-primary">
                        ID: #{request.id}
                      </Badge>
                      {statusBadge(request.status)}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-bold text-[16px] text-foreground select-all">{request.email}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 pb-4 space-y-3.5 flex-grow">
                <div className="grid grid-cols-2 gap-4 text-sm pb-2 border-b border-border/30">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Property Type</span>
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <Home className="h-4 w-4 text-primary" />
                      <span>
                        {request.property_type
                          ? (request.property_type in LISTING_TYPE_LABELS
                            ? LISTING_TYPE_LABELS[request.property_type as ListingType]
                            : capitalizeWords(request.property_type))
                          : '-'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Location</span>
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="truncate">{request.location ? capitalizeWords(request.location) : '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Reason for Request</span>
                  <p className="text-[16px] leading-relaxed text-foreground bg-secondary/20 p-3.5 rounded-lg border border-border/40 whitespace-pre-wrap min-h-[70px]">
                    &quot;{request.reason || 'No description provided.'}&quot;
                  </p>
                </div>
              </CardContent>
            </div>
            <CardFooter className="border-t border-border/50 pt-4 pb-4 flex flex-wrap justify-between items-center bg-secondary/10 gap-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>Submitted {formatRelativeTime(request.created_at)}</span>
              </div>
              {showActions && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="h-9 px-4 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1.5 rounded-lg border-0 shadow-sm"
                    onClick={() => approveMutation.mutate(request.id)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                  >
                    {approveMutation.isPending ? (
                      <Spinner size="sm" />
                    ) : (
                      <CheckCircle className="h-3.5 w-3.5" />
                    )}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-9 px-4 text-xs font-bold flex items-center gap-1.5 rounded-lg border-0 shadow-sm"
                    onClick={() => rejectMutation.mutate(request.id)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                  >
                    {rejectMutation.isPending ? (
                      <Spinner size="sm" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" />
                    )}
                    Reject
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="bg-card p-6 border border-border/70 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Owner Requests</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review and process owner registrations to grant listing access
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="hover-lift border border-border/80 bg-card shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-sm font-bold text-muted-foreground">Pending Review</CardDescription>
            <div className="rounded-full p-2 bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-amber-600">{pendingRequests.length}</p>
          </CardContent>
        </Card>
        <Card className="hover-lift border border-border/80 bg-card shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-sm font-bold text-muted-foreground">Approved Applications</CardDescription>
            <div className="rounded-full p-2 bg-green-50 text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">{approvedRequests.length}</p>
          </CardContent>
        </Card>
        <Card className="hover-lift border border-border/80 bg-card shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-sm font-bold text-muted-foreground">Rejected Applications</CardDescription>
            <div className="rounded-full p-2 bg-red-50 text-red-600">
              <XCircle className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-red-600">{rejectedRequests.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Requests Tabs */}
      <Tabs defaultValue="pending" className="w-full space-y-6">
        <TabsList className="bg-secondary/60 p-1 rounded-xl h-auto flex flex-wrap sm:inline-flex border border-border/40">
          <TabsTrigger value="pending" className="rounded-lg py-2.5 px-4 text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">Pending ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="approved" className="rounded-lg py-2.5 px-4 text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">Approved ({approvedRequests.length})</TabsTrigger>
          <TabsTrigger value="rejected" className="rounded-lg py-2.5 px-4 text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">Rejected ({rejectedRequests.length})</TabsTrigger>
          <TabsTrigger value="all" className="rounded-lg py-2.5 px-4 text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">All ({requests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-0 focus-visible:outline-none">
          <RequestTable items={pendingRequests} showActions />
        </TabsContent>

        <TabsContent value="approved" className="mt-0 focus-visible:outline-none">
          <RequestTable items={approvedRequests} />
        </TabsContent>

        <TabsContent value="rejected" className="mt-0 focus-visible:outline-none">
          <RequestTable items={rejectedRequests} />
        </TabsContent>

        <TabsContent value="all" className="mt-0 focus-visible:outline-none">
          <RequestTable items={requests} showActions={false} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
