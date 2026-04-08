# RentalHub Performance Optimization Guide

## Target Metrics

### Lighthouse Scores
- Performance: >= 90
- Accessibility: >= 90
- Best Practices: >= 90
- SEO: >= 90

### Core Web Vitals
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 3.5s
- First Input Delay (FID): < 100ms

## Performance Checklist

### Build Optimization
- [ ] Source maps disabled in production: `productionBrowserSourceMaps: false`
- [ ] Compression enabled: `compress: true`
- [ ] React strict mode enabled: `reactStrictMode: true`
- [ ] Code minification enabled
- [ ] CSS minification enabled
- [ ] Tree-shaking enabled

### Image Optimization
- [ ] Use Next.js Image component
- [ ] Set explicit width and height
- [ ] Use modern formats (WebP, AVIF)
- [ ] Lazy load below-fold images
- [ ] Priority load above-fold images
- [ ] Optimize source images before uploading
- [ ] Use responsive image sizes

Example:
```tsx
import Image from 'next/image';

<Image
  src="/listing.jpg"
  alt="Property listing"
  width={400}
  height={300}
  priority={true} // For above-fold images
  placeholder="blur" // Use blur effect
/>
```

### Font Optimization
- [ ] Use system fonts when possible
- [ ] Minimize custom fonts
- [ ] Load fonts with `next/font`
- [ ] Use font-display: swap
- [ ] Preload critical fonts

Current fonts:
```tsx
import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({ subsets: ['latin'] });
const geistMono = Geist_Mono({ subsets: ['latin'] });
```

### CSS Optimization
- [ ] Use Tailwind CSS (already optimized)
- [ ] Remove unused CSS
- [ ] Minify CSS
- [ ] Critical CSS inlined
- [ ] Non-critical CSS deferred
- [ ] No inline styles
- [ ] Media queries for responsive

### JavaScript Optimization
- [ ] Code splitting enabled
- [ ] Dynamic imports for large components
- [ ] Tree-shaking enabled
- [ ] No unused dependencies
- [ ] Remove console.logs
- [ ] Minify JavaScript
- [ ] Defer non-critical scripts

### Caching Strategy
- [ ] Static pages cached long-term
- [ ] Dynamic pages with ISR
- [ ] API responses cached with SWR
- [ ] Service Worker (optional)
- [ ] Browser caching headers
- [ ] CDN caching enabled

### Network Optimization
- [ ] Compression (gzip, brotli)
- [ ] HTTP/2 enabled
- [ ] HTTPS enforced
- [ ] DNS prefetch
- [ ] Preconnect to APIs
- [ ] Resource hints

### Third-party Scripts
- [ ] Minimize third-party scripts
- [ ] Load asynchronously
- [ ] Use Web Workers if heavy
- [ ] Monitor performance impact
- [ ] Remove unused scripts

### Monitoring Performance

#### Lighthouse Audit
```bash
# Using Chrome DevTools
1. Open Chrome DevTools (F12)
2. Go to Lighthouse tab
3. Select categories to audit
4. Click "Analyze page load"
5. Review recommendations
```

#### Web Vitals Monitoring
```tsx
// In app/layout.tsx or _app.tsx
import { useReportWebVitals } from 'next/web-vitals';

export function reportWebVitals(metric) {
  console.log(metric);
  // Send to monitoring service
}
```

#### Performance API
```tsx
'use client';

useEffect(() => {
  const perfEntries = performance.getEntriesByType('navigation')[0];
  console.log('Page load time:', perfEntries.loadEventEnd - perfEntries.fetchStart);
}, []);
```

## Optimization Techniques

### Code Splitting
```tsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
const HeavyComponent = dynamic(
  () => import('@/components/Heavy'),
  { loading: () => <p>Loading...</p> }
);

export default function Page() {
  return <HeavyComponent />;
}
```

### Component Memoization
```tsx
'use client';

import { memo } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  return <div>{data}</div>;
});

export default ExpensiveComponent;
```

### React.lazy for Route Components
```tsx
import { lazy, Suspense } from 'react';

const AdminDashboard = lazy(() => import('./AdminDashboard'));

export default function App() {
  return (
    <Suspense fallback={<div>Loading admin...</div>}>
      <AdminDashboard />
    </Suspense>
  );
}
```

