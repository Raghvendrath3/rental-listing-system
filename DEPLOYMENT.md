# RentalHub Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Testing](#testing)
4. [Production Build](#production-build)
5. [Deploying to Vercel](#deploying-to-vercel)
6. [Environment Variables](#environment-variables)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Monitoring & Alerting](#monitoring--alerting)
9. [Rollback Procedures](#rollback-procedures)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- Node.js >= 18.0.0 (check with `node --version`)
- npm >= 9.0.0 or pnpm >= 8.0.0
- Git (for version control)
- A Vercel account (https://vercel.com)

### Verify Prerequisites
```bash
node --version    # Should be >= 18.0.0
npm --version     # Should be >= 9.0.0
git --version     # Should be available

# Or if using pnpm
pnpm --version    # Should be >= 8.0.0
```

### Backend Requirements
- Backend API running and accessible
- Database configured and migrated
- All required environment variables set on backend

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/Raghvendrath3/rental-listing-system.git
cd rental-listing-system/frontend
```

### 2. Install Dependencies
```bash
# Using npm
npm install

# Or using pnpm
pnpm install
```

### 3. Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your values
# Minimum required:
# NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 4. Start Development Server
```bash
npm run dev
# or
pnpm dev
```

The application will be available at `http://localhost:3000`

### 5. Verify Local Setup
- Navigate to http://localhost:3000
- Home page loads without errors
- Can navigate to login/register pages
- Navbar renders correctly

## Testing

### Run Lint Checks
```bash
npm run lint
# or
pnpm lint
```

### Build Locally
```bash
npm run build
# or
pnpm build
```

### Test Production Build Locally
```bash
npm run build
npm run start

# Application will run on http://localhost:3000
```

### Run API Integration Tests
Follow the procedures in [API_TESTING.md](./API_TESTING.md)

### Run Manual Testing
1. Complete all tests in [API_TESTING.md](./API_TESTING.md)
2. Test on multiple browsers (Chrome, Firefox, Safari, Edge)
3. Test on mobile devices (iOS and Android)
4. Verify all user roles work: user, owner, admin
5. Check console for errors: no errors should appear

## Production Build

### Build Optimization
```bash
# Build the application
npm run build

# This will:
# - Compile TypeScript
# - Optimize images
# - Minify CSS and JavaScript
# - Generate static pages where possible
# - Create production-ready bundle
```

### Build Output
```
.next/
├── server/       # Server-side code
├── static/       # Static assets
└── public/       # Public files
```

### Verify Build
```bash
# Check for build errors
npm run build

# Should complete with no errors
# Output should show "Successfully compiled"
```

## Deploying to Vercel

### Method 1: Using Vercel CLI (Recommended)

#### Install Vercel CLI
```bash
npm install -g vercel
```

#### Login to Vercel
```bash
vercel login
# Opens browser to authenticate
```

#### Deploy
```bash
cd /path/to/rental-listing-system/frontend

vercel deploy --prod
```

#### Configure Project
- Select "Yes" to link to existing Vercel project (if already created)
- Or create new project when prompted
- Set environment variables as needed

### Method 2: GitHub Integration

#### Connect GitHub Repository
1. Go to https://vercel.com
2. Click "New Project"
3. Select GitHub repository: `Raghvendrath3/rental-listing-system`
4. Select "frontend" folder as root directory
5. Configure environment variables (see Environment Variables section)
6. Click "Deploy"

#### Automatic Deployments
Once connected:
- Every push to `main` deploys to production
- Pull requests get preview deployments
- Deployments complete in 2-5 minutes

### Method 3: Manual GitHub Deployment

1. Push to GitHub
2. Go to Vercel dashboard
3. Click on project
4. Manual deployment section
5. Click "Deploy"

## Environment Variables

### Setting Environment Variables in Vercel

#### Via Vercel Dashboard
1. Go to Project Settings
2. Click "Environment Variables"
3. Add each variable:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://api.rentalhub.com`
   - Environments: Production, Preview, Development

#### Minimum Required Variables
```
NEXT_PUBLIC_API_URL=https://api.rentalhub.com
```

#### Optional Variables
```
NEXT_PUBLIC_SITE_URL=https://rentalhub.com
NEXT_PUBLIC_DEBUG=false
NEXT_PUBLIC_ENFORCE_HTTPS=true
NEXT_PUBLIC_GA_ID=UA-XXXXXXXXX-X
NEXT_PUBLIC_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```

### Environment Variable Safety
- Never commit `.env` files
- Never log environment variables
- Use `.env.example` as template
- Vercel dashboard is encrypted
- Access logs who accessed/changed vars

## Post-Deployment Verification

### 1. Check Deployment Status
```
Visit: https://vercel.com/dashboard
Look for: Deployment status "Ready"
```

### 2. Verify Home Page
- Navigate to https://rentalhub.com
- Page loads without errors
- All sections visible: hero, features, testimonials, FAQ
- No 404 or 500 errors

### 3. Verify Authentication
- Try login: /auth/login
- Try register: /auth/register
- Verify redirects work
- Check token storage in DevTools

### 4. Verify API Connectivity
- Open DevTools Network tab
- Log in
- Verify `/users/login` request succeeds
- Response includes token
- Status code is 200

### 5. Run Lighthouse
- Open Chrome DevTools
- Go to Lighthouse tab
- Run audit for: Performance, Accessibility, Best Practices, SEO
- Target scores:
  - Performance: >= 90
  - Accessibility: >= 90
  - Best Practices: >= 90
  - SEO: >= 90

### 6. Check Security Headers
- Use: https://securityheaders.com
- Paste URL: https://rentalhub.com
- Look for: A+ rating (all headers present)

### 7. Smoke Testing
Run tests from [API_TESTING.md](./API_TESTING.md) on production:
- [ ] User login works
- [ ] User dashboard displays listings
- [ ] Owner can create listing
- [ ] Admin dashboard loads
- [ ] Pagination works
- [ ] Filtering works
- [ ] Error messages display

### 8. Monitor Errors
- Check Sentry (if configured)
- Check Vercel logs: Project > Deployments > Logs
- No critical errors should appear
- Allow 5-10 minutes for initial traffic

## Monitoring & Alerting

### Vercel Monitoring
1. Go to Project Settings
2. Click "Monitoring"
3. Enable monitoring for:
   - Edge Middleware timing
   - Serverless Function execution
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)

### Log Monitoring
```bash
# View logs in real-time
vercel logs --prod

# Tail logs (watch new logs)
vercel logs --prod -f
```

### Performance Metrics
- Monitor via Vercel Analytics:
  - Project > Analytics
  - View Core Web Vitals
  - Check response times
  - Monitor error rates

### Error Tracking
1. Configure Sentry (optional but recommended):
   - Create account at https://sentry.io
   - Create project for Next.js
   - Get DSN
   - Set `NEXT_PUBLIC_SENTRY_DSN` in Vercel

2. Configure Datadog (optional):
   - Create Datadog account
   - Set up monitoring
   - Alert on error spikes

### Uptime Monitoring
Use third-party uptime monitors:
- UptimeRobot.com
- Pingdom
- StatusCake

Setup alerts for:
- Website down (non-200 status)
- Response time > 5 seconds
- SSL certificate issues

## Rollback Procedures

### Rollback via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select project
3. Go to "Deployments" tab
4. Find previous successful deployment
5. Click three dots (...)
6. Select "Promote to Production"
7. Confirm

Takes ~2 minutes to go live

### Rollback via CLI
```bash
vercel list --prod
# Find deployment ID to revert to

vercel promote <DEPLOYMENT_ID> --prod
# Promotes deployment to production
```

### Rollback via Git
```bash
# Revert last commit
git revert HEAD

# Push to main
git push origin main

# Vercel will automatically deploy the reverted code
```

### When to Rollback
- Critical bugs discovered in production
- Performance degradation
- Security vulnerability
- Data corruption
- API incompatibility

### Testing Rollback
1. Do NOT practice in production
2. Test in staging environment
3. Verify rollback process works
4. Document any issues

## Troubleshooting

### Build Failures

#### Error: Cannot find module
```
Solution:
- npm install
- pnpm install
- Delete .next folder
- Rebuild
```

#### Error: Environment variable missing
```
Solution:
- Check .env.local has all required variables
- Check Vercel dashboard has variables set
- Verify variable names match code
```

#### Error: Port 3000 already in use
```bash
# Kill process using port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### Runtime Errors

#### Token not found
```
Solution:
- Check localStorage in browser DevTools
- Verify login endpoint returns token
- Check token format: JWT|userId|role
- Check middleware not blocking auth routes
```

#### API 404 errors
```
Solution:
- Verify NEXT_PUBLIC_API_URL is correct
- Check backend is running
- Verify endpoint exists on backend
- Check network tab for actual request URL
```

#### CORS errors
```
Solution:
- Check backend CORS configuration
- Verify origin matches CORS whitelist
- Check preflight requests (OPTIONS)
- Verify Content-Type header correct
```

### Performance Issues

#### Slow page loads
```
Solution:
- Run Lighthouse
- Check Network tab
- Identify slow requests
- Check image sizes
- Enable caching headers
```

#### High memory usage
```
Solution:
- Check for memory leaks in components
- Use React DevTools Profiler
- Check for infinite loops
- Monitor Network requests
```

### Deployment Failures

#### Vercel deployment stuck
```
Solution:
- Check Vercel logs
- Verify build command succeeds locally
- Check environment variables
- Try canceling and redeploying
```

#### GitHub integration not working
```
Solution:
- Verify GitHub app installed
- Check repository permissions
- Reconnect GitHub account
- Check branch name (main vs master)
```

## Best Practices

### Pre-Deployment Checklist
- [ ] All tests pass locally
- [ ] No console errors or warnings
- [ ] Build succeeds: `npm run build`
- [ ] Environment variables set
- [ ] API backend is running
- [ ] Database is backed up
- [ ] Security audit complete
- [ ] Performance audit > 90
- [ ] Code review approved
- [ ] Deployment window scheduled

### Post-Deployment Checklist
- [ ] All smoke tests pass
- [ ] No errors in Sentry/logs
- [ ] Performance metrics acceptable
- [ ] Security headers present
- [ ] SSL certificate valid
- [ ] Email notifications working
- [ ] Backup created
- [ ] Team notified

### Continuous Deployment
1. Merge to main branch
2. Vercel automatically builds and tests
3. Deploy to preview first
4. Run tests on preview
5. Promote to production if all pass
6. Monitor for errors

## Support & Escalation

### Get Help
- Vercel Support: https://vercel.com/help
- Documentation: https://nextjs.org
- GitHub Issues: Report bugs and features

### Critical Issues
If production is down:
1. Check Vercel status page
2. Review recent deployments
3. Check error logs
4. Rollback if necessary
5. Notify team and users

### Feature Requests
- Create GitHub issue
- Tag with "enhancement"
- Include detailed description
- Reference related issues
