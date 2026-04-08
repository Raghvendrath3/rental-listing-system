export type UserRole = 'user' | 'owner' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile extends User {
  phone?: string;
  address?: string;
  city?: string;
  bio?: string;
  avatar?: string;
}

export interface UserStats {
  totalUsers: number;
  newUsersThisMonth: number;
}

export interface UpdateUserPayload {
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  bio?: string;
  avatar?: string;
}

export interface AdminUserManagement {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  listingsCount?: number;
  lastLoginAt?: string;
}
