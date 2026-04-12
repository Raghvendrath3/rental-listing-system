# RentalHub Design System

A refined monochromatic minimalism design system featuring strict color controls, thoughtful typography, and refined interactions built with CSS variables and Phantom-UI skeleton loaders.

## Design Philosophy

- **Tone:** Sophisticated, calm, purposeful
- **Color:** Strict monochromatic palette (Ink)
- **Typography:** DM Sans + DM Serif Display with modular 1.25x scale
- **Spacing:** 4px base unit grid system
- **Depth:** No box shadows — use color contrast and borders only
- **Motion:** Intentional animations respecting prefers-reduced-motion

## Color System

### Monochromatic Ink Palette

```css
--color-950: #0a0a0a;   /* Near-black, backgrounds */
--color-900: #111111;   /* Very dark surfaces */
--color-800: #1c1c1c;   /* Dark interactive elements */
--color-700: #2e2e2e;   /* Interactive, hover states */
--color-600: #404040;   /* Muted elements */
--color-500: #5c5c5c;   /* Muted text, secondary */
--color-300: #a3a3a3;   /* Secondary text, borders */
--color-100: #e8e8e8;   /* Light borders */
--color-050: #f5f5f5;   /* Light backgrounds */
--color-000: #ffffff;   /* Pure white surfaces */
```

### Semantic Colors (Used Sparingly)

- `--color-error: #dc2626` — Error states
- `--color-success: #16a34a` — Success states
- `--color-warning: #d97706` — Warning states
- `--color-info: #0284c7` — Information states

## Typography

### Font Stack

- **Headings:** DM Serif Display (serif, distinctive)
- **Body & UI:** DM Sans (sans-serif, modern)
- **Code/Data:** IBM Plex Mono (monospace, precise)

### Scale (1.25 Modular)

```css
--text-xs: 0.64rem;     /* 10px — labels, captions */
--text-sm: 0.8rem;      /* 13px — secondary info */
--text-base: 1rem;      /* 16px — body text */
--text-lg: 1.25rem;     /* 20px — subheadings */
--text-xl: 1.563rem;    /* 25px — headings */
--text-2xl: 1.953rem;   /* 31px — section headings */
--text-3xl: 2.441rem;   /* 39px — page titles */
```

### Line Height & Spacing

```css
--leading-tight: 1.1;    /* Headings */
--leading-normal: 1.5;   /* Body */
--leading-relaxed: 1.6;  /* Text blocks */
--leading-loose: 1.8;    /* Articles */

--tracking-tight: -0.02em;   /* Headings */
--tracking-normal: 0em;      /* Body */
--tracking-wide: 0.01em;     /* ALL CAPS labels */
--tracking-wider: 0.05em;    /* Emphasis */
```

## Spacing Scale

All spacing uses 4px base unit multiples:

```css
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-6: 24px
--space-8: 32px
--space-12: 48px
--space-16: 64px
--space-20: 80px
--space-24: 96px
```

## Border Radius

Only three values allowed:

```css
--radius-sm: 6px      /* Buttons, inputs, small cards */
--radius-lg: 12px     /* Cards, modals, panels */
--radius-full: 999px  /* Pills, avatars, circles */
```

## Animations & Transitions

### Easing Functions

```css
--ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);     /* Entering */
--ease-in: cubic-bezier(0.4, 0.0, 1, 1);        /* Leaving */
--ease-inout: cubic-bezier(0.4, 0.0, 0.2, 1);   /* State change */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* Playful */
```

### Duration Scale

```css
--dur-fast: 100ms;    /* Hover color changes */
--dur-base: 200ms;    /* Clicks, focus */
--dur-slow: 350ms;    /* Modals, transitions */
--dur-slower: 600ms;  /* Page load reveals */
```

### Transitions

```css
--transition-fast: opacity var(--dur-fast) var(--ease-out);
--transition-base: opacity var(--dur-base) var(--ease-out);
--transition-slow: opacity var(--dur-slow) var(--ease-out);
--transition-color: color var(--dur-base) var(--ease-inout);
--transition-bg: background-color var(--dur-base) var(--ease-inout);
--transition-border: border-color var(--dur-base) var(--ease-inout);
--transition-transform: transform var(--dur-base) var(--ease-out);
```

## Components

### Buttons

```tsx
// Primary (most common CTA)
<button className="btn btn-primary">Submit</button>

// Secondary (less emphasis)
<button className="btn btn-secondary">Cancel</button>

// Ghost (minimal, hover reveals background)
<button className="btn btn-ghost">Learn More</button>

// Danger (destructive actions)
<button className="btn btn-danger">Delete</button>
```

**Button Specifications:**
- Minimum height: 44px (touch target)
- Padding: horizontal 16px
- Radius: 6px
- All caps labels with letter-spacing: 0.05em
- NO box shadows — use border + background contrast
- Hover: color shift ±2 steps in lightness
- Active: subtle scale(0.98) animation

### Input Fields

```tsx
<div className="input-wrapper">
  <input className="input" placeholder="Enter text..." />
</div>
```

**Input Specifications:**
- Minimum height: 44px
- Border: 1px solid var(--color-300)
- Focus: border jumps to --color-700, NO glow
- Error state: border-color → --color-error
- Radius: 6px
- Padding: 12px 16px

### Cards

