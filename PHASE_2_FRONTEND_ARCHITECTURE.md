# Phase 2: Frontend Architecture Design
**Rental Listing System - Complete Frontend Specification**

---

## 1. Overview & Strategic Goals

### Project Objectives
- **Owner-focused mobile-first design**: Landlords manage properties on the go
- **Admin desktop-optimized**: Administrative power tools for listing management
- **User responsive experience**: Renters browse and filter properties seamlessly
- **Role-based rendering**: Different UIs for user/owner/admin roles
- **Type-safe development**: TypeScript for reliability and developer experience
- **Production-ready**: Proper error handling, loading states, authentication flow

### Technology Stack
```
Frontend Framework:  Next.js 16 (App Router, Server Components)
Language:           TypeScript
Styling:            Tailwind CSS v4
UI Components:      shadcn/ui (accessible, themeable)
State Management:   React Context + custom hooks + SWR
HTTP Client:        fetch API with custom wrapper
Authentication:     JWT (Bearer token in Authorization header)
Form Handling:      React Hook Form + Zod validation
Routing:            Next.js App Router with role-based guards
```

---

## 2. Folder Structure & Organization

```
rental-listing-system/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx                 # Root layout with auth provider
│   │   │   ├── page.tsx                   # Landing page / public listings
│   │   │   ├── (auth)/
│   │   │   │   ├── layout.tsx             # Auth pages layout
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx           # Login page
│   │   │   │   ├── register/
│   │   │   │   │   └── page.tsx           # Registration page
│   │   │   │   └── become-owner/
│   │   │   │       └── page.tsx           # Role upgrade page
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx             # Dashboard wrapper layout
│   │   │   │   ├── owner/
│   │   │   │   │   ├── layout.tsx         # Owner dashboard layout
│   │   │   │   │   ├── page.tsx           # Owner listings list
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx       # Create new listing
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── page.tsx       # View/edit listing
│   │   │   │   │   │   └── preview/
│   │   │   │   │   │       └── page.tsx   # Preview before publish
│   │   │   │   ├── admin/
│   │   │   │   │   ├── layout.tsx         # Admin dashboard layout
│   │   │   │   │   ├── page.tsx           # Admin listings table
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx       # Admin listing details
│   │   │   │   │   └── users/
│   │   │   │   │       └── page.tsx       # User management
│   │   │   │   └── profile/
│   │   │   │       └── page.tsx           # User profile settings
│   │   │   ├── listings/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx           # Public listing detail
│   │   │   ├── not-found.tsx              # 404 page
│   │   │   └── error.tsx                  # Error boundary
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   ├── BecomeOwnerButton.tsx
│   │   │   │   └── LogoutButton.tsx
│   │   │   ├── listings/
│   │   │   │   ├── ListingCard.tsx        # Reusable listing card
│   │   │   │   ├── ListingGrid.tsx        # Grid layout for listings
│   │   │   │   ├── ListingForm.tsx        # Create/edit form
│   │   │   │   ├── ListingFilters.tsx     # Search & filter bar
│   │   │   │   ├── ListingStatusBadge.tsx # Status indicator
│   │   │   │   └── ListingActions.tsx     # Publish/archive buttons
│   │   │   ├── dashboard/
│   │   │   │   ├── OwnerSidebar.tsx       # Owner nav
│   │   │   │   ├── AdminSidebar.tsx       # Admin nav
│   │   │   │   ├── StatsCard.tsx          # Dashboard metrics
│   │   │   │   └── DataTable.tsx          # Admin table component
│   │   │   ├── common/
│   │   │   │   ├── Header.tsx             # Top navigation
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── ErrorAlert.tsx
│   │   │   │   └── ConfirmDialog.tsx      # Confirm actions
│   │   │   └── providers/
│   │   │       ├── AuthProvider.tsx       # Auth context + JWT
│   │   │       └── QueryProvider.tsx      # SWR configuration
│   │   ├── hooks/
│   │   │   ├── useAuth.ts                 # Auth context hook
│   │   │   ├── useListings.ts             # SWR listings data
│   │   │   ├── useUser.ts                 # SWR user profile
│   │   │   ├── useApi.ts                  # API wrapper with auth
│   │   │   └── useDebounce.ts             # Search debouncing
│   │   ├── lib/
│   │   │   ├── api.ts                     # API client with auth
│   │   │   ├── auth.ts                    # Auth helpers
│   │   │   ├── validation.ts              # Zod schemas
│   │   │   ├── constants.ts               # Constants & config
│   │   │   └── utils.ts                   # Utility functions
│   │   ├── types/
│   │   │   ├── api.ts                     # API response types
│   │   │   ├── models.ts                  # Data models (User, Listing)
│   │   │   └── errors.ts                  # Error types
│   │   ├── styles/
│   │   │   └── globals.css                # Global styles + design tokens
│   │   └── middleware.ts                  # Auth guard middleware
│   ├── public/
│   │   ├── images/
│   │   └── icons/
│   ├── .env.local                         # Environment variables
│   ├── next.config.js                     # Next.js configuration
│   ├── tsconfig.json                      # TypeScript config
│   ├── tailwind.config.js                 # Tailwind CSS config
│   └── package.json
└── backend/
    └── ... (existing)
```

