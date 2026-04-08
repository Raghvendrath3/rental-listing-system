# RentalHub Frontend - Security Policy

## Overview
This document outlines the security measures implemented in the RentalHub frontend application to protect user data and ensure secure operation in production environments.

## Security Headers

### Implemented Headers
The application enforces the following security headers via middleware and Next.js configuration:

#### X-Frame-Options
- **Value**: `DENY`
- **Purpose**: Prevents clickjacking attacks by preventing the site from being embedded in iframes
- **Details**: No external site can frame our content

#### X-Content-Type-Options
- **Value**: `nosniff`
- **Purpose**: Prevents MIME-type sniffing attacks
- **Details**: Browsers must respect the Content-Type header

#### X-XSS-Protection
- **Value**: `1; mode=block`
- **Purpose**: Enables XSS protection in legacy browsers
- **Details**: Blocks page if XSS attack is detected

#### Referrer-Policy
- **Value**: `strict-origin-when-cross-origin`
- **Purpose**: Controls what referrer information is sent
- **Details**: Only sends origin to cross-origin requests

#### Permissions-Policy
- **Value**: Disables camera, microphone, geolocation, USB
- **Purpose**: Restricts access to sensitive APIs
- **Details**: Prevents unauthorized use of device features

#### Strict-Transport-Security (HSTS)
- **Value**: `max-age=63072000; includeSubDomains; preload`
- **Purpose**: Forces HTTPS connections
- **Details**: 2-year expiration, includes subdomains, preload list enabled

#### Content-Security-Policy (CSP)
- **Value**: Configured with strict directives
- **Purpose**: Prevents XSS and data injection attacks
- **Details**:
  - `default-src 'self'`: Only load from same origin by default
  - `script-src`: Allows inline scripts and eval (for dev, should be restricted in production)
  - `style-src`: Allows inline styles (required for Tailwind)
  - `img-src`: Allows local and HTTPS images
  - `connect-src`: Allows API calls to localhost and configured API URLs
  - `frame-ancestors 'none'`: Prevents embedding

## Authentication & Authorization

### JWT Token Management
- **Storage**: Tokens stored in browser localStorage (consider HTTP-only cookies for enhanced security)
- **Format**: `JWT|userId|role` (pipe-separated, custom format)
- **Expiration**: 1 hour (configured on backend)
- **Refresh**: Users must log in again after expiration

### Token Injection
- **Method**: Bearer token automatically injected in Authorization header
- **Location**: `lib/api.ts` apiFetch function
- **Security**: Token included in `Authorization: Bearer <token>` header

### Session Management
- **Logout**: Clears token and redirects to login
- **Auto-logout**: On 401 responses, automatically logs out user
- **Redirect**: Unauthenticated users redirected to login

## CORS & API Security

### CORS Configuration
- **Allowed Origins**: Configured via NEXT_PUBLIC_API_URL environment variable
- **Credentials**: Bearer token used for authentication
- **Methods**: GET, POST, PUT, DELETE (as needed)

### API Validation
- **Input Validation**: Zod schemas validate all form inputs before submission
- **Error Handling**: API errors map to user-friendly messages
- **Network Errors**: Detected and handled gracefully

## Input Sanitization & Validation

### Form Validation
- **Framework**: Zod for schema validation
- **Schemas**: All forms use typed Zod schemas
- **Rules**: Email format, password strength, field length constraints
- **Real-time**: Validation shows errors as user types

### Password Requirements
- **Minimum Length**: 8 characters
- **Character Types**: Mix of uppercase, lowercase, numbers, special characters
- **Strength Meter**: Visual indicator of password strength
- **Hashing**: Passwords hashed with bcrypt on backend

### Data Validation
- **Frontend**: Zod validates structure and types
- **Backend**: Backend performs additional validation
- **Defense-in-depth**: Never trust client-side validation alone

## XSS Prevention

### Content Security Policy
- Restricts inline scripts and styles
- Controls resource loading
- Prevents data exfiltration

