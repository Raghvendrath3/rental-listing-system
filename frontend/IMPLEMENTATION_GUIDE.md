# Design System Implementation Guide

This guide shows how to apply the RentalHub design system to your existing components and pages.

## Quick Start

### 1. Update Your Component Imports

```tsx
// Add skeleton loader support
import { LoadingState, ListingCardSkeleton } from '@/components/common/SkeletonLoader';
```

### 2. Use CSS Variable Classes

All styling is now driven by CSS variables. Update your className attributes:

```tsx
// Before (hardcoded colors)
<button style={{ background: '#2e2e2e', color: '#fff' }}>
  Submit
</button>

// After (CSS variables)
<button className="btn btn-primary">
  Submit
</button>
```

### 3. Apply Skeleton Loaders

Replace all spinners and loaders with Phantom-UI skeletons:

```tsx
// Before (spinner)
{isLoading && <Spinner />}

// After (skeleton)
<LoadingState
  isLoading={isLoading}
  skeleton={<ListingCardSkeleton />}
>
  <ListingCard data={listing} />
</LoadingState>
```

## Component Migration Examples

### Listing Card Component

```tsx
'use client';

import { useState, useEffect } from 'react';
import { LoadingState, ListingCardSkeleton } from '@/components/common/SkeletonLoader';

interface Listing {
  id: number;
  title: string;
  price: number;
  city: string;
  type: string;
}

export function ListingCard({ listing }: { listing: Listing }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LoadingState
      isLoading={isLoading}
      skeleton={<ListingCardSkeleton />}
    >
      <article className="card">
        {/* Image Thumbnail */}
        <div
          className="w-full rounded-lg"
          style={{
            height: '180px',
            backgroundColor: 'var(--color-100)',
            backgroundSize: 'cover',
          }}
        />

        {/* Badge */}
        <span className="badge badge-filled" style={{ marginTop: 'var(--space-3)' }}>
          {listing.type}
        </span>

        {/* Title */}
        <h3
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 700,
            color: 'var(--color-700)',
            marginTop: 'var(--space-3)',
          }}
        >
          {listing.title}
        </h3>

        {/* Location */}
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-500)',
            marginTop: 'var(--space-2)',
          }}
        >
          {listing.city}
        </p>

        {/* Price */}
        <p
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 700,
            color: 'var(--color-700)',
            marginTop: 'var(--space-3)',
          }}
        >
          ${listing.price}/mo
        </p>

        {/* CTA Button */}
        <button className="btn btn-primary" style={{ marginTop: 'var(--space-3)' }}>
          View Details
        </button>
      </article>
    </LoadingState>
  );
}
```

### User Table Component

```tsx
'use client';

import { useEffect, useState } from 'react';
import { LoadingState, TableRowSkeleton } from '@/components/common/SkeletonLoader';

interface User {
  id: number;
  email: string;
  role: 'user' | 'owner' | 'admin';
}

export function UserTable({ users }: { users: User[] }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LoadingState
      isLoading={isLoading}
      skeleton={
        <>
          {[...Array(5)].map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </>
      }
    >
      <table className="table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>
                <span className="badge badge-filled">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </td>
              <td>Mar 10, 2026</td>
              <td>
                <button className="btn btn-secondary">Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </LoadingState>
  );
}
```

### Form Component

```tsx
'use client';

import { useState } from 'react';

export function ListingForm() {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError('Title is required');
      return;
    }
    // Submit logic here
    setSuccess(true);
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 'var(--max-width-narrow)' }}>
      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="alert alert-success">
          Listing created successfully!
        </div>
      )}

      {/* Form Field */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <label className="label">Listing Title</label>
        <div className="input-wrapper">
          <input
            className="input"
            type="text"
            placeholder="Modern 2-bedroom apartment..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>

      {/* Submit Button */}
      <button type="submit" className="btn btn-primary">
        Create Listing
      </button>
    </form>
  );
}
```

### Dashboard Stats Cards