---

## 3. Data Models & TypeScript Interfaces

### User Model
```typescript
// types/models.ts
interface User {
  id: number
  email: string
  role: 'user' | 'owner' | 'admin'
  created_at: string
}

interface AuthToken {
  jwt: string       // JWT token
  userId: number
  role: 'user' | 'owner' | 'admin'
}
```

### Listing Model
```typescript
interface Listing {
  id: number
  title: string
  type: string
  city: string
  area: number
  price: number
  is_available: boolean
  status: 'draft' | 'published' | 'archived'
  owner_id: number
  created_at: string
  published_at: string | null
  archived_at: string | null
}

interface CreateListingPayload {
  title: string
  type: string
  city: string
  area: number
  price: number
  is_available?: boolean
}

interface ListingsFilter {
  q?: string          // Search query
  city?: string
  type?: string
  priceMin?: number
  priceMax?: number
  page?: number
  limit?: number
}
```

### API Response Types
```typescript
interface ApiResponse<T> {
  status: 'success' | 'error'
  data?: T
  message?: string
  meta?: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}
```

---

## 4. Authentication & Session Management

### Token Storage & Usage
```typescript
// lib/auth.ts
export function storeToken(token: AuthToken): void {
  // Store JWT in localStorage (or httpOnly cookie via backend)
  // Store userId and role in localStorage for quick access
  localStorage.setItem('auth_token', token.jwt)
  localStorage.setItem('auth_user_id', token.userId.toString())
  localStorage.setItem('auth_role', token.role)
}

export function getToken(): AuthToken | null {
  // Retrieve from localStorage
  const jwt = localStorage.getItem('auth_token')
  const userId = localStorage.getItem('auth_user_id')
  const role = localStorage.getItem('auth_role')
  
  if (jwt && userId && role) {
    return { jwt, userId: parseInt(userId), role: role as any }
  }
  return null
}

export function clearToken(): void {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user_id')
  localStorage.removeItem('auth_role')
}
```

### Auth Context
```typescript
// components/providers/AuthProvider.tsx
interface AuthContextType {
  user: User | null
  token: AuthToken | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  becomeOwner: () => Promise<void>
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<AuthToken | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check localStorage on mount
  useEffect(() => {
    const storedToken = getToken()
    if (storedToken) {
      setToken(storedToken)
      // Optional: validate token with backend
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await api.post('/users/login', { email, password })
    const { token: tokenString } = response.data
    const [jwt, userId, role] = tokenString.split('|')
    const authToken = { jwt, userId: parseInt(userId), role }
    
    storeToken(authToken)
    setToken(authToken)
  }

  // ... other methods
}
```

