'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';
import type { AdminStats, ApiResponse } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Users, Home, FileText, Archive, Send, AlertTriangle, ClipboardList, UserCog } from 'lucide-react';

async function fetchAdminStats() {
  const response = await api.get<ApiResponse<AdminStats>>('/admin/stats');
  return response.data.data;
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchAdminStats,
  });

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

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Listings',
      value: stats?.totalListings ?? 0,
      icon: Home,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Published',
      value: stats?.publishedListings ?? 0,
      icon: Send,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Drafts',
      value: stats?.draftListings ?? 0,
      icon: FileText,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Archived',
      value: stats?.archivedListings ?? 0,
      icon: Archive,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Platform overview and statistics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>{stat.title}</CardDescription>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Owner Requests
            </CardTitle>
            <CardDescription>
              Review and manage owner applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/requests">Manage Requests</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              View all users on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/users">View Users</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
