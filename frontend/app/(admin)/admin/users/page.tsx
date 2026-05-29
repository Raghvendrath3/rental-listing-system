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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground">
          View all users on the platform
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Users</CardDescription>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{users.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Regular Users</CardDescription>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{userCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Owners</CardDescription>
            <Home className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{ownerCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Admins</CardDescription>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{adminCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as Role | 'all')}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="rounded-lg border border-border bg-muted/50 p-8 text-center">
          <Users className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">No users found</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">#{user.id}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{roleBadge(user.role)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(user.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Showing {filteredUsers.length} of {users.length} users
      </p>
    </div>
  );
}