### Protected Routes Middleware
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/listings/:path*']
}
```

---

## 5. API Integration Layer

### HTTP Client with Auth
```typescript
// lib/api.ts
import { getToken } from './auth'

class ApiClient {
  private baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = getToken()
    const headers = new Headers(options.headers)
    
    // Add JWT to Authorization header
    if (token) {
      headers.set('Authorization', `Bearer ${token.jwt}`)
    }
    headers.set('Content-Type', 'application/json')

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, clear and redirect to login
        clearToken()
        window.location.href = '/login'
      }
      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  post<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  patch<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const api = new ApiClient()
```

### Custom Data-Fetching Hooks with SWR
```typescript
// hooks/useListings.ts
import useSWR from 'swr'
import { api } from '@/lib/api'

export function useListings(filters?: ListingsFilter) {
  const queryString = new URLSearchParams()
  if (filters?.q) queryString.append('q', filters.q)
  if (filters?.city) queryString.append('city', filters.city)
  if (filters?.type) queryString.append('type', filters.type)
  if (filters?.priceMin) queryString.append('priceMin', filters.priceMin.toString())
  if (filters?.priceMax) queryString.append('priceMax', filters.priceMax.toString())
  queryString.append('page', (filters?.page || 1).toString())
  queryString.append('limit', (filters?.limit || 10).toString())

  const { data, error, isLoading, mutate } = useSWR(
    `/listings?${queryString.toString()}`,
    (url) => api.get<Listing[]>(url),
    { revalidateOnFocus: false }
  )

  return {
    listings: data?.data || [],
    meta: data?.meta,
    isLoading,
    isError: !!error,
    mutate, // For manual refresh after mutations
  }
}
```

---

## 6. Component Architecture

### Common Patterns

#### 1. Form Components (Login, Register, Listing Create/Edit)
```typescript
// components/auth/LoginForm.tsx
'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/lib/validation'

