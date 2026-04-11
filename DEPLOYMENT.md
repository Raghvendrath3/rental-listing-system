# Deployment Guide

This guide covers deploying RentalHub to production.

## Prerequisites

- Node.js v18+
- Git and GitHub account
- Vercel account (for frontend)
- Backend hosting (Render, Railway, Heroku, or similar)
- Production PostgreSQL database
- Environment variables configured

## Frontend Deployment (Vercel)

### Option 1: Automatic Deployment via GitHub

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Select your GitHub repository
4. Set root directory to `frontend`
5. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = your backend URL
6. Click "Deploy"

Vercel will automatically deploy on every push to main branch.

### Option 2: Manual CLI Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from frontend directory
cd frontend
vercel deploy --prod
```

### Environment Variables (Vercel Dashboard)

1. Go to Project Settings > Environment Variables
2. Add for all environments (Production, Preview, Development):
   ```
   NEXT_PUBLIC_API_URL = https://api.rentalhub.com
   ```
3. Redeploy after adding variables

## Backend Deployment

### Option 1: Deploy to Render

1. Create account at https://render.com
2. Connect GitHub repository
3. Create new Web Service:
   - Select your GitHub repo
   - Set root directory to `backend`
   - Environment: Node
   - Build command: `npm install`
   - Start command: `npm start`
4. Add environment variables:
   ```
   DB_HOST = supabase_host
   DB_PORT = 5432
   DB_USER = postgres
   DB_PASSWORD = password
   DB_NAME = postgres
   JWT_SECRET = your_secret
   PORT = 3000
   ```
5. Deploy

### Option 2: Deploy to Railway

1. Create account at https://railway.app
2. Connect GitHub
3. Create new project
4. Add backend directory
5. Configure environment variables
6. Deploy

### Option 3: Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main
```

## Database Setup

### Supabase PostgreSQL

1. Create Supabase project
2. Note connection string: `postgresql://postgres:password@host:5432/postgres`
3. Run migrations:
   ```bash
   # Using psql
   psql postgresql://postgres:password@host:5432/postgres < database/schema.sql
   
   # Or seed initial data
   node backend/seed.js
   ```

## Post-Deployment Verification

### 1. Frontend Checks
- [ ] Home page loads at production URL
- [ ] No console errors (F12)
- [ ] Can navigate to login page
- [ ] Responsive on mobile
- [ ] Lighthouse score > 90

### 2. Backend Checks
- [ ] API responds at `/health`
- [ ] User registration works: POST `/users`
- [ ] User login works: POST `/users/login`
- [ ] Listings endpoint works: GET `/listings`

### 3. Integration Checks
- [ ] Frontend can communicate with backend
- [ ] Login redirects correctly
- [ ] Dashboard loads with real data
- [ ] Create listing works end-to-end
- [ ] Admin dashboard accessible

### 4. Database Checks
- [ ] Users table populated
- [ ] Listings visible
- [ ] Search/filtering works
- [ ] No connection errors in logs

## Monitoring

### Frontend (Vercel Analytics)
1. Dashboard > Analytics
2. Monitor Core Web Vitals
3. Check error rates
4. Monitor deployment frequency

### Backend Logs
```bash
# Render
# View in dashboard > Logs

# Railway
# View in dashboard > Logs

# Heroku
heroku logs --tail
```

### Error Tracking (Optional)
- Sentry for frontend errors
- Backend error logging
- Database query monitoring

## SSL Certificate

Vercel and cloud providers (Render, Railway, Heroku) handle SSL automatically.

Verify:
1. Visit https://yourdomain.com
2. Check browser shows green lock icon
3. Certificate automatically renews

## Scaling

### If experiencing high traffic:

**Frontend:**
- Vercel automatically scales
- Enable Edge Functions for optimization
- Monitor bandwidth usage

**Backend:**
- Increase database connections in pool
- Use caching for listings
- Consider read replicas for database

**Database:**
- Monitor query performance
- Create indexes on common filters
- Archive old data if needed

## Rollback

### If deployment fails:

**Frontend (Vercel):**
1. Deployments tab
2. Find previous working version
3. Click "Promote to Production"

**Backend:**
- Render: Redeploy previous version
- Heroku: `heroku releases:rollback`

## Troubleshooting

### 404 Frontend
- Verify Vercel project settings
- Check root directory is `frontend`
- Rebuild and redeploy

### API Connection Failed
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend is running
- Verify CORS configuration in backend
- Check network connectivity

### Database Connection Error
- Verify connection string is correct
- Check database is running
- Verify firewall/IP whitelist
- Test with connection tool first

### Slow Performance
- Check Lighthouse score
- Monitor database queries
- Enable image optimization
- Consider caching strategy

## Security Checklist

- [ ] HTTPS enabled on all URLs
- [ ] Environment variables not in code
- [ ] JWT secret is strong (32+ chars)
- [ ] Database password is strong
- [ ] CORS configured to allow only frontend
- [ ] Rate limiting enabled
- [ ] SQL injection prevention (parameterized queries)
- [ ] Sensitive data not logged
- [ ] Backup strategy in place
- [ ] Security headers configured

## Maintenance

### Regular Tasks
- Monitor error logs weekly
- Review performance metrics monthly
- Update dependencies quarterly
- Backup database daily (automatic on Supabase)
- Review access logs for anomalies

### Backup Strategy
- Supabase: automatic daily backups
- Keep 7-day backup history
- Test restore procedure quarterly

## Support

For deployment issues:
1. Check service status pages (Vercel, Render, etc.)
2. Review logs in dashboard
3. Verify environment variables
4. Test API endpoints with Postman/curl
5. Check GitHub issues and documentation
