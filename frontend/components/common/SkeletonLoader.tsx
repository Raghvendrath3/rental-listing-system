'use client';

import { useEffect, useRef } from 'react';

/**
 * Phantom-UI Skeleton Component
 * Wraps the phantom-ui web component for type safety and React integration
 * Usage: <PhantomSkeleton width="100%" height="20px" radius="6px" />
 */
export function PhantomSkeleton({
  width = '100%',
  height = '16px',
  radius = '6px',
}: {
  width?: string;
  height?: string;
  radius?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    // Phantom-UI loads as a web component from CDN
    // No additional setup needed - it reads CSS variables from :root
  }, []);

  return (
    <phantom-skeleton
      ref={ref}
      width={width}
      height={height}
      radius={radius}
      style={{
        display: 'block',
        marginBottom: '8px',
      }}
    />
  );
}

/**
 * Listing Card Skeleton
 * Matches the exact dimensions of a listing card for zero layout shift
 */
export function ListingCardSkeleton() {
  return (
    <div className="card" style={{ pointerEvents: 'none' }}>
      {/* Thumbnail */}
      <PhantomSkeleton width="100%" height="180px" radius="12px" />

      <div style={{ marginTop: '12px' }}>
        {/* Badge */}
        <PhantomSkeleton width="40%" height="12px" radius="999px" />

        {/* Title */}
        <div style={{ marginTop: '12px' }}>
          <PhantomSkeleton width="90%" height="18px" />
        </div>

        {/* Subtitle */}
        <div style={{ marginTop: '6px' }}>
          <PhantomSkeleton width="70%" height="14px" />
        </div>

        {/* Price */}
        <div style={{ marginTop: '12px' }}>
          <PhantomSkeleton width="30%" height="22px" />
        </div>

        {/* CTA Button */}
        <div style={{ marginTop: '12px' }}>
          <PhantomSkeleton width="100%" height="40px" radius="6px" />
        </div>
      </div>
    </div>
  );
}

/**
 * Table Row Skeleton
 * Matches table grid layout for consistent loading state
 */
export function TableRowSkeleton() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '36px 1fr 1fr 80px',
        gap: '16px',
        alignItems: 'center',
        padding: '16px',
        borderBottom: '1px solid var(--color-100)',
      }}
    >
      {/* Avatar */}
      <PhantomSkeleton width="36px" height="36px" radius="999px" />

      {/* Name */}
      <PhantomSkeleton width="100%" height="14px" />

      {/* Email */}
      <PhantomSkeleton width="100%" height="14px" />

      {/* Badge */}
      <PhantomSkeleton width="100%" height="22px" radius="999px" />
    </div>
  );
}

/**
 * Profile Page Skeleton
 * Loading state for user profile details
 */
export function ProfilePageSkeleton() {
  return (
    <div style={{ maxWidth: '600px' }}>
      {/* Avatar + Name + Role */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <PhantomSkeleton width="72px" height="72px" radius="999px" />
        <div style={{ marginTop: '16px' }}>
          <PhantomSkeleton width="200px" height="24px" />
        </div>
        <div style={{ marginTop: '8px' }}>
          <PhantomSkeleton width="80px" height="16px" radius="999px" />
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: '1px',
          backgroundColor: 'var(--color-100)',
          marginBottom: '24px',
        }}
      />

      {/* Form Fields */}
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr',
            gap: '16px',
            marginBottom: '24px',
            alignItems: 'center',
          }}
        >
          <PhantomSkeleton width="80px" height="14px" />
          <PhantomSkeleton width="100%" height="14px" />
        </div>
      ))}
    </div>
  );
}

/**
 * Stats Card Skeleton
 * Loading state for admin dashboard stats
 */
export function StatsCardSkeleton() {
  return (
    <div className="card">
      <PhantomSkeleton width="32px" height="32px" radius="6px" />
      <div style={{ marginTop: '12px' }}>
        <PhantomSkeleton width="50%" height="28px" />
      </div>
      <div style={{ marginTop: '8px' }}>
        <PhantomSkeleton width="70%" height="13px" />
      </div>
    </div>
  );
}

/**
 * Generic Loading Overlay
 * Conditionally displays skeleton or content with smooth transition
 */
export function LoadingState({
  isLoading,
  children,
  skeleton,
}: {
  isLoading: boolean;
  children: React.ReactNode;
  skeleton: React.ReactNode;
}) {
  return (
    <>
      <div className={`skeleton-wrapper ${!isLoading ? 'loaded' : ''}`}>
        {skeleton}
      </div>
      <div className={`content-wrapper ${isLoading ? '' : 'loaded'}`}>
        {children}
      </div>
    </>
  );
}

/**
 * Declare phantom-skeleton as a valid React element
 * This suppresses TypeScript warnings when using the web component
 */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'phantom-skeleton': {
        width?: string;
        height?: string;
        radius?: string;
        children?: React.ReactNode;
        style?: React.CSSProperties;
      };
    }
  }
}
