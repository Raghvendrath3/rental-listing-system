# RentalHub Deployment Checklist

## Pre-Deployment (48 hours before)

### Code Quality
- [ ] All features completed and merged
- [ ] Code reviewed and approved
- [ ] Tests passing locally
- [ ] No console errors or warnings
- [ ] Linter passes: `npm run lint`
- [ ] No TypeScript errors: `npm run type-check` (if available)
- [ ] Branch is up-to-date with main

### Testing
- [ ] Manual testing complete (all tests in API_TESTING.md)
- [ ] Tested on Chrome, Firefox, Safari, Edge
- [ ] Tested on mobile (iOS and Android)
- [ ] All user roles tested (user, owner, admin)
- [ ] Authentication flows verified
- [ ] API connectivity verified
- [ ] Error handling tested
- [ ] Loading states verified

### Security
- [ ] Security audit complete
- [ ] No hardcoded secrets
- [ ] Environment variables configured
- [ ] Dependencies audited: `npm audit`
- [ ] No critical vulnerabilities
- [ ] Password validation working
- [ ] CSRF tokens functional
- [ ] Input sanitization working

### Performance
- [ ] Build succeeds locally: `npm run build`
- [ ] No build warnings
- [ ] Lighthouse score >= 90 (all categories)
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.5s
- [ ] Images optimized
- [ ] Fonts optimized
- [ ] CSS minified

### Database
- [ ] Database backed up
- [ ] Migrations completed
- [ ] Data integrity verified
- [ ] Recovery plan documented

### Documentation
- [ ] README updated
- [ ] DEPLOYMENT.md reviewed
- [ ] API_TESTING.md reviewed
- [ ] Environment variables documented
- [ ] Release notes prepared
- [ ] Known issues documented

### Stakeholders
- [ ] Team notified of deployment window
- [ ] Users notified of any downtime
- [ ] Support team briefed
- [ ] Rollback plan communicated
- [ ] On-call person assigned

## 24 Hours Before

### Final Verification
- [ ] Code changes finalized
- [ ] All tests re-run
- [ ] Backup of production database
- [ ] Deployment environment ready
- [ ] Monitoring configured
- [ ] Alert system tested
- [ ] Team available for deployment

### Environment Verification
- [ ] NEXT_PUBLIC_API_URL set correctly
- [ ] All env variables present in Vercel
- [ ] Staging environment tested
- [ ] Production environment accessible
- [ ] DNS configured correctly
- [ ] SSL certificate valid

## Deployment Day

### Pre-Deployment (2 hours before)

- [ ] Final backup created
- [ ] Team gathered/on standby
- [ ] Monitoring dashboard open
- [ ] Error tracking configured and monitored
- [ ] Vercel dashboard ready
- [ ] Rollback plan reviewed
- [ ] Deployment windows confirmed
- [ ] No ongoing issues on current version

### During Deployment

- [ ] Build starts successfully
- [ ] Build completes without errors
- [ ] Deploy to staging first (if applicable)
- [ ] Smoke tests pass on staging
- [ ] Team approves staging
- [ ] Deploy to production
- [ ] Deployment status: "Ready"
- [ ] No errors during deployment
- [ ] Monitor error logs for first 5 minutes

### Immediate Post-Deployment (First 30 minutes)

