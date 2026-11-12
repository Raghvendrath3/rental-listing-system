# Rental Hub - Feature Implementations Design Plan

This plan details the design and implementation steps for 5 requested features on the Rental Hub platform:
1. **Public Landing Page** at `/`
2. **Listing Detail Page** at `/listings/[id]` (tenant auth required)
3. **Tenant-to-Owner Inquiry System** (with full 3-layer RBAC protection and PostgreSQL RLS)
4. **Registration Form Updates** (Full name, phone, address fields)
5. **Owner Application Form Updates** (Property type, location, reason fields with admin review panel integration)

---

## User Review Required

> [!IMPORTANT]
> - Database schema will be updated to include new fields `full_name`, `phone`, `address` in `users` and `property_type`, `location`, `reason` in `owner_requests`.
> - A new database table `inquiries` will be created with Row-Level Security (RLS) enabled and matching policies.
> - The new inquiry system API endpoints will be routed through Next.js middleware, Next.js API route proxy, and Express middleware to satisfy the 3-layer RBAC constraint.
> - The existing `tests/api.test.js` has a failing test due to the database `LOWER` trigger lowercasing names. We will fix the assertion to expect lowercase to make the test suite pass cleanly.

---

## Open Questions

- *Are there any specific formatting constraints for the phone number field (e.g., regex checks, country codes)?* (We will default to standard length checks of minimum 10 digits in frontend and backend validation).
- *For owner display info on the detail page, is it safe to expose email and name?* (Yes, since the detail page requires tenant authentication, we will display the owner's full name and email address securely).

---

## Proposed Changes

### Database Tier

We will create and run a migration script to update the database schema on Neon.

#### [NEW] [migrate.js](file:///c:/Users/AC/Desktop/Workplace/Projects/rentalhub/backend/src/scripts/migrate.js)
- A Node.js migration script that reads `DATABASE_URL` from `.env`, runs schema-modifying SQL queries, and shuts down the pool.
- SQL operations:
  - Add column `full_name`, `phone`, `address` to `users` table if not exists.
  - Add column `property_type`, `location`, `reason` to `owner_requests` table if not exists.
  - Create table `inquiries` if not exists.
  - Enable RLS and establish security policies and grants for the `inquiries` table.

#### [MODIFY] [database_schema.sql](file:///c:/Users/AC/Desktop/Workplace/Projects/rentalhub/database_schema.sql)
- Keep this local reference file in sync with the live Neon schema by adding columns to `users`, `owner_requests`, and the full table definition + RLS setup for `inquiries`.

---

### Backend API (Express.js)

#### [MODIFY] [users.service.js](file:///c:/Users/AC/Desktop/Workplace/Projects/rentalhub/backend/src/services/users.service.js)
- Add a new validation helper `validateRegistration` checking for `full_name`, `phone` (min 10 chars), and `address`.
- Integrate `validateRegistration` in `postUsersService`.

#### [MODIFY] [users.repository.js](file:///c:/Users/AC/Desktop/Workplace/Projects/rentalhub/backend/src/repositories/users.repository.js)
- Update `postUsersRepository` query to insert `full_name`, `phone`, and `address`.

#### [MODIFY] [requests.service.js](file:///c:/Users/AC/Desktop/Workplace/Projects/rentalhub/backend/src/services/requests.service.js)
- Update `submitOwnerRequestService` to validate and extract `property_type`, `location`, and `reason` from the request.

#### [MODIFY] [requests.repository.js](file:///c:/Users/AC/Desktop/Workplace/Projects/rentalhub/backend/src/repositories/requests.repository.js)
- Update `createRequest` to store `property_type`, `location`, and `reason`.
- Update `getAllRequests` to retrieve these fields in admin queue view.

#### [MODIFY] [owner.repository.js](file:///c:/Users/AC/Desktop/Workplace/Projects/rentalhub/backend/src/repositories/owner.repository.js)
- Update `findById` query to perform `LEFT JOIN users` to extract the owner's `email` (as `owner_email`) and `full_name` (as `owner_name`) safely.

#### [NEW] [inquiries.repository.js](file:///c:/Users/AC/Desktop/Workplace/Projects/rentalhub/backend/src/repositories/inquiries.repository.js)
- Implement `createInquiry(tenantId, listingId, message)`.
- Implement `findInquiriesByTenantId(tenantId)` and `findInquiriesByOwnerId(ownerId)`.

#### [NEW] [inquiries.service.js](file:///c:/Users/AC/Desktop/Workplace/Projects/rentalhub/backend/src/services/inquiries.service.js)
- Implement `createInquiry(actor, data)` with service-layer re-validation:
  - Verify listing exists.
  - Verify listing status is 'published'.
  - Verify actor is standard tenant (`user`).
  - Verify tenant is not the listing owner.
- Implement `getTenantInquiries(actor)` and `getOwnerInquiries(actor)`.

#### [NEW] [inquiries.controller.js](file:///c:/Users/AC/Desktop/Workplace/Projects/rentalhub/backend/src/controllers/inquiries.controller.js)
- Controllers to handle HTTP input mapping and send REST responses for inquiries.

#### [NEW] [inquiries.routes.js](file:///c:/Users/AC/Desktop/Workplace/Projects/rentalhub/backend/src/routes/inquiries.routes.js)
- Define Express routes mapping:
  - `POST /` (requireAuth, requireRole('user'))
  - `GET /` (requireAuth, requireRole('user'))
  - `GET /owner` (requireAuth, requireRole('owner'))

#### [MODIFY] [app.js](file:///c:/Users/AC/Desktop/Workplace/Projects/rentalhub/backend/src/app.js)
- Register `/api/v1/inquiries` route.

---

### Backend Integration Tests

#### [MODIFY] [api.test.js](file:///c:/Users/AC/Desktop/Workplace/Projects/rentalhub/backend/tests/api.test.js)
- Fix title assertion (expected lowercase `'jest test flat'`).
- Update registration tests to include `full_name`, `phone`, and `address`.
- Update become-owner request tests to send `property_type`, `location`, and `reason`.

#### [MODIFY] [workflow.test.js](file:///c:/Users/AC/Desktop/Workplace/Projects/rentalhub/backend/tests/workflow.test.js)
- Update registration and become-owner requests tests to supply mandatory inputs.

---

### Frontend Client (Next.js)

#### [NEW] [middleware.ts](file:///c:/Users/AC/Desktop/Workplace/Projects/rentalhub/frontend/middleware.ts)
- Next.js Edge middleware to intercept `/api/inquiries` and `/api/owner/inquiries` routes, decode base64 JWT payload, and block access for unauthorized roles.

#### [NEW] [route.ts (Proxy routes)](file:///c:/Users/AC/Desktop/Workplace/Projects/rentalhub/frontend/app/api/inquiries/route.ts)
- Next.js API Routes routing requests to Express backend on port 5000.

#### [NEW] [route.ts (Proxy owner route)](file:///c:/Users/AC/Desktop/Workplace/Projects/rentalhub/frontend/app/api/owner/inquiries/route.ts)
- Next.js API Route for owner inquiries retrieval.

#### [MODIFY] [page.tsx (Landing Page)](file:///c:/Users/AC/Desktop/Workplace/Projects/rentalhub/frontend/app/page.tsx)
- Implement a public landing page featuring a hero section, a search CTA redirecting to listings, and a feature highlights grid.

#### [NEW] [[id]/page.tsx (Detail Page)](file:///c:/Users/AC/Desktop/Workplace/Projects/rentalhub/frontend/app/(public)/listings/[id]/page.tsx)
- Create listing detail page displaying listing details, back button, owner safe display info, and inquiry form. Protected under tenant login requirements.

#### [MODIFY] [become-owner/page.tsx](file:///c:/Users/AC/Desktop/Workplace/Projects/rentalhub/frontend/app/(user)/become-owner/page.tsx)
- Convert button submission to an interactive form requesting:
  - Property Type (dropdown)
  - Location (text input)
  - Reason (textarea)

#### [MODIFY] [requests/page.tsx (Admin view)](file:///c:/Users/AC/Desktop/Workplace/Projects/rentalhub/frontend/app/(admin)/admin/requests/page.tsx)
- Add columns displaying property type, location, and reason for admin review.

---

## Verification Plan

### Automated Tests
- Run `npm test` inside `backend/` directory to ensure all 47 tests (including workflow and API endpoints) pass.

### Manual Verification
- Launch backend and frontend dev servers.
- Verify registration form requires all new inputs (name, phone, address).
- Verify become-owner page displays application form and populates request in admin review panel.
- Open public landing page and test searching a query redirect.
- Log in as tenant, open a listing detail page, and check if listing details and owner display info are shown.
- Test tenant-to-owner inquiry submission, verifying client and server-side RBAC checks.
- Log in as owner, check inquiries on owner dashboard/listings.
