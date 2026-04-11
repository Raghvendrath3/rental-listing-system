# API Documentation

Base URL: `http://localhost:3000` (development) or `https://api.rentalhub.com` (production)

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

Token expires after 1 hour. After expiration, user must re-login.

## User Endpoints

### Register User
```
POST /users
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 201 Created
{
  "status": "success",
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user"
  }
}
```

### Login User
```
POST /users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "status": "success",
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user"
  }
}
```

### Get User Profile
```
GET /users/profile
Authorization: Bearer <token>

Response: 200 OK
{
  "status": "success",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "role": "user",
    "created_at": "2026-04-09T16:00:00Z"
  }
}
```

### Update User Profile
```
PATCH /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "NewPassword123!"
}

Response: 200 OK
{
  "status": "success",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "role": "user",
    "created_at": "2026-04-09T16:00:00Z"
  }
}
```

## Listings Endpoints

### Get All Listings
```
GET /listings?q=keyword&city=New+York&type=apartment&minPrice=1000&maxPrice=5000&page=1&limit=10

Query Parameters:
- q: keyword search (optional)
- city: filter by city (optional)
- type: filter by property type (optional)
- minPrice: minimum price (optional)
- maxPrice: maximum price (optional)
- page: page number, default 1 (optional)
- limit: items per page, default 10 (optional)

Response: 200 OK
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "title": "Modern 2BR Apartment",
      "city": "New York",
      "type": "apartment",
      "price": 2500,
      "status": "published",
      "owner_id": 2,
      "created_at": "2026-04-09T16:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 42,
    "totalPages": 5
  }
}
```

### Get Listing by ID
```
GET /listings/:id

Response: 200 OK
{
  "status": "success",
  "data": {
    "id": 1,
    "title": "Modern 2BR Apartment",
    "city": "New York",
    "type": "apartment",
    "price": 2500,
    "status": "published",
    "owner_id": 2,
    "created_at": "2026-04-09T16:00:00Z"
  }
}
```

### Create Listing
```
POST /listings
Authorization: Bearer <token> (owner or admin only)
Content-Type: application/json

{
  "title": "Modern 2BR Apartment",
  "city": "New York",
  "type": "apartment",
  "price": 2500,
  "bedrooms": 2,
  "bathrooms": 1
}

Response: 201 Created
{
  "status": "success",
  "message": "Listing created successfully",
  "data": {
    "id": 1,
    "title": "Modern 2BR Apartment",
    "city": "New York",
    "type": "apartment",
    "price": 2500,
    "bedrooms": 2,
    "bathrooms": 1,
    "status": "draft",
    "owner_id": 2,
    "created_at": "2026-04-09T16:00:00Z"
  }
}
```

### Update Listing
```
PATCH /listings/:id
Authorization: Bearer <token> (owner of listing or admin)
Content-Type: application/json

{
  "title": "Updated Title",
  "price": 2750
}

Response: 200 OK
{
  "status": "success",
  "message": "Listing updated successfully",
  "data": { ... }
}
```

### Publish Listing
```
PATCH /listings/:id/publish
Authorization: Bearer <token> (owner of listing or admin)

Response: 200 OK
{
  "status": "success",
  "message": "Listing published successfully",
  "data": {
    ...
    "status": "published"
  }
}
```

### Archive Listing
```
PATCH /listings/:id/archive
Authorization: Bearer <token> (owner of listing or admin)

Response: 200 OK
{
  "status": "success",
  "message": "Listing archived successfully",
  "data": {
    ...
    "status": "archived"
  }
}
```

### Delete Listing
```
DELETE /listings/:id
Authorization: Bearer <token> (owner of listing or admin)

Response: 200 OK
{
  "status": "success",
  "message": "Listing deleted successfully"
}
```

## Owner Request Endpoints

### Submit Owner Request
```
POST /owner-requests
Authorization: Bearer <token> (user only)

Response: 201 Created
{
  "status": "success",
  "message": "Owner request submitted successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "status": "pending",
    "created_at": "2026-04-09T16:00:00Z"
  }
}
```

### Check Pending Request
```
GET /owner-requests/check
Authorization: Bearer <token>

Response: 200 OK
{
  "status": "success",
  "data": {
    "id": 1,
    "user_id": 1,
    "status": "pending",
    "created_at": "2026-04-09T16:00:00Z"
  }
}
```

### Get All Pending Requests
```
GET /owner-requests?page=1&limit=20
Authorization: Bearer <token> (admin only)

Query Parameters:
- page: page number (optional)
- limit: items per page (optional)

Response: 200 OK
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "status": "pending",
      "created_at": "2026-04-09T16:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 5,
    "totalPages": 1
  }
}
```

### Approve Owner Request
```
PATCH /owner-requests/:id/approve
Authorization: Bearer <token> (admin only)

Response: 200 OK
{
  "status": "success",
  "message": "Owner request approved successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "status": "approved",
    "created_at": "2026-04-09T16:00:00Z"
  }
}
```

### Reject Owner Request
```
PATCH /owner-requests/:id/reject
Authorization: Bearer <token> (admin only)
Content-Type: application/json

{
  "reason": "Request does not meet requirements"
}

Response: 200 OK
{
  "status": "success",
  "message": "Owner request rejected successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "status": "rejected",
    "rejection_reason": "Request does not meet requirements",
    "created_at": "2026-04-09T16:00:00Z"
  }
}
```

## Admin Endpoints

### Get All Users
```
GET /users/admin?page=1&limit=20&role=all&search=user@example.com
Authorization: Bearer <token> (admin only)

Query Parameters:
- page: page number (optional)
- limit: items per page (optional)
- role: filter by role - user/owner/admin/all (optional)
- search: search by email (optional)

Response: 200 OK
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "role": "user",
      "created_at": "2026-04-09T16:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 50,
    "totalPages": 3
  }
}
```

### Update User Role
```
PATCH /users/:id/role
Authorization: Bearer <token> (admin only)
Content-Type: application/json

{
  "role": "owner"
}

Valid roles: user, owner, admin

Response: 200 OK
{
  "status": "success",
  "message": "User role updated to owner",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "role": "owner",
    "created_at": "2026-04-09T16:00:00Z"
  }
}
```

### Delete User
```
DELETE /users/:id
Authorization: Bearer <token> (admin only)

Note: Deletes user and all associated data (listings, requests)

Response: 200 OK
{
  "status": "success",
  "message": "User deleted successfully",
  "data": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

### Get System Statistics
```
GET /admin/stats
Authorization: Bearer <token> (admin only)

Response: 200 OK
{
  "status": "success",
  "data": {
    "totalUsers": 50,
    "usersByRole": {
      "user": 40,
      "owner": 8,
      "admin": 2
    },
    "totalListings": 30,
    "listingsByStatus": {
      "draft": 5,
      "published": 20,
      "archived": 5
    },
    "totalOwnerRequests": 10,
    "ownerRequestsByStatus": {
      "pending": 3,
      "approved": 5,
      "rejected": 2
    }
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "email": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "status": "error",
  "message": "You do not have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

## Rate Limiting

Currently not implemented. Can be added using express-rate-limit.

Recommended limits:
- Login: 5 requests per 15 minutes
- Register: 3 requests per hour
- General API: 100 requests per minute

## Status Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request |
| 401  | Unauthorized (need token) |
| 403  | Forbidden (permission denied) |
| 404  | Not Found |
| 500  | Server Error |

## Testing

See [API_TESTING.md](./API_TESTING.md) for complete testing procedures.

Quick test with curl:
```bash
# Register
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'

# Login
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'

# Get listings
curl http://localhost:3000/listings
```
