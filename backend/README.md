# Rental Listing Management System

A backend-first, role-based rental listing platform designed to model real-world property management workflows. The system enables users to browse rental listings, owners to manage their own properties, and administrators to oversee listings on behalf of non-technical owners.

This project focuses on clean backend architecture, predictable API design, authentication, authorization, and controlled data exposure rather than UI complexity.

---

## 🎯 Project Goals

- Model real-world rental listing management scenarios
- Implement role-based access control (User, Owner, Admin)
- Enforce ownership and authorization rules at the service layer
- Build a maintainable backend with clear separation of concerns
- Practice production-oriented backend patterns

---

## 🧱 Architecture Overview

The project follows a layered backend architecture:

src/
├── app.js # Express app configuration
├── server.js # Server bootstrap
├── routes/ # HTTP route definitions
├── controllers/ # Request/response handling
├── services/ # Business logic
├── repositories/ # Data access layer
├── middlewares/ # Auth, validation, guards
└── errors/ # Centralized error handling

**Design principles:**
- Routes are thin and declarative
- Controllers handle HTTP concerns only
- Services enforce business rules
- Repositories manage data persistence
- Errors are handled centrally

---

## 👥 User Roles

- **User**
  - Browse and filter rental listings
  - View listing details

- **Owner**
  - Create, update, and delete their own listings
  - Manage availability and pricing

- **Admin**
  - Create owners
  - Create, update, or remove listings on behalf of owners
  - Moderate system data

---

## 🔐 Security & Access Control

- Authentication using JWT
- Role-based authorization
- Ownership checks for protected resources
- Sensitive data (e.g. owner contact details) exposed conditionally

---

## 🩺 Health Check

The health routes are public, bypass application authentication, and send
`Cache-Control: no-store`. Configure Render's health check path as
`/api/v1/health/ready`; the Docker image uses `/api/v1/health/live`.

### `GET /api/v1/health/live`

Checks only that the API process is running. It does not contact PostgreSQL:

```json
{ "status": "ok", "timestamp": "2026-11-16T04:56:12.000Z" }
```

### `GET /api/v1/health/ready`

Runs a PostgreSQL `SELECT 1` with a two-second timeout. It returns HTTP 503
when the database is unavailable; otherwise it returns HTTP 200 (including when
database latency is degraded):

```json
{ "status": "ok", "timestamp": "2026-11-16T04:56:12.000Z" }
```

### `GET /api/v1/health`

Returns the detailed report and uses the same HTTP status rule as readiness.
Database latency above 500 ms reports `degraded`; a failed database check
reports `down` and HTTP 503. Error details in this response are generic.

```json
{
  "status": "ok",
  "timestamp": "2026-11-16T04:56:12.000Z",
  "service": {
    "name": "rentalhub-api",
    "version": "1.0.0",
    "environment": "production",
    "commit": "abc123"
  },
  "uptime": { "seconds": 8653.2, "human": "0d 2h 24m" },
  "checks": {
    "database": {
      "status": "up",
      "latencyMs": 12.4,
      "pool": { "total": 3, "idle": 2, "waiting": 0 }
    }
  },
  "system": {
    "memory": { "rssMb": 68.1, "heapUsedMb": 21.3, "heapTotalMb": 32.8 },
    "nodeVersion": "v18.20.8"
  }
}
```

Set `HEALTH_DETAILS=false` to limit the full health response to `status`,
`timestamp`, and `uptime`. `APP_VERSION` can override the package version;
`GIT_SHA` or `RENDER_GIT_COMMIT` provides the deployed commit. Health checks are
not rate-limited by the current application, and are mounted before route-level
authentication. If the frontend origin is not allowed by CORS, add its exact
origin to `FRONTEND_URL` or the comma-separated `CORS_ORIGINS` setting; do not
open CORS to all origins.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation
```bash
git clone https://github.com/<your-username>/rental-listing-system.git
cd rental-listing-system
npm install
Running the Server
bash
Copy code
node src/server.js
Server will start on:

arduino
Copy code
http://localhost:3000
📌 Current Status
🚧 In active development

Initial setup completed:

Project structure

Health check endpoint

Centralized error handling

Upcoming:

Database integration

Authentication & authorization

Listing management APIs

Deployment

📚 Learning Focus
This project is intentionally scoped to emphasize:

Backend system design

Responsibility separation

Error handling discipline

Realistic production constraints

📄 License
This project is for learning and demonstration purposes.

---

## What to do now (important)

1. Create `README.md` in project root  
2. Paste the content above  
3. Commit with:

```bash
git add README.md
git commit -m "Add initial project documentation"
git push

