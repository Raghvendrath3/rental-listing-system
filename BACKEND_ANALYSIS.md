# Backend Analysis: Rental Listing System

## 1. API Endpoints

### Users Module
| Route | Method | Auth | Role | Request Schema | Response Schema | Description |
|-------|--------|------|------|---|---|---|
| `/users` | POST | ❌ | - | `{ email, password }` | `{ status, data: { id, email, role, created_at } }` | Register new user (default role: 'user') |
| `/users/login` | POST | ❌ | - | `{ email, password }` | `{ status, token: "JWT\|userId\|role" }` | Login returns JWT token with user metadata |
| `/users/become-owner` | POST | ✅ | user | - | `{ status, message }` | Promote user role to 'owner' |

### Listings Module
| Route | Method | Auth | Role | Request Schema | Response Schema | Description |
|-------|--------|------|------|---|---|---|
| `/listings` | GET | ❌ | - | `{ q, city, type, priceMin, priceMax, page=1, limit=10 }` | `{ status, meta: { page, limit, totalItems, totalPages }, data: [] }` | Get all published listings with pagination & filters |
| `/listings/:id` | GET | ❌ | - | - | `{ status, data: listing }` | Get listing by ID (only published for users) |
| `/listings` | POST | ✅ | owner, admin | `{ payload: { title, type, city, area, price, is_available } }` | `{ status, data: listing }` | Create new listing (status: draft) |
| `/listings/:id` | PATCH | ✅ | owner, admin | `{ title, type, city, area, price, is_available }` | `{ status, data: listing }` | Update listing (only owner/admin) |
| `/listings/:id` | DELETE | ✅ | owner, admin | - | `{ status, data: listing }` | Delete listing (only owner/admin) |
| `/listings/:id/publish` | PATCH | ✅ | owner, admin | - | `{ status, data: listing }` | Publish listing (draft → published) |
| `/listings/:id/archive` | PATCH | ✅ | owner, admin | - | `{ status, data: listing }` | Archive listing (published → archived) |

---

## 2. Authentication & Authorization

### JWT Flow
1. User registers/logs in → Backend generates JWT with `{ id, role }` payload
2. JWT signed with `process.env.JWT_SECRET`, expires in 1 hour
3. Token format returned: `"JWT_TOKEN|userId|role"` (pipe-separated for client parsing)
4. Client sends: `Authorization: Bearer <JWT_TOKEN>` in headers
5. Middleware (`requireAuth`) validates JWT, attaches `req.user` to request

### Role-Based Access Control (RBAC)
- **user**: Can only become an owner. Cannot create/manage listings.
- **owner**: Can create, update, delete, publish, archive their own listings.
- **admin**: Full access to all listings (owns all listings).

### Middleware Chain
- `requireAuth`: Validates Bearer token, extracts user ID and role
- `requireRole(...roles)`: Checks if user role matches allowed roles

### Access Control Rules
| Action | Owner | Admin | User |
|--------|-------|-------|------|
| Create listing | ✅ | ✅ | ❌ |
| Update own listing | ✅ | ✅ (any) | ❌ |
| Delete own listing | ✅ | ✅ (any) | ❌ |
| Publish listing | ✅ (own) | ✅ (any) | ❌ |
| Archive listing | ✅ (own) | ✅ (any) | ❌ |
| View published listings | ✅ | ✅ | ✅ |
| Promote to owner | N/A | N/A | ✅ (self only) |

---

## 3. Data Models

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'owner', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

| Field | Type | Constraints | Purpose |
|-------|------|---|---|
| id | SERIAL | PRIMARY KEY | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email for login |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt hash (12 rounds) |
| role | ENUM | DEFAULT 'user' | user \| owner \| admin |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |

### Listings Table
```sql
CREATE TABLE listings (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  city VARCHAR(100) NOT NULL,
  area DECIMAL(10, 2) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  owner_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP,
  archived_at TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
)
```

| Field | Type | Constraints | Purpose |
|-------|------|---|---|
| id | SERIAL | PRIMARY KEY | Unique listing identifier |
| title | VARCHAR(255) | NOT NULL | Listing name |
| type | VARCHAR(50) | NOT NULL | Property type (apartment, house, etc.) |
| city | VARCHAR(100) | NOT NULL | Location city |
| area | DECIMAL(10,2) | NOT NULL | Property area in sq units |
| price | DECIMAL(10,2) | NOT NULL | Monthly/annual rental price |
| is_available | BOOLEAN | DEFAULT true | Availability flag |
| status | ENUM | DEFAULT 'draft' | draft \| published \| archived |
| owner_id | INTEGER | FOREIGN KEY | Links to users table |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| published_at | TIMESTAMP | NULL | When listing was published |
| archived_at | TIMESTAMP | NULL | When listing was archived |

---

## 4. Business Logic & Listing Lifecycle

### Listing Lifecycle
```
DRAFT (Initial State)
  ↓
  └─→ Can update fields
  └─→ Can delete
  └─→ Can PUBLISH → PUBLISHED
  └─→ Visible only to owner/admin

PUBLISHED
  ↓
  └─→ Cannot update (must create new listing)
  └─→ Can ARCHIVE → ARCHIVED
  └─→ Visible to all users

ARCHIVED
  ↓
  └─→ Terminal state
  └─→ Cannot be reverted
  └─→ Not visible in browse
```