```tsx
<div className="card">
  <h2>Card Title</h2>
  <p>Card content</p>
</div>
```

**Card Specifications:**
- Background: var(--color-000)
- Border: 1px solid var(--color-100)
- Radius: 12px
- Padding: 24px
- Hover: border-color → --color-300, translateY(-2px)
- NO drop shadows

### Badges

```tsx
{/* Filled badge for status "active" */}
<span className="badge badge-filled">Active</span>

{/* Outlined badge for neutral status */}
<span className="badge badge-outlined">Pending</span>

{/* Semantic badges */}
<span className="badge badge-success">Approved</span>
<span className="badge badge-error">Rejected</span>
```

### Tables

```tsx
<table className="table">
  <thead>
    <tr>
      <th>Column</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data</td>
    </tr>
  </tbody>
</table>
```

**Table Specifications:**
- Zebra striping: alternate --color-000 / --color-050
- Row hover: --color-100 background
- Dividers: 1px --color-100, inset 16px
- No full-width borders

### Alerts

```tsx
<div className="alert alert-info">
  This is an informational message.
</div>

<div className="alert alert-success">Saved successfully!</div>
<div className="alert alert-warning">Please review...</div>
<div className="alert alert-error">An error occurred.</div>
```

## Skeleton Loaders (Phantom-UI)

Replace all spinners and loading indicators with Phantom-UI skeleton placeholders that mirror the exact shape and dimensions of real content.

### Basic Skeleton

```tsx
import { PhantomSkeleton } from '@/components/common/SkeletonLoader';

<PhantomSkeleton width="100%" height="20px" radius="6px" />
```

### Listing Card Skeleton

```tsx
import { ListingCardSkeleton } from '@/components/common/SkeletonLoader';

<ListingCardSkeleton />
```

### Table Row Skeleton

```tsx
import { TableRowSkeleton } from '@/components/common/SkeletonLoader';

{isLoading && <TableRowSkeleton />}
{!isLoading && <TableRow data={data} />}
```

### Profile Page Skeleton

```tsx
import { ProfilePageSkeleton } from '@/components/common/SkeletonLoader';

<ProfilePageSkeleton />
```

### Stats Card Skeleton

```tsx
import { StatsCardSkeleton } from '@/components/common/SkeletonLoader';

<StatsCardSkeleton />
```

### Loading State Wrapper

```tsx
import { LoadingState } from '@/components/common/SkeletonLoader';

<LoadingState
  isLoading={loading}
  skeleton={<ListingCardSkeleton />}
>
  <ListingCard data={listing} />
</LoadingState>
```

## Design Rules — Non-Negotiable

✓ **Every radius** uses one of: 6px, 12px, 999px — nothing else
✓ **Every shadow** is banned — depth via color contrast only
✓ **Icon style** — one library only, consistent weight
✓ **Transitions** — always use CSS variable tokens
✓ **Font sizes** — ONLY from the modular scale
✓ **Spacing** — ONLY 4px base unit multiples
✓ **No inline styles** — everything in CSS variables or classes
✓ **Color values** — via CSS variables only, never hardcoded hex

✗ Never use multiple font families (max 2)
✗ Never use gradients (unless explicitly required)
✗ Never use rounded corners > 16px except pills/avatars
✗ Never animate layout properties (width, height, margin, padding)
✗ Never show skeleton + real content simultaneously
✗ Never use skeleton for <300ms load times

## Accessibility

- **WCAG AA minimum contrast** (4.5:1) for all body text
- **Keyboard navigation** with visible focus states (2px border, offset 3px)
- **Reduced motion** support — animations freeze, skeletons remain visible
- **Touch targets** minimum 44px height
- **Color not alone** — don't use color as sole indicator (pairs with text, icons)

## Responsive Design

Use Tailwind's responsive prefixes:

```tsx
<div className="p-4 md:p-6 lg:p-8">
  Responsive padding
</div>
```

Key breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Implementation Checklist

- [ ] All colors use CSS variables from design-tokens.css
- [ ] Typography uses DM Sans/DM Serif/IBM Plex Mono
- [ ] Spacing uses 4px grid multiples
- [ ] Border radius uses only 6px/12px/999px
- [ ] Buttons have min 44px height and proper padding
- [ ] Cards use border for elevation, never shadows
- [ ] All transitions use duration/easing tokens
- [ ] Skeleton loaders replace all loading spinners
- [ ] Focus states are visible and use 2px border
- [ ] prefers-reduced-motion is respected
- [ ] No hardcoded colors or px sizes in components
- [ ] Contrast ratios meet WCAG AA (4.5:1)

## File Structure

```
frontend/
├── styles/
│   ├── design-tokens.css          # All CSS variables
│   └── components.css              # Component styles
├── components/
│   └── common/
│       └── SkeletonLoader.tsx      # Phantom-UI wrappers
├── app/
│   └── globals.css                # Imports design system
└── DESIGN_SYSTEM.md               # This file
```

## Resources

- **Phantom-UI:** https://unpkg.com/phantom-ui/dist/phantom.min.js
- **DM Font Family:** https://fonts.google.com/?query=DM
- **IBM Plex Mono:** https://fonts.google.com/?query=IBM+Plex+Mono
- **Color Theory:** 60-30-10 rule, WCAG contrast checker

---

**Last Updated:** April 2026  
**Version:** 1.0  
**Status:** Production Ready
