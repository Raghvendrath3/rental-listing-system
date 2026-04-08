# RentalHub API Integration Testing Guide

## Overview
This guide provides manual testing procedures to verify all API endpoints work correctly with the frontend application. Perform these tests before each deployment.

## Prerequisites
- Backend running on `http://localhost:5000` (or configured API URL)
- Frontend running on `http://localhost:3000`
- Browser developer tools open (F12)
- Test user accounts created

## Test Accounts
Create these test accounts before testing:

```
USER Account:
- Email: user@test.com
- Password: TestPass123!

OWNER Account:
- Email: owner@test.com
- Password: TestPass123!

ADMIN Account:
- Email: admin@test.com
- Password: AdminPass123!
```

## Authentication Tests

### Test 1: User Registration
1. Navigate to `/auth/register`
2. Fill form with: email: `newuser@test.com`, password: `NewPass123!`
3. Click "Sign Up"
4. **Expected**: Redirected to `/auth/login` with success message
5. **Verify**: User can log in with new credentials

### Test 2: User Login
1. Navigate to `/auth/login`
2. Enter: email: `user@test.com`, password: `TestPass123!`
3. Click "Sign In"
4. **Expected**: 
   - Redirected to `/dashboard`
   - Token stored in localStorage
   - Navbar shows email and logout button
   - User can see "Browse" option

### Test 3: Owner Login
1. Log out if logged in
2. Navigate to `/auth/login`
3. Enter: email: `owner@test.com`, password: `TestPass123!`
4. Click "Sign In"
5. **Expected**:
   - Redirected to `/dashboard/myListings`
   - Navbar shows "My Listings" option
   - Can see create new listing button

### Test 4: Admin Login
1. Log out if logged in
2. Navigate to `/auth/login`
3. Enter: email: `admin@test.com`, password: `AdminPass123!`
4. Click "Sign In"
5. **Expected**:
   - Redirected to `/dashboard/admin`
   - Navbar shows "Admin" option
   - Can see stats and listings overview

### Test 5: Invalid Login
1. Navigate to `/auth/login`
2. Enter: email: `user@test.com`, password: `WrongPassword123!`
3. Click "Sign In"
4. **Expected**: Error message "Invalid email or password"
5. **Verify**: Not redirected, stays on login page

### Test 6: Session Timeout
1. Log in as user
2. Check localStorage for token
3. Wait for session timeout (1 hour) or manually clear token
4. Try to navigate to `/dashboard`
5. **Expected**: Redirected to `/auth/login` with message about session expiration

### Test 7: Logout
1. Log in as user
2. Click logout button in navbar
3. **Expected**:
   - Redirected to home page
   - Token removed from localStorage
   - Navbar shows login/register buttons
   - Cannot access protected routes

## User Dashboard Tests (Browse Listings)

### Test 8: Browse Listings
1. Log in as regular user
2. Navigate to `/dashboard`
3. **Expected**:
   - See list of published listings in grid
   - Each card shows: title, city, price, property type
   - Pagination controls visible if more than 10 listings

### Test 9: Filter by City
1. On user dashboard
2. Enter city name in city filter (e.g., "New York")
3. Click "Filter" or auto-apply
4. **Expected**:
   - Listings filtered to only show city
   - Page reloads with filtered results
   - Filter value persists in input

### Test 10: Filter by Price Range
1. On user dashboard
2. Select price range (e.g., "$2,000 - $3,000")
3. Click "Filter" or auto-apply
4. **Expected**:
   - Listings filtered by price
   - All displayed listings within range
   - Price range value persists

### Test 11: Filter by Type
1. On user dashboard
2. Select listing type (e.g., "Apartment")
3. Click "Filter" or auto-apply
4. **Expected**:
   - Only listings of selected type shown
   - All property types appear in results
   - Type value persists

### Test 12: Pagination
1. On user dashboard
2. If more than 10 listings exist, scroll to pagination
3. Click page 2
4. **Expected**:
   - Page loads
   - Different listings displayed
   - Current page highlighted
   - Can go back to previous page

## Owner Dashboard Tests (Manage Listings)