### React Security
- React escapes output by default
- Template literals properly escaped
- User-generated content sanitized on display

### Form Handling
- HTML input elements used for form fields
- No dangerouslySetInnerHTML usage
- Form validation prevents malicious input

## CSRF Protection

### Implementation
- CSRF token generated on app initialization
- Token stored in sessionStorage
- Token can be included in request headers if needed
- Utility functions available in `lib/csrf.ts`

### Current Approach
- Backend uses JWT for authentication (CSRF less critical)
- State-changing requests require authentication
- SameSite cookie policy enforced

## Authentication Flows

### Login Flow
1. User enters credentials
2. Credentials validated with Zod schema
3. POST request to `/users/login` with email/password
4. Backend validates credentials and returns JWT token
5. Token stored in localStorage
6. User redirected to appropriate dashboard
7. Subsequent requests include token in Authorization header

### Registration Flow
1. User enters email and password
2. Validation: email format, password strength
3. POST request to `/users/register`
4. Backend creates user account
5. User redirected to login page
6. User logs in with credentials

### Logout Flow
1. User clicks logout button
2. Token cleared from localStorage
3. User redirected to home page
4. Subsequent requests without token will be rejected with 401

## Role-Based Access Control (RBAC)

### Roles
- **user**: Browse listings, view profile
- **owner**: Manage their listings, view owner dashboard
- **admin**: View all listings, manage users, admin dashboard

### Enforcement
- **Frontend**: UI hides inaccessible features based on role
- **Backend**: Routes verify role before allowing access
- **Both layers**: Frontend for UX, backend for security

### Protected Routes
- Dashboard routes protected by ProtectedRoute component
- Role checks on sensitive operations (create, update, delete)
- Admin routes only accessible to admin users

## Error Handling & Logging

### Error Messages
- **User-friendly**: Clear messages without exposing internals
- **Status codes**: Appropriate HTTP status codes returned
- **Logging**: Errors logged for monitoring (not in user-facing errors)

### Sensitive Data
- **Never exposed**: Passwords, tokens, private keys never in errors
- **Stack traces**: Hidden in production
- **Debug logs**: Removed from production builds

## Dependency Security

### Vulnerability Scanning
- Run `npm audit` regularly
- Update dependencies promptly
- Review dependency changelogs

### Production Builds
- Source maps disabled: `productionBrowserSourceMaps: false`
- Minification enabled
- Tree-shaking removes unused code

## Environment Variables

### Sensitive Values
- **NEVER commit** `.env` files to git
- **Use** `.env.example` template with comments
- **Store** actual secrets in deployment platform (Vercel)
- **Never** log or expose environment variables

### Required Variables
- `NEXT_PUBLIC_API_URL`: Backend API URL (can be public)
- Database credentials should be on backend only

## Testing & Auditing

### Regular Audits
- Security header verification
- OWASP Top 10 checks
- Dependency vulnerability scans
- Code review for security issues

### Penetration Testing
- Test authentication flows
- Test authorization boundaries
- Test input validation
- Test error handling

## Incident Response

### Procedures
1. **Identify**: Detect security issue
2. **Contain**: Stop further damage
3. **Investigate**: Root cause analysis
4. **Remediate**: Fix the vulnerability
5. **Notify**: Inform users if necessary
6. **Improve**: Update security measures

### Contacts
- Security team: [contact info]
- Incident reporting: [reporting process]

## Compliance

### Standards
- OWASP Top 10 compliance
- WCAG 2.1 AA accessibility
- GDPR compliance (if applicable)
- Data protection regulations

## Updates & Maintenance

### Security Updates
- Monitor security advisories
- Apply patches promptly
- Test thoroughly before deployment
- Document all security changes

### Policy Review
- Review this policy quarterly
- Update based on threat landscape
- Incorporate lessons learned
- Share with team regularly

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Next.js Security](https://nextjs.org/docs/guides/security)