### Optimize Re-renders
```tsx
'use client';

import { useCallback, useMemo } from 'react';

export default function Component({ items }) {
  // Memoize expensive calculations
  const processedItems = useMemo(
    () => items.filter(item => item.active),
    [items]
  );

  // Stable callback reference
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);

  return <div>{processedItems.length}</div>;
}
```

### Virtualization for Lists
For long lists, consider react-window:

```tsx
import { FixedSizeList } from 'react-window';

export default function ListComponent({ items }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={35}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>{items[index].name}</div>
      )}
    </FixedSizeList>
  );
}
```

### Database Query Optimization
- Use pagination
- Select only needed fields
- Use indexes on frequently queried columns
- Cache results with SWR
- Batch related queries

### API Response Optimization
```tsx
// Good: Only return needed fields
GET /api/listings?fields=id,title,price

// Good: Use compression
Accept-Encoding: gzip, deflate, br

// Good: Use pagination
GET /api/listings?page=1&limit=20

// Good: Cache responses
GET /api/listings (cached for 5 minutes)
```

## Performance Best Practices

### Do's
- Use Next.js Image for all images
- Use Next.js Font for web fonts
- Lazy load images below the fold
- Use dynamic imports for heavy components
- Minify and compress all assets
- Use CDN for static content
- Cache aggressively when safe
- Monitor Web Vitals
- Use performance budgets
- Test on slow networks

### Don'ts
- Don't use inline styles
- Don't load all images at once
- Don't include source maps in production
- Don't use heavy external libraries
- Don't make unnecessary API calls
- Don't use render-blocking resources
- Don't load third-party scripts synchronously
- Don't store large data in localStorage
- Don't make synchronous requests
- Don't ignore performance warnings

## Testing Performance

### Local Testing
```bash
# Build and test locally
npm run build
npm run start

# Open Lighthouse in DevTools (F12)
# Run audit on http://localhost:3000
```

### Production Testing
1. Deploy to staging
2. Run Lighthouse audit on staging URL
3. Run on production after deployment
4. Monitor Core Web Vitals in production
5. Set up alerts for regressions

### Performance Budget
Set targets for:
- JavaScript bundle size < 200kb
- CSS bundle size < 50kb
- Total page load < 3 seconds
- Lighthouse score >= 90

## Monitoring Tools

### Built-in
- Chrome DevTools Lighthouse
- Chrome DevTools Performance
- Chrome User Experience Report

### Third-party (Optional)
- Sentry (error and performance monitoring)
- DataDog (infrastructure monitoring)
- New Relic (full-stack monitoring)
- SpeedCurve (performance tracking)

## Continuous Improvement

### Weekly
- Check Lighthouse score
- Review Core Web Vitals
- Monitor error rates

### Monthly
- Performance audit
- Dependency updates
- Bundle size analysis
- User experience review

### Quarterly
- Comprehensive performance review
- Update performance targets
- Plan optimization work
- Train team on best practices

## Common Performance Issues

### Issue: Slow First Contentful Paint (FCP)
**Solutions:**
- Reduce critical CSS
- Optimize main bundle
- Remove render-blocking resources
- Use preload for critical resources

### Issue: Slow Largest Contentful Paint (LCP)
**Solutions:**
- Optimize hero image
- Reduce JavaScript execution time
- Use dynamic imports
- Cache important data

### Issue: Layout Shift (CLS)
**Solutions:**
- Specify image dimensions
- Avoid inserting content above fold
- Use fixed heights for dynamic content
- Use CSS containment

### Issue: Slow API Responses
**Solutions:**
- Add database indexes
- Cache with SWR
- Use pagination
- Optimize database queries
- Add CDN caching

### Issue: Large Bundle Size
**Solutions:**
- Remove unused dependencies
- Use code splitting
- Use tree-shaking
- Lazy load routes
- Compress assets

## Performance Checklist Before Deployment

- [ ] Lighthouse score >= 90 (all categories)
- [ ] Build completes without warnings
- [ ] No TypeScript errors
- [ ] Linter passes
- [ ] No console errors
- [ ] Image optimization enabled
- [ ] Font optimization enabled
- [ ] CSS compression enabled
- [ ] JavaScript minification enabled
- [ ] Source maps disabled in production
- [ ] Browser caching configured
- [ ] Monitoring configured
- [ ] Performance budgets set
- [ ] Tests pass
- [ ] Mobile performance acceptable
- [ ] Network throttling test passed

## Resources

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Web Performance APIs](https://developer.mozilla.org/en-US/docs/Web/Performance)