### Test 13: View My Listings
1. Log in as owner
2. Navigate to `/dashboard/myListings` (or click "My Listings" in navbar)
3. **Expected**:
   - See all listings owned by this user
   - Shows: title, city, price, status (draft/published/archived)
   - "Create New Listing" button visible
   - Edit and delete buttons visible for each listing

### Test 14: Create New Listing
1. On owner dashboard
2. Click "Create New Listing"
3. Navigate to `/dashboard/myListings/new`
4. Fill form:
   - Title: "Modern 2BR Apartment"
   - Description: "Beautiful modern apartment"
   - Address: "123 Main St"
   - City: "New York"
   - Type: "Apartment"
   - Price: "2500"
   - Bedrooms: "2"
   - Bathrooms: "1"
5. Click "Create Listing"
6. **Expected**:
   - Success message
   - Redirected to listing edit page
   - Listing appears in drafts in my listings
   - Form validation prevents submitting invalid data

### Test 15: Edit Listing
1. On owner dashboard
2. Click edit button on any listing
3. Navigate to `/dashboard/myListings/[id]`
4. Update: Title to "Updated Title"
5. Click "Save Changes"
6. **Expected**:
   - Success message
   - Listing updated in list
   - New title appears in card
   - Changes persisted in database

### Test 16: Publish Listing
1. On owner dashboard
2. Click "Publish" button on a draft listing
3. **Expected**:
   - Confirmation dialog appears
   - Confirm publish
   - Listing status changes to "Published"
   - Listing now visible to other users
   - Success message displayed

### Test 17: Archive Listing
1. On owner dashboard
2. Click "Archive" button on a published listing
3. **Expected**:
   - Confirmation dialog appears
   - Confirm archive
   - Listing status changes to "Archived"
   - Listing no longer visible to other users
   - Success message displayed

### Test 18: Delete Listing
1. On owner dashboard
2. Click "Delete" button on any listing
3. **Expected**:
   - Confirmation dialog appears: "Are you sure you want to delete this listing?"
   - Cancel should dismiss dialog without deleting
   - Confirm delete removes listing
   - Success message displayed
   - Listing no longer in list

## Admin Dashboard Tests

### Test 19: View Admin Dashboard
1. Log in as admin
2. Navigate to `/dashboard/admin` (or click "Admin" in navbar)
3. **Expected**:
   - See stats cards:
     - Total Users
     - Total Listings
     - Published Listings
     - Archived Listings
   - See recent listings table
   - Users management link visible

### Test 20: View All Listings (Admin)
1. On admin dashboard
2. Click "All Listings" or see listings table
3. **Expected**:
   - See all listings (draft, published, archived)
   - Shows owner email
   - Shows status
   - Pagination works
   - Can filter by status if available

### Test 21: View Users Management
1. On admin dashboard
2. Click "Users" or navigate to `/dashboard/admin/users`
3. **Expected**:
   - See table of all users
   - Shows: email, role, created date
   - Can see count of users with each role
   - Pagination works for many users

### Test 22: View Stats
1. On admin dashboard
2. Check stat cards at top
3. **Expected**:
   - Numbers match actual data
   - Stats update when users create/delete listings
   - Stats are accurate

## Error Handling Tests

### Test 23: Network Error Handling
1. Log in as user
2. Open Network tab in DevTools
3. Throttle network to "Offline" in DevTools
4. Try to load listings or navigate
5. **Expected**:
   - Error message displayed
   - "Retry" button available
   - Application doesn't crash

### Test 24: Server Error (500)
1. Create a test scenario that triggers 500 error (if possible)
2. Or mock error in DevTools console
3. **Expected**:
   - User-friendly error message
   - "Try Again" button available
   - No stack traces in production build
   - Error logged for monitoring

### Test 25: Unauthorized (401)
1. Log in as user
2. Manually delete token from localStorage
3. Try to navigate to protected route
4. **Expected**:
   - Redirected to login
   - Message: "Session expired"
   - Must log in again
   - No data exposed

### Test 26: Forbidden (403)
1. Log in as regular user
2. Try to access admin-only endpoint (if possible through URL manipulation)
3. **Expected**:
   - Error message: "You do not have permission"
   - Page doesn't load
   - Redirected appropriately

### Test 27: Not Found (404)
1. Log in as user
2. Navigate to: `/dashboard/myListings/99999`
3. **Expected**:
   - Error message
   - No crash
   - Can navigate back

