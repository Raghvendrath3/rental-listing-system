'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';
import { formatDate } from '@/utils/format';
import type { User, ApiResponse, Role } from '@/types';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Search, Users, AlertTriangle, User as UserIcon, Shield, Home } from 'lucide-react';

async function fetchUsers() {
  const response = await api.get<ApiResponse<User[]>>('/admin/admin');
  return response.data.data;
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');

  const { data: users = [], isLoading, isError, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchUsers,
  });

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Count by role
  const userCount = users.filter((u) => u.role === 'user').length;
  const ownerCount = users.filter((u) => u.role === 'owner').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  const roleBadge = (role: Role) => {
    switch (role) {
      case 'admin':
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-700">
            <Shield className="mr-1 h-3 w-3" />
            Admin
          </Badge>
        );
      case 'owner':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-700">
            <Home className="mr-1 h-3 w-3" />
            Owner
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-secondary text-secondary-foreground">
            <UserIcon className="mr-1 h-3 w-3" />
            User
          </Badge>
        );
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
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="bg-card p-6 border border-border/70 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">User Accounts</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Audit and manage all registered accounts on the platform
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-lift border border-border/80 bg-card shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-sm font-bold text-muted-foreground">Total Accounts</CardDescription>
            <div className="rounded-full p-2 bg-secondary text-primary">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold tracking-tight text-foreground">{users.length}</p>
          </CardContent>
        </Card>
        <Card className="hover-lift border border-border/80 bg-card shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-sm font-bold text-muted-foreground">Regular Tenants</CardDescription>
            <div className="rounded-full p-2 bg-secondary text-primary">
              <UserIcon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold tracking-tight text-foreground">{userCount}</p>
          </CardContent>
        </Card>
        <Card className="hover-lift border border-border/80 bg-card shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-sm font-bold text-muted-foreground">Property Owners</CardDescription>
            <div className="rounded-full p-2 bg-blue-50 text-blue-600">
              <Home className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold tracking-tight text-blue-600">{ownerCount}</p>
          </CardContent>
        </Card>
        <Card className="hover-lift border border-border/80 bg-card shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-sm font-bold text-muted-foreground">Administrators</CardDescription>
            <div className="rounded-full p-2 bg-purple-50 text-purple-600">
              <Shield className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold tracking-tight text-purple-600">{adminCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search accounts by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12 text-[16px] rounded-lg border-input px-3 bg-card focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as Role | 'all')}>
          <SelectTrigger className="w-full sm:w-48 h-12 text-[16px] rounded-lg border-input px-3 bg-card focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">User / Tenant</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <Card className="p-12 text-center border border-border bg-card shadow-sm rounded-xl">
          <CardContent className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
              <Users className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold">No users found</h3>
            <p className="text-[16px] text-muted-foreground max-w-sm mx-auto">
              We couldn't find any user accounts matching your criteria. Try adjusting your filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-secondary/35 border-b border-border/40">
              <TableRow>
                <TableHead className="font-bold text-foreground py-4">Account ID</TableHead>
                <TableHead className="font-bold text-foreground py-4">Email Address</TableHead>
                <TableHead className="font-bold text-foreground py-4">Role Badge</TableHead>
                <TableHead className="font-bold text-foreground py-4">Joined Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-secondary/15 transition-colors border-b border-border/30">
                  <TableCell className="font-bold text-primary py-4">#{user.id}</TableCell>
                  <TableCell className="font-medium text-foreground py-4 select-all">{user.email}</TableCell>
                  <TableCell className="py-4">{roleBadge(user.role)}</TableCell>
                  <TableCell className="text-muted-foreground font-medium py-4">
                    {formatDate(user.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-center text-sm font-semibold text-muted-foreground bg-secondary/20 py-2.5 rounded-lg border border-border/30">
        Showing {filteredUsers.length} of {users.length} registered accounts
      </p>
    </div>
  );
}
