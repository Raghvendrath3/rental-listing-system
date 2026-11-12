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
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="bg-card p-6 border border-border/70 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Platform overview, metrics, and administrative control panel
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover-lift border border-border/80 bg-card shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-sm font-bold text-muted-foreground">{stat.title}</CardDescription>
              <div className={`rounded-full p-2.5 ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold tracking-tight text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="hover-lift border border-border/80 bg-card shadow-md rounded-xl overflow-hidden flex flex-col justify-between">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2.5 text-xl font-bold text-foreground">
              <ClipboardList className="h-5 w-5 text-primary" />
              Owner Requests
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              Review, approve, or reject property owner applications from verified hosts.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button asChild className="w-full h-12 text-sm font-bold bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg shadow-sm border-0">
              <Link href="/admin/requests">Manage Requests</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-lift border border-border/80 bg-card shadow-md rounded-xl overflow-hidden flex flex-col justify-between">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2.5 text-xl font-bold text-foreground">
              <UserCog className="h-5 w-5 text-primary" />
              User Management
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              View and audit all registered accounts, tenants, owners, and administrators.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button asChild className="w-full h-12 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm border-0">
              <Link href="/admin/users">View Users</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