## Form Validation Tests

### Test 28: Email Validation
1. Navigate to `/auth/register`
2. Try invalid emails:
   - `notanemail`
   - `@example.com`
   - `user@`
3. **Expected**: Error message for each invalid email
4. Valid email: `test@example.com` accepted

### Test 29: Password Strength
1. Navigate to `/auth/register`
2. Try weak passwords:
   - `pass` (too short)
   - `password` (no caps or numbers)
   - `12345678` (no letters)
3. **Expected**: Warning about password strength
4. Strong password: `TestPass123!` shows strong indicator

### Test 30: Required Fields
1. On registration form
2. Try to submit without filling email
3. **Expected**: Validation error, form not submitted
4. Try submitting without password
5. **Expected**: Validation error

## Data Integrity Tests

### Test 31: Listing Data Consistency
1. Create listing as owner
2. View as user (in another browser/incognito)
3. **Expected**: Same data appears
4. Edit listing
5. **Expected**: Changes visible to other users immediately (within page load)

### Test 32: User Data Isolation
1. Create 2 user accounts
2. Log in as User 1
3. Try to access User 2's listings to edit/delete
4. **Expected**: Cannot access other user's listings
5. Only see own listings in My Listings

### Test 33: Admin Data Access
1. Log in as admin
2. View users and listings
3. **Expected**: Can see all data
4. Can see draft listings (that users can't see)
5. Can see all users

## Performance Tests

### Test 34: Page Load Time
1. Open DevTools Network tab
2. Clear cache
3. Load each page:
   - Home: should load in < 2s
   - Dashboard: should load in < 3s
   - Admin: should load in < 3s
4. **Expected**: All pages load within acceptable time

### Test 35: Image Loading
1. On any page with images
2. Verify images load correctly
3. Check Network tab for image requests
4. **Expected**:
   - Images load with Next.js optimization
   - No 404 errors
   - Images are compressed

### Test 36: Pagination Performance
1. On user dashboard with many listings
2. Click through pages
3. **Expected**: Pages load quickly
4. No lag when navigating between pages

## Browser Compatibility Tests

### Test 37: Chrome
1. Clear cache
2. Run through tests 1-15
3. **Expected**: All pass

### Test 38: Firefox
1. Clear cache
2. Run through tests 1-15
3. **Expected**: All pass

### Test 39: Safari
1. Clear cache
2. Run through tests 1-15
3. **Expected**: All pass

### Test 40: Edge
1. Clear cache
2. Run through tests 1-15
3. **Expected**: All pass

## Mobile Responsiveness Tests

### Test 41: Mobile Dashboard
1. Resize browser to mobile (375px width)
2. Log in as user
3. Navigate dashboard
4. **Expected**:
   - Layout adjusts for mobile
   - All buttons clickable
   - Forms usable on mobile
   - No horizontal scroll

### Test 42: Mobile Forms
1. On mobile (375px)
2. Try to fill login form
3. **Expected**:
   - Input fields large enough to tap
   - Keyboard doesn't obscure submit button
   - Form submission works

## Testing Checklist

Use this checklist before deployment:

- [ ] All authentication tests pass (Tests 1-7)
- [ ] User dashboard tests pass (Tests 8-12)
- [ ] Owner dashboard tests pass (Tests 13-18)
- [ ] Admin dashboard tests pass (Tests 19-22)
- [ ] Error handling tests pass (Tests 23-27)
- [ ] Form validation tests pass (Tests 28-30)
- [ ] Data integrity tests pass (Tests 31-33)
- [ ] Performance tests pass (Tests 34-36)
- [ ] Browser compatibility tests pass (Tests 37-40)
- [ ] Mobile responsiveness tests pass (Tests 41-42)
- [ ] No console errors
- [ ] No console warnings (except expected ones)
- [ ] Network requests all successful
- [ ] Token refresh works (if applicable)
- [ ] Error monitoring working

## Bug Reporting
If tests fail, document:
1. Test number and name
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Browser and OS
6. Screenshots if applicable
7. Console errors/warnings

## Monitoring in Production
After deployment, monitor:
- Error logs for API failures
- Performance metrics
- User session duration
- Failed login attempts
- API response times
- Database query performance
