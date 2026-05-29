'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';
import { formatRelativeTime } from '@/utils/format';
import type { OwnerRequest, ApiResponse } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, AlertTriangle, ClipboardList } from 'lucide-react';

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
        <div className="rounded-lg border border-border bg-muted/50 p-8 text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">No requests found</p>
        </div>
      );
    }

    return (
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              {showActions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">#{request.id}</TableCell>
                <TableCell>{request.email}</TableCell>
                <TableCell>{statusBadge(request.status)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatRelativeTime(request.created_at)}
                </TableCell>
                {showActions && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => approveMutation.mutate(request.id)}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                      >
                        {approveMutation.isPending ? (
                          <Spinner size="sm" className="mr-1" />
                        ) : (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        )}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectMutation.mutate(request.id)}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                      >
                        {rejectMutation.isPending ? (
                          <Spinner size="sm" className="mr-1" />
                        ) : (
                          <XCircle className="mr-1 h-3 w-3" />
                        )}
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Owner Requests</h1>
        <p className="text-sm text-muted-foreground">
          Review and manage owner applications
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Pending</CardDescription>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">{pendingRequests.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Approved</CardDescription>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{approvedRequests.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Rejected</CardDescription>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{rejectedRequests.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Requests Tabs */}
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedRequests.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedRequests.length})</TabsTrigger>
          <TabsTrigger value="all">All ({requests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <RequestTable items={pendingRequests} showActions />
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          <RequestTable items={approvedRequests} />
        </TabsContent>

        <TabsContent value="rejected" className="mt-4">
          <RequestTable items={rejectedRequests} />
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <RequestTable items={requests} showActions={false} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