### Business Rules
1. **Draft listings** created on initial POST `/listings`
2. **Only published listings** appear in public search results (GET `/listings`)
3. **Owners** can only manage their own listings (except admins who manage all)
4. **Publish/Archive** operations check listing status (draft → published, published → archived)
5. **Admin accounts** have special access to all listings regardless of ownership

---

## 5. Validation Rules

### User Registration
| Field | Rules |
|-------|-------|
| email | Required, valid format (user@domain.ext), max 255 chars |
| password | Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char |

### Listing Creation/Update
| Field | Rules |
|-------|-------|
| title | Required, string |
| type | Required, string |
| city | Required, string |
| area | Required, positive number |
| price | Required, positive number |
| is_available | Optional, boolean |
| priceMin/priceMax | Must be positive, priceMin < priceMax for filtering |

### Pagination
| Field | Rules |
|-------|-------|
| page | Required, positive integer |
| limit | Required, positive integer |
| offset | Calculated: (page - 1) × limit |

### Filtering
- **q**: Case-insensitive title search (ILIKE)
- **city**: Exact city match
- **type**: Exact type match
- **priceMin/priceMax**: Range validation (both required or both undefined)

---

## 6. Error Handling

### Standard Error Responses
```json
{
  "status": "error",
  "message": "Error description"
}
```

### Common HTTP Status Codes
| Code | Scenario |
|------|----------|
| 400 | Invalid input, validation failed |
| 401 | Unauthorized (no token or invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 409 | Conflict (status mismatches during publish/archive) |
| 500 | Internal server error |

### Error Messages by Endpoint
| Endpoint | Error | Status |
|----------|-------|--------|
| POST /users | Email already exists | 400 |
| POST /users | Invalid email format | 400 |
| POST /users | Password doesn't meet requirements | 400 |
| POST /users/login | Invalid email or password | 401 |
| POST /listings | Not owner/admin | 403 |
| PATCH /listings/:id/publish | Listing not in draft status | 409 |
| PATCH /listings/:id/archive | Listing not in published status | 409 |
| GET /listings/:id | Listing doesn't exist | 404 |

---

## 7. Architecture & Layer Separation

```
Request Flow:
Route → Middleware (auth, role) → Controller → Service → Repository → Database

Layer Responsibilities:

1. Routes: Define HTTP endpoints, attach middleware
2. Controllers: Parse requests, call services, format responses
3. Services: Business logic, validation, authorization
4. Repositories: Database queries, data persistence
5. Middleware: JWT validation, role checking
6. Errors: Centralized error handling with custom AppError class
```

---

## 8. Key Design Patterns

### Authorization Pattern
- **Route-level**: `requireRole` middleware for basic role checks
- **Service-level**: `assertOwnerOrAdmin()` for resource ownership validation
- **Principle**: Ownership checks live in service layer, role checks in middleware

### Validation Pattern
- **User validation**: In `users.service.js` (email format, password strength)
- **Listing validation**: In `listings.service.js` (status checks, required fields)
- **Pagination validation**: After totalPages calculated to avoid off-by-one errors

### Error Handling Pattern
- Custom `AppError` class with status codes
- Middleware `next(error)` for centralized error handler in app.js
- All async operations wrapped in try-catch

---

## 9. Security Notes

### Implemented
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT-based stateless authentication
- ✅ Role-based access control via middleware
- ✅ Parameterized queries (prepared statements) to prevent SQL injection
- ✅ Bearer token format validation
- ✅ Password strength requirements

### Frontend Implementation Should Handle
- HTTP-only cookies for token storage (if using cookies instead of Authorization header)
- CSRF protection for state-changing operations
- Input sanitization before sending to API
- XSS prevention in rendered content
- Secure token refresh logic (1-hour expiration)

---

## 10. API Integration Notes for Frontend

### Token Storage & Usage
Frontend receives: `"eyJhbG...|123|owner"` (JWT|userId|role)
- Extract JWT and use in `Authorization: Bearer <JWT>` header
- Store userId and role for client-side routing
- Handle 401 errors by redirecting to login

### Base URL
```
Backend API: http://localhost:3000 (or production URL)
CORS enabled: All origins accepted
```

### Response Format
All successful responses follow:
```json
{
  "status": "success",
  "data": { /* endpoint-specific data */ },
  "meta": { /* optional pagination info */ }
}
```

All error responses follow:
```json
{
  "status": "error",
  "message": "Error description"
}
```

---

## 11. Outstanding Issues in Backend Code

1. **listings.service.js line 48**: References undefined `listing` variable before it's assigned
2. **listings.service.js**: `assertOwnerOrAdmin` called incorrectly (before `listing` exists)
3. **postListingService**: Should not use `assertOwnerOrAdmin` for new listings
4. **Token format**: Returning `token|userId|role` is non-standard; frontend must parse manually

These should be fixed before full production deployment, but frontend can work around them.

