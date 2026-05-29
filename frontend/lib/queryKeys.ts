/**
 * Centralized query keys for TanStack Query.
 * Using a factory pattern ensures consistent keys across the app.
 */
export const queryKeys = {
  // Public listings
  listings: {
    all: ['listings'] as const,
    list: (filters: Record<string, unknown>) => ['listings', filters] as const,
  },
  
  // Owner-specific
  owner: {
    listings: ['owner-listings'] as const,
    status: ['owner-status'] as const,
  },
  
  // Admin-specific
  admin: {
    stats: ['admin-stats'] as const,
    requests: ['admin-requests'] as const,
    users: ['admin-users'] as const,
  },
} as const;