#### Verify Basic Functionality
- [ ] Home page loads (http://rentalhub.com)
- [ ] No 500 errors
- [ ] Navbar visible
- [ ] Hero section displays
- [ ] Features section displays
- [ ] No layout breaks
- [ ] Responsive design works on mobile

#### Verify Authentication
- [ ] Can navigate to /auth/login
- [ ] Can navigate to /auth/register
- [ ] Login form renders
- [ ] Registration form renders
- [ ] Error messages display correctly

#### Verify API Connectivity
- [ ] DevTools Network tab shows requests
- [ ] API requests go to correct URL
- [ ] No CORS errors
- [ ] Response status codes correct
- [ ] Token handling works

#### Verify Critical Features
- [ ] User login works
- [ ] User dashboard loads
- [ ] Listings display
- [ ] Filters work
- [ ] Pagination works
- [ ] Owner can view listings
- [ ] Admin dashboard loads
- [ ] Logout works

#### Monitor Errors
- [ ] Check Sentry for errors (if configured)
- [ ] Check Vercel logs for errors
- [ ] Check browser console for errors
- [ ] Error rate acceptable
- [ ] No spike in error count
- [ ] No repeated errors
- [ ] Response times normal

### Short-term Monitoring (30 minutes - 2 hours)

- [ ] Continue monitoring errors
- [ ] Monitor performance metrics
- [ ] Monitor API response times
- [ ] Monitor database performance
- [ ] Check user feedback/reports
- [ ] Verify email system works (if applicable)
- [ ] Verify analytics tracking
- [ ] Monitor CPU/memory usage
- [ ] Monitor database connections
- [ ] Check uptime monitors

### Extended Monitoring (2 hours - 24 hours)

- [ ] Error rate stable and low
- [ ] Performance metrics stable
- [ ] No regression in features
- [ ] No user complaints
- [ ] Database performing well
- [ ] API response times acceptable
- [ ] All features working as expected
- [ ] No memory leaks
- [ ] No database locks
- [ ] Monitoring alerts not firing

## Post-Deployment

### After 24 Hours
- [ ] All systems stable
- [ ] No critical issues reported
- [ ] Performance acceptable
- [ ] Error rate normal
- [ ] Team confidence high
- [ ] No rollback needed
- [ ] Document any issues found
- [ ] Archive deployment logs

### Final Verification
- [ ] All tests pass on production
- [ ] Lighthouse score >= 90
- [ ] Security headers present
- [ ] SSL certificate valid
- [ ] All endpoints accessible
- [ ] All user roles working
- [ ] All features functioning
- [ ] No technical debt added

### Team Notification
- [ ] Notify team of successful deployment
- [ ] Publish release notes
- [ ] Update status page (if applicable)
- [ ] Celebrate successful deployment

## Rollback Triggers

Rollback immediately if:
- [ ] Critical security vulnerability found
- [ ] Data loss or corruption occurring
- [ ] System completely unavailable
- [ ] API endpoints returning 500s
- [ ] Database connection pool exhausted
- [ ] More than 5% of requests failing
- [ ] Performance degradation > 50%
- [ ] Core features not working

## Rollback Procedure

If rollback needed:
- [ ] Get team approval
- [ ] Note error for post-mortem
- [ ] Revert to previous stable deployment
- [ ] Verify rollback successful
- [ ] Test rolled-back version
- [ ] Notify team and stakeholders
- [ ] Schedule post-mortem
- [ ] Plan fix for next deployment

## Post-Deployment Issues

### Issue Found - Not Critical

1. [ ] Document the issue
2. [ ] Assess severity
3. [ ] Plan fix
4. [ ] Determine if needs hotfix or next release
5. [ ] Communicate timeline to stakeholders

### Issue Found - Critical

1. [ ] Alert team immediately
2. [ ] Assess impact
3. [ ] Consider rollback
4. [ ] Implement hotfix or rollback
5. [ ] Deploy fix
6. [ ] Verify resolution
7. [ ] Post-mortem meeting

## Post-Mortem (Within 24 hours)

- [ ] Schedule meeting
- [ ] Review what went well
- [ ] Review what went wrong
- [ ] Identify root causes
- [ ] Create action items
- [ ] Assign owners
- [ ] Set deadlines
- [ ] Document lessons learned
- [ ] Update deployment process if needed
- [ ] Share findings with team

## Notes

### Deployment Date: _____________

### Deployed By: _____________

### Vercel Deployment ID: _____________

### Git Commit Hash: _____________

### Issues Found:
___________________________________________________________

### Resolution:
___________________________________________________________

### Lessons Learned:
___________________________________________________________

### Next Steps:
___________________________________________________________

## Sign-Off

- [ ] Development Lead: _____________ Date: _______
- [ ] QA Lead: _____________ Date: _______
- [ ] Operations: _____________ Date: _______
- [ ] Product Owner: _____________ Date: _______