export function LoginForm() {
  const { login } = useAuth()
  const router = useRouter()
  const [error, setError] = useState('')
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: any) => {
    try {
      await login(data.email, data.password)
      router.push('/dashboard')
    } catch (err) {
      setError('Invalid email or password')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

#### 2. Data Display Components (Listing Cards, Tables)
```typescript
// components/listings/ListingCard.tsx
interface ListingCardProps {
  listing: Listing
  variant?: 'public' | 'owner-draft' | 'owner-published' | 'admin'
  onEdit?: () => void
  onDelete?: () => void
  onPublish?: () => void
}

export function ListingCard({ listing, variant = 'public', onEdit, onDelete, onPublish }: ListingCardProps) {
  return (
    <div className="card border rounded-lg p-4">
      <h3>{listing.title}</h3>
      <p>{listing.city} • {listing.type}</p>
      <p className="text-lg font-bold">${listing.price}</p>
      
      {variant === 'owner-draft' && (
        <div className="actions">
          <button onClick={onEdit}>Edit</button>
          <button onClick={onPublish}>Publish</button>
          <button onClick={onDelete}>Delete</button>
        </div>
      )}
    </div>
  )
}
```

#### 3. Layout Components (Sidebars, Headers)
```typescript
// components/dashboard/OwnerSidebar.tsx
'use client'

export function OwnerSidebar() {
  return (
    <aside className="sidebar">
      <nav>
        <Link href="/dashboard/owner">My Listings</Link>
        <Link href="/dashboard/owner/new">New Listing</Link>
        <Link href="/dashboard/profile">Profile</Link>
      </nav>
    </aside>
  )
}
```

---

## 7. Page Layout Strategy

### Public Pages (Mobile-First Responsive)
- **Landing Page** (`/`): Hero section, featured listings, CTA to browse
- **Listings Browse** (`/?filters`): Grid of published listings with filters
- **Listing Detail** (`/listings/[id]`): Full property details, contact form

### Auth Pages (Simple, Centered)
- **Login** (`/auth/login`): Email + password form
- **Register** (`/auth/register`): Email + password + confirm form
- **Become Owner** (`/auth/become-owner`): Upgrade prompt

### Dashboard Pages (Role-Based)

#### Owner Dashboard (Mobile-first)
- **Listings List** (`/dashboard/owner`): List/grid view of own listings with status badges
- **Create Listing** (`/dashboard/owner/new`): Form to create new (draft) listing
- **Edit Listing** (`/dashboard/owner/[id]`): Edit form for draft listings
- **Preview** (`/dashboard/owner/[id]/preview`): Preview before publishing
- **Profile** (`/dashboard/profile`): Account settings, email change

#### Admin Dashboard (Desktop-optimized)
- **All Listings** (`/dashboard/admin`): Data table with sorting, pagination, bulk actions
- **Listing Details** (`/dashboard/admin/[id]`): Full details + override options
- **Users** (`/dashboard/admin/users`): User table with role management
- **Profile** (`/dashboard/profile`): Account settings

---

## 8. State Management Strategy

### Context + Hooks Pattern (Recommended)
1. **AuthContext**: Manages auth token, current user, login/logout
2. **SWR Hooks**: `useListings`, `useUser`, `useListingDetail`
3. **Local Component State**: Form state with React Hook Form

### Why This Approach
- ✅ Minimal boilerplate compared to Redux
- ✅ Built-in SWR features: caching, revalidation, deduplication
- ✅ Can combine with Context for global state
- ✅ No additional dependencies

---

## 9. Form Validation Strategy

### Zod Schemas (Type-safe)
```typescript
// lib/validation.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password too short'),
})

export const createListingSchema = z.object({
  title: z.string().min(5, 'Title too short'),
  type: z.string().min(1, 'Type required'),
  city: z.string().min(1, 'City required'),
  area: z.number().positive('Area must be positive'),
  price: z.number().positive('Price must be positive'),
  is_available: z.boolean().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type CreateListingInput = z.infer<typeof createListingSchema>
```

### Form Integration
```typescript
const form = useForm({
  resolver: zodResolver(createListingSchema),
})
```

---

## 10. Error Handling & User Feedback

### Error Boundary
```typescript
// app/error.tsx
'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="error-container">
      <h1>Something went wrong!</h1>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

### Error Alert Component
```typescript
// components/common/ErrorAlert.tsx
interface ErrorAlertProps {
  message: string
  onDismiss?: () => void
}

export function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
  return (
    <div className="alert alert-error">
      {message}
      {onDismiss && <button onClick={onDismiss}>Dismiss</button>}
    </div>
  )
}
```

### User Feedback Types
| Scenario | Implementation |
|----------|---|
| Loading data | `<LoadingSpinner />` |
| Empty state | `<EmptyState title="No listings yet" action={...} />` |
| API error | `<ErrorAlert message={error.message} />` |
| Form validation | React Hook Form + Zod inline errors |
| Success (mutation) | Toast notification (use shadcn/ui toast) |

---

## 11. Design System & Styling

### Color Palette (3-5 colors max)
```css
/* globals.css - Design tokens */
:root {
  --color-primary: #2563eb;      /* Blue - primary actions */
  --color-secondary: #64748b;    /* Slate - secondary actions */
  --color-success: #16a34a;      /* Green - publish, success */
  --color-warning: #ea580c;      /* Orange - archived, attention */
  --color-error: #dc2626;        /* Red - errors, deletion */
  --color-background: #ffffff;   /* White - backgrounds */
  --color-surface: #f8fafc;      /* Light slate - cards, sections */
  --color-border: #e2e8f0;       /* Light border */
  --color-text: #0f172a;         /* Dark - body text */
  --color-text-muted: #64748b;   /* Slate - secondary text */
}
```

### Typography
- **Headings**: "Inter" or system sans-serif (weights: 600, 700, 800)
- **Body**: "Inter" or system sans-serif (weights: 400, 500)
- **Mono**: System monospace for code (optional)

### Spacing Scale (Tailwind)
Use `gap-2`, `p-4`, `m-2` patterns (not arbitrary values).

### Responsive Breakpoints
- **Mobile-first**: Base styles for mobile
- **md (768px)**: Tablets
- **lg (1024px)**: Desktop
- **xl (1280px)**: Wide screens

### Accessibility
- ✅ WCAG 2.1 AA compliant
- ✅ Semantic HTML (button, form, nav)
- ✅ ARIA labels for interactive elements
- ✅ Color contrast ratios 4.5:1 for text
- ✅ Keyboard navigation support

---

## 12. Performance Optimizations

### Image Optimization
- Use `next/image` for automatic optimization
- Lazy load images below the fold

### Code Splitting
- Automatic with Next.js App Router
- Dynamic imports for heavy components

### Caching Strategy
```typescript
// SWR with 1-minute cache, revalidate on background
export function useListings(filters?: ListingsFilter) {
  return useSWR(
    [...],
    fetcher,
    {
      revalidateOnFocus: false,        // Don't revalidate on tab focus
      revalidateOnReconnect: true,     // Revalidate when connection restored
      dedupingInterval: 60000,         // Dedupe for 1 minute
    }
  )
}
```

---

## 13. Testing Strategy

### Unit Tests (Jest + React Testing Library)
```typescript
// components/auth/LoginForm.test.tsx
describe('LoginForm', () => {
  it('submits form with valid email and password', async () => {
    const { getByLabelText, getByRole } = render(<LoginForm />)
    fireEvent.change(getByLabelText(/email/i), { target: { value: 'test@test.com' } })
    fireEvent.change(getByLabelText(/password/i), { target: { value: 'password123' } })
    fireEvent.click(getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => expect(mockLogin).toHaveBeenCalled())
  })
})
```

### E2E Tests (Playwright)
```typescript
// e2e/auth.spec.ts
test('user can login and access dashboard', async ({ page }) => {
  await page.goto('http://localhost:3000/login')
  await page.fill('[name="email"]', 'owner@test.com')
  await page.fill('[name="password"]', 'Password123!')
  await page.click('button[type="submit"]')
  
  await page.waitForURL('**/dashboard/owner')
  expect(page.url()).toContain('/dashboard/owner')
})
```

---

## 14. Deployment & Environment Configuration

### Environment Variables
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000  # Backend URL (public)
NEXT_PUBLIC_APP_NAME=RentalListings        # App name for SEO
```

### Build & Deployment Checklist
- ✅ TypeScript strict mode enabled
- ✅ ESLint configured and passing
- ✅ Environment variables validated
- ✅ Images optimized
- ✅ Bundle size analyzed
- ✅ Performance metrics checked (Core Web Vitals)
- ✅ Security headers configured
- ✅ CORS policy validated with backend

### Vercel Deployment
```bash
# Connect GitHub repository
# Set environment variables in Vercel dashboard
# Deploy: git push to main branch
```

---

## 15. Development Workflow & Conventions

### Code Organization Principles
1. **One component per file** (except related sub-components)
2. **Hooks in separate `hooks/` folder**
3. **Types in `types/` folder**
4. **Utilities and helpers in `lib/` folder**
5. **Page components import and compose smaller components**

### Git & Branching
```bash
# Feature branches
git checkout -b feature/owner-listing-form
git push origin feature/owner-listing-form
# Create PR for review
```

### Commit Message Convention
```
feat: add login form component
fix: handle token expiration on API error
refactor: extract ListingCard from ListingsGrid
docs: update API integration guide
chore: update dependencies
```

---

## 16. Roadmap & Phase Timeline

### Phase 2: Setup (Week 1-2)
- [x] Create folder structure
- [ ] Setup Next.js project with TypeScript, Tailwind, shadcn/ui
- [ ] Create AuthContext + JWT auth flow
- [ ] Create API client with auto-auth header injection
- [ ] Setup SWR for data fetching

### Phase 3: Auth Pages (Week 2-3)
- [ ] Login page
- [ ] Register page
- [ ] Become Owner page
- [ ] Logout functionality
- [ ] Protected route guards

### Phase 4: Public Listings (Week 3-4)
- [ ] Browse listings with filters
- [ ] Listing detail view
- [ ] Search & filter component
- [ ] Pagination

### Phase 5: Owner Dashboard (Week 4-6)
- [ ] Listings list view
- [ ] Create listing form
- [ ] Edit listing form
- [ ] Preview before publish
- [ ] Publish/Archive actions

### Phase 6: Admin Dashboard (Week 6-7)
- [ ] Listings data table
- [ ] User management table
- [ ] Bulk actions
- [ ] Analytics/stats cards

### Phase 7: Polish & Optimization (Week 7-8)
- [ ] Error handling & edge cases
- [ ] Loading states across app
- [ ] Mobile responsiveness audit
- [ ] Performance optimization
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Unit & E2E testing

---

## 17. Architecture Decision Records (ADRs)

### ADR-001: Why SWR over Redux?
**Decision**: Use SWR for server state, Context for auth state.

**Rationale**:
- ✅ Less boilerplate than Redux
- ✅ Built-in caching, deduplication, revalidation
- ✅ Excellent DX with auto-refetch
- ✅ Smaller bundle size
- ⚠️ Limitations: Not suitable for complex cross-cutting state (but we don't need that)

### ADR-002: Why React Hook Form + Zod?
**Decision**: Use React Hook Form with Zod validation.

**Rationale**:
- ✅ Minimal re-renders with uncontrolled components
- ✅ Excellent TypeScript support with Zod
- ✅ Small bundle size
- ✅ Works well with shadcn/ui components

### ADR-003: Why Next.js App Router?
**Decision**: Use Next.js App Router (not Pages Router).

**Rationale**:
- ✅ Native support for Server Components (reduce JS)
- ✅ Built-in layouts for cleaner code
- ✅ Better route organization with dynamic segments
- ✅ Future-proof (Pages Router deprecated)

---

## 18. Success Metrics

### Functional Requirements
- [ ] User can register & login
- [ ] Owner can create, edit, publish, archive listings
- [ ] Admin can view/manage all listings
- [ ] User can browse & filter listings
- [ ] Proper error handling for all API failures
- [ ] 401 errors redirect to login

### Performance Metrics
- [ ] Lighthouse Score > 85
- [ ] Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] Initial page load < 3s

### User Experience
- [ ] Mobile experience is first-class (not just responsive)
- [ ] All forms have clear validation messages
- [ ] Loading states visible for all async operations
- [ ] Error messages are helpful (not generic "Error occurred")

---

## 19. Known Constraints & Workarounds

### Backend Issues
1. **Token format is non-standard**: Returns `JWT|userId|role` instead of JSON
   - **Workaround**: Parse with `.split('|')` in AuthProvider
   
2. **listings.service.js has bugs**: References undefined variables
   - **Workaround**: Frontend handles errors gracefully with try-catch
   
3. **Update listing endpoint**: Requires full re-publish (no draft editing)
   - **Design**: Don't allow editing published listings

### Frontend Constraints
1. **localStorage is domain-specific**: Tokens won't persist across subdomains
   - **Solution**: Use httpOnly cookies (backend coordination needed)
   
2. **CORS**: Depends on backend CORS headers
   - **Verify**: Test with actual backend before deployment

---

## 20. Next Steps

### Immediate Actions (Next Meeting)
1. ✅ Approve architecture and folder structure
2. ✅ Confirm design system colors and typography
3. ✅ Review component hierarchy and role-based routing
4. ✅ Identify any backend changes needed (e.g., token format fix)

### Phase 3: Implementation Kickoff
1. Create Next.js project with approved stack
2. Implement AuthProvider + JWT authentication
3. Build API client with auto-injection of auth headers
4. Create foundational components (Header, Footer, EmptyState, LoadingSpinner)
5. Build first feature: Login & Registration pages

---

**End of Phase 2 Frontend Architecture Document**

This document serves as the blueprint for Phase 3-7 implementation. All code should follow these patterns and conventions.
