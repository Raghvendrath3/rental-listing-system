# RentalHub Frontend - Development Guide

## Getting Started with Development

### Local Setup

1. Clone and install (see README.md)
2. Start dev server: `npm run dev`
3. Open http://localhost:3000

### Development Environment

- **Browser DevTools**: Open with F12
- **Network Tab**: Monitor API requests
- **Console**: Check for errors and warnings
- **React DevTools**: Install extension for component debugging

## Project Architecture

### Next.js App Router
- `app/` directory structure defines routes
- `layout.tsx` files create nested layouts
- `page.tsx` files define route pages
- `middleware.ts` runs on every request

### Authentication Flow
1. User submits login form
2. Frontend validates with Zod schema
3. API call to `/users/login`
4. Backend returns JWT token
5. Token stored in localStorage
6. Token injected in future API requests
7. 401 response triggers logout

### State Management
- **AuthContext**: Global authentication state
- **ToastContext**: Notification system
- **SWR**: Data fetching and caching
- **React Hook Form**: Form state

## Component Development

### Creating a New Component

1. Create file in appropriate directory
2. Write TypeScript with proper types
3. Use Tailwind CSS for styling
4. Export as default export
5. Add JSDoc comments

Example:

```tsx
// components/common/MyComponent.tsx
'use client';

import { FC, ReactNode } from 'react';

interface MyComponentProps {
  title: string;
  children?: ReactNode;
}

/**
 * MyComponent - Brief description
 * @param title - Component title
 * @param children - Child elements
 */
export const MyComponent: FC<MyComponentProps> = ({ title, children }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
};

export default MyComponent;
```

### Component Patterns

#### Client vs Server Components
- Server Components (default): Better performance, can access databases
- Client Components: Need `'use client'` directive for interactivity

```tsx
// Server Component (default)
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// Client Component
'use client';

import { useState } from 'react';

export default function Form() {
  const [value, setValue] = useState('');
  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
}
```

#### Hooks Usage
- Use React hooks (useState, useEffect, etc.)
- Use custom hooks from `hooks/` directory
- Always follow rules of hooks (no conditionals, no early returns)

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

export default function Component() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const handleLogout = () => {
    logout();
    showToast('success', 'Logged out successfully');
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

## Styling with Tailwind CSS

### Class Organization
```tsx
<div className="
  // Layout
  flex flex-col gap-4
  // Sizing
  p-4 w-full
  // Colors
  bg-white text-gray-900
  // Responsive
  md:flex-row lg:gap-6
  // Hover states
  hover:bg-gray-50 transition-colors
">
  Content
</div>
```

### Using Design Tokens
```tsx
// Good: Use semantic colors
<div className="bg-primary text-foreground">

// Avoid: Direct colors
<div className="bg-white text-black">

// Good: Use semantic spacing
<div className="p-4 gap-2">

// Avoid: Arbitrary values
<div className="p-[16px] gap-[8px]">
```

## Form Development

### Creating Forms

1. Use React Hook Form for state
2. Use Zod for validation
3. Use FormField component for consistency

```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validation';
import { login } from '@/lib/auth';
import FormField from '@/components/forms/FormField';
import { useToast } from '@/hooks/useToast';

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data);
      showToast('success', 'Logged in successfully');
    } catch (error) {
      showToast('error', 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        label="Email"
        error={errors.email?.message}
        {...register('email')}
      />
      <FormField
        label="Password"
        type="password"
        error={errors.password?.message}
        {...register('password')}
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white py-2 rounded hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
```

## API Integration

### Making API Calls

```tsx
'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { listings } from '@/lib/api';

export default function ListingsComponent() {
  // Using SWR for automatic caching and refetching
  const { data, error, isLoading } = useSWR(
    '/listings',
    () => listings({ page: 1, limit: 10 })
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading listings</div>;

  return (
    <div>
      {data?.data.map((listing) => (
        <div key={listing.id}>{listing.title}</div>
      ))}
    </div>
  );
}
```

### Error Handling

```tsx
import { getErrorMessage } from '@/lib/api';

try {
  await login(credentials);
} catch (error) {
  const message = getErrorMessage(error);
  showToast('error', message);
}
```

## Authentication

### Protected Routes

Wrap components with ProtectedRoute:

```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div>{children}</div>
    </ProtectedRoute>
  );
}
```

### Accessing User Info

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';

export default function Component() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return <div>Welcome, {user?.email}</div>;
}
```

## Notifications

### Using Toast

```tsx
'use client';

import { useToast } from '@/hooks/useToast';

export default function Component() {
  const { showToast } = useToast();

  return (
    <button
      onClick={() => showToast('success', 'Action completed!')}
    >
      Click me
    </button>
  );
}
```

Toast types: `success`, `error`, `warning`, `info`

## Debugging

### Debug Logging

Use console.log with [v0] prefix:

```tsx
console.log('[v0] Component mounted');
console.log('[v0] Data received:', data);
console.log('[v0] Error occurred:', error);
```

### React DevTools
- Install React DevTools extension
- View component tree
- Inspect props and state
- Profile performance

### Network Inspection
- Open DevTools Network tab
- Monitor API requests
- Check request/response headers
- Verify token in Authorization header

### Browser Console
- Check for TypeScript errors
- Look for console warnings
- Verify no security errors (CSP violations)

## Performance Tips

### Code Splitting
Use dynamic imports for large components:

```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/Heavy'));

export default function Page() {
  return <HeavyComponent />;
}
```

### Image Optimization
Always use Next.js Image component:

```tsx
import Image from 'next/image';

export default function Picture() {
  return (
    <Image
      src="/image.jpg"
      alt="Description"
      width={400}
      height={300}
      priority // Use only for above-fold images
    />
  );
}
```

### Memoization
Use memo for expensive components:

```tsx
import { memo } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  return <div>{data}</div>;
});

export default ExpensiveComponent;
```

## Testing Changes

### Manual Testing
1. Test in development mode
2. Test on multiple browsers
3. Test on mobile (use DevTools device emulation)
4. Test with and without network
5. Test with different user roles

### Testing Checklist
- All forms submit correctly
- API calls succeed
- Errors display properly
- Loading states work
- Navigation works
- Responsive design works
- No console errors

## Common Development Tasks

### Adding a New Page
1. Create route in `app/` directory
2. Create `page.tsx` file
3. Add layout if needed
4. Update navigation if necessary

### Adding a New Component
1. Create in `components/` directory
2. Use TypeScript with proper types
3. Export as default
4. Add to component library docs
5. Update imports in files using it

### Adding API Endpoint
1. Create function in `lib/api.ts`
2. Use `apiFetch` for token injection
3. Add error handling
4. Add TypeScript types
5. Update related components

### Updating Validation Schema
1. Edit schema in `lib/validation.ts`
2. Update form components using it
3. Test form validation
4. Check error messages display

## Git Workflow

### Branch Naming
```
feature/feature-name
bugfix/bug-name
refactor/change-description
```

### Commit Messages
```
Add feature description
Fix bug description
Update component name
```

### Pull Request Process
1. Create feature branch
2. Make changes
3. Run lint: `npm run lint`
4. Test thoroughly
5. Create PR with description
6. Address review comments
7. Merge when approved

## Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### TypeScript Errors
```bash
# Check all files
npx tsc --noEmit

# Fix errors before committing
```

### Port Already in Use
```bash
# Use different port
PORT=3001 npm run dev

# Or kill process on 3000
lsof -i :3000
kill -9 <PID>
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Zod Docs](https://zod.dev)