```tsx
'use client';

import { useEffect, useState } from 'react';
import { LoadingState, StatsCardSkeleton } from '@/components/common/SkeletonLoader';

interface Stats {
  totalUsers: number;
  activeListings: number;
  pendingRequests: number;
}

export function AdminStats({ stats }: { stats: Stats }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 'var(--space-6)',
        marginBottom: 'var(--space-12)',
      }}
    >
      {/* Users Stat */}
      <LoadingState
        isLoading={isLoading}
        skeleton={<StatsCardSkeleton />}
      >
        <div className="card">
          <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>👥</div>
          <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>
            {stats.totalUsers}
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-500)' }}>
            Total Users
          </p>
        </div>
      </LoadingState>

      {/* Listings Stat */}
      <LoadingState
        isLoading={isLoading}
        skeleton={<StatsCardSkeleton />}
      >
        <div className="card">
          <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>🏠</div>
          <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>
            {stats.activeListings}
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-500)' }}>
            Active Listings
          </p>
        </div>
      </LoadingState>

      {/* Requests Stat */}
      <LoadingState
        isLoading={isLoading}
        skeleton={<StatsCardSkeleton />}
      >
        <div className="card">
          <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>📋</div>
          <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>
            {stats.pendingRequests}
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-500)' }}>
            Pending Requests
          </p>
        </div>
      </LoadingState>
    </div>
  );
}
```

## Common CSS Variable Usages

### Text Styling

```tsx
<h1 style={{
  fontSize: 'var(--text-3xl)',
  fontFamily: 'var(--font-serif)',
  fontWeight: 700,
  letterSpacing: 'var(--tracking-tight)',
  lineHeight: 'var(--leading-tight)',
  color: 'var(--color-700)',
}}>
  Page Title
</h1>

<p style={{
  fontSize: 'var(--text-base)',
  fontFamily: 'var(--font-sans)',
  lineHeight: 'var(--leading-relaxed)',
  color: 'var(--color-500)',
}}>
  Body text
</p>
```

### Spacing & Layout

```tsx
<div style={{
  padding: 'var(--space-6)',
  marginBottom: 'var(--space-8)',
  gap: 'var(--space-4)',
}}>
  Content
</div>
```

### Colors

```tsx
// Background
style={{ backgroundColor: 'var(--color-000)' }}

// Border
style={{ borderColor: 'var(--color-100)' }}

// Text
style={{ color: 'var(--color-700)' }}

// Hover effects
onMouseEnter={(e) => {
  e.currentTarget.style.backgroundColor = 'var(--color-050)';
  e.currentTarget.style.borderColor = 'var(--color-300)';
}}
```

### Transitions

```tsx
<button style={{
  transition: 'var(--transition-bg)',
  backgroundColor: 'var(--color-700)',
}}>
  Hover me
</button>
```

## Migration Checklist

- [ ] Import SkeletonLoader components where needed
- [ ] Replace all spinners with phantom-ui skeletons
- [ ] Update hardcoded colors to use CSS variables
- [ ] Update hardcoded font sizes to use typography scale
- [ ] Update hardcoded spacing to use space tokens
- [ ] Replace button styling with `.btn` classes
- [ ] Replace input styling with `.input-wrapper` classes
- [ ] Replace card styling with `.card` class
- [ ] Add focus states using outline token
- [ ] Test keyboard navigation and screen readers
- [ ] Verify WCAG AA contrast ratios
- [ ] Test prefers-reduced-motion support

## Testing

### Accessibility

```bash
# Test contrast ratios
# Use browser devtools accessibility panel

# Test keyboard navigation
# Tab through all interactive elements

# Test screen readers
# VoiceOver (macOS), NVDA (Windows), or JAWS
```

### Design System Compliance

1. **Colors:** All background/text colors use CSS variables
2. **Typography:** All font sizes from --text-xs to --text-3xl
3. **Spacing:** All margins/padding use 4px multiples
4. **Radius:** Only 6px, 12px, 999px
5. **Shadows:** None (depth via color)
6. **Animations:** All use --dur-* and --ease-* tokens
7. **Skeletons:** All loading states use phantom-ui

---

## Support

For questions or issues with the design system, refer to:
- `DESIGN_SYSTEM.md` — Complete design tokens reference
- `styles/design-tokens.css` — CSS variables definitions
- `styles/components.css` — Component class styles
- `components/common/SkeletonLoader.tsx` — Skeleton helpers

