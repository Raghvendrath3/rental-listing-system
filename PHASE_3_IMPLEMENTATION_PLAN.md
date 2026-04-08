# Phase 3: Authentication & Auth Pages Setup

## Current State Assessment

### What's Already Built ✅
1. **Frontend Structure**: Next.js 16 App Router setup with TypeScript
2. **Dependencies**: Zustand, Tailwind v4, IBM Plex Mono typography
3. **Auth Pages**: Login page (basic) + Register page with SignupForm
4. **Custom Styling**: Gold accent theme with dark background, grid background
5. **API Client**: Base `apiFetch()` function with error handling
6. **Hooks**: `useSignup` hook implemented with validation
7. **Components**: Form fields, password strength bar, signup success screen
8. **Types**: Auth types (SignupPayload, LoginResponse, etc.)

### Critical Gaps ⚠️
1. **JWT Token Management**: Token stored but NOT persisted to localStorage/cookies
2. **AuthContext**: Missing global auth state management
3. **Protected Routes**: No middleware or route guards
4. **Auth Persistence**: No token verification on app load
5. **Login Functionality**: Login page incomplete (no form state, no error handling)
6. **API Integration**: `apiFetch` doesn't inject Bearer token
7. **Role-based UI**: No conditional rendering based on user role
8. **Session Management**: No logout/session expiration handling

---

## Phase 3 Goals

### Primary Objectives
1. Implement JWT token storage & retrieval (localStorage + httpOnly cookie plan)
2. Create comprehensive AuthContext with token validation
3. Build complete login page with form state & error handling
4. Refactor API client to auto-inject Bearer tokens
5. Implement protected route middleware
6. Add role-based conditional UI rendering
7. Fix type mismatches in auth responses

### Success Criteria
- User can register → receive token → token persists
- User can login → token validated → redirected to appropriate dashboard
- Invalid token triggers logout & redirect to login
- Protected routes inaccessible without valid auth
- Type-safe across all auth operations
- Smooth UX with error feedback

---

## Implementation Breakdown

### Task 1: Fix Type System & API Client
**What**: Update auth types to match backend, enhance API client

**Files to modify**:
- `types/auth.types.ts` - Fix LoginResponse to include role + id
- `lib/api.ts` - Add token injection, handle 401 responses
- `lib/auth.ts` - Update API calls to return correct types

**Details**:
```typescript
// Backend returns: { token: "JWT|userId|role", user: { id, email } }
// Frontend needs to parse token format and extract userId + role
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export interface DecodedToken {
  userId: string;
  role: 'user' | 'owner' | 'admin';
  isValid: boolean;
}
```

---

### Task 2: Create AuthContext & Token Management
**What**: Build centralized auth state with token persistence

**Files to create**:
- `providers/AuthProvider.tsx` - Context provider wrapper
- `lib/tokenManager.ts` - Token parsing, storage, validation

**Files to modify**:
- `app/layout.tsx` - Wrap with AuthProvider
- `hooks/useAuth.ts` - Rewrite to use context

**Details**:
```typescript
// Token format from backend: "JWT|userId|role"
function parseToken(token: string): DecodedToken {
  const parts = token.split('|');
  return {
    jwt: parts[0],
    userId: parts[1],
    role: parts[2],
    isValid: true
  };
}

// Store in localStorage (or httpOnly cookie via API response header)
// On app load: validate token expiration, trigger re-login if expired
```

---

### Task 3: Implement Login Page
**What**: Complete login page with form state, validation, error handling

**Files to modify**:
- `app/auth/login/page.tsx` - Full implementation
- Create `components/forms/LoginForm.tsx` - Reusable form component

**Details**:
- Form state: email, password, loading, errors
- Validation: email format, password required
- API call: login() with error handling
- Success: store token → redirect to /dashboard
- Error: display user-friendly message

---

### Task 4: Enhance API Client with Auth Headers
**What**: Auto-inject Bearer token, handle 401 responses

**Files to modify**:
- `lib/api.ts` - Add auth header injection, 401 handling

**Details**:
```typescript
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  includeAuth = true
): Promise<T> {
  const headers = { ...options.headers };
  
  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  
  if (res.status === 401) {
    // Clear token, redirect to login
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  }
  
  // ... rest of error handling
}
```

---

### Task 5: Create Protected Route Middleware
**What**: Middleware to guard routes based on auth state

**Files to create**:
- `middleware.ts` - Route protection logic

**Details**:
- Public routes: `/`, `/auth/login`, `/auth/register`
- Protected routes: `/dashboard/*`, `/admin/*`
- Redirect unauthorized access to login
- Allow authenticated users to proceed

---

### Task 6: Implement Role-Based Redirects
**What**: After login, redirect to appropriate dashboard

**Files to modify**:
- `lib/auth.ts` - Add getRoleDashboard() function
- `app/auth/login/page.tsx` - Handle post-login redirect

**Details**:
```typescript
function getRoleDashboard(role: string): string {
  switch(role) {
    case 'owner': return '/dashboard/myListings';
    case 'admin': return '/dashboard/admin';
    default: return '/dashboard';
  }
}
```

---

### Task 7: Add Logout Functionality
**What**: Logout button, token cleanup, redirect

**Files to modify**:
- `components/Navbar.tsx` - Add logout button
- `lib/auth.ts` - Add logout() function
- `hooks/useAuth.ts` - Expose logout() method

**Details**:
- Clear token from storage
- Redirect to `/` or `/auth/login`
- Update auth state to logged-out

---

## Implementation Order

1. ✅ Task 1: Fix Type System & API Client (foundation)
2. ✅ Task 2: Create AuthContext & Token Management (state layer)
3. ✅ Task 3: Implement Login Page (UI)
4. ✅ Task 4: Enhance API Client with Auth Headers (integration)
5. ✅ Task 5: Create Protected Route Middleware (security)
6. ✅ Task 6: Implement Role-Based Redirects (UX)
7. ✅ Task 7: Add Logout Functionality (completeness)

---

## Known Issues to Address

### Backend Token Format
- Non-standard: `"JWT|userId|role"` (pipe-separated)
- Solution: Parse in `tokenManager.ts`, don't send to auth endpoints
- Impact: One-time parse on login, store parsed values in context

### Token Expiration
- Backend: 1-hour JWT expiration
- Solution: Check expiration on app load, auto-logout if expired
- Display: Show session expiring warning at 50 minutes

### CORS & httpOnly Cookies
- Current: Token in response body
- Better: Use httpOnly cookies for improved security
- Trade-off: Requires backend changes (out of scope for Phase 3)

---

## Testing Checklist

- [ ] Register new user → token stored
- [ ] Login with credentials → redirected to dashboard
- [ ] Invalid login → error message displayed
- [ ] Logout → token cleared → redirected to login
- [ ] Refresh page → auth state persists
- [ ] 401 response → auto-logout & redirect
- [ ] Protected route access → requires auth
- [ ] Role-based redirect works (user/owner/admin)
- [ ] Form validation works (email, password)
- [ ] Password show/hide toggle works
- [ ] Loading states display correctly
- [ ] Accessibility: keyboard navigation, screen readers

---

## Environment Variables Needed

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Next Steps After Phase 3

1. **Phase 4**: Build dashboard layouts & role-specific UIs
2. **Phase 5**: Implement listings browsing & search
3. **Phase 6**: Build owner listing management
4. **Phase 7**: Implement admin controls & moderation
5. **Phase 8**: Polish & optimization
