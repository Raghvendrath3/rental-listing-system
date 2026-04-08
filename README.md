<div align="center">

# 🏠 RentalHub

### A Production-Grade Full-Stack Rental Listing Platform

[![Next.js](https://img.shields.io/badge/Next.js-App_Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)

> **RentalHub** is not just another CRUD app. It's a complete, role-driven rental marketplace with controlled owner onboarding, a lifecycle-based listing system, and a production-ready architecture — built end-to-end.

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Role-Based Access Control](#-role-based-access-control)
- [Listing Lifecycle](#-listing-lifecycle)
- [Owner Request Workflow](#-owner-request-workflow)
- [API Modules](#-api-modules)
- [Dashboards](#-dashboards)
- [Security](#-security)
- [Performance](#-performance)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Future Roadmap](#-future-roadmap)

---

## 🌟 Overview

RentalHub is a **controlled rental marketplace** where every role, action, and listing state is intentionally designed:

- 👤 **Users** can browse and filter rental listings
- 🏠 **Owners** can create, manage, and publish their properties
- 🛠️ **Admins** govern the entire platform — users, listings, and approvals

The system is built across three full layers — **database**, **REST API**, and **Next.js frontend** — with authentication, role-based dashboards, search & filtering, pagination, and deployment infrastructure.

---

## ✨ Key Features

### 🔐 Authentication
- JWT-based login with 1-hour token expiry
- Token parsing for user identity and role resolution
- Auto-logout on invalid or expired tokens
- Persistent sessions across page reloads
- Secure password storage with bcrypt hashing

### 👥 Role-Based Access Control (RBAC)
- Three distinct roles: `user`, `owner`, and `admin`
- Middleware-enforced permissions on every API route
- Frontend route guards and conditional UI rendering
- No client-side trust — all access verified server-side

### 🏡 Listings Management
- Full CRUD: create, update, delete listings
- State-driven lifecycle: `draft → published → archived`
- Invalid status transitions blocked at the API level
- Availability tracking per listing

### 🔍 Search, Filter & Pagination
- Keyword-based full-text search
- Filter by city, price range, and property type
- Paginated results (10 per page) via API query params
- Debounced search for optimized API calls

### 🧾 Owner Request Workflow ⭐
A standout feature — owner access is **never granted directly**:
1. User submits a "Become Owner" request
2. Request enters a `pending` state
3. Admin reviews and approves or rejects
4. Approved users are promoted to the `owner` role via a database transaction

> *"We implemented a controlled role upgrade system instead of direct role assignment to maintain platform integrity."*

### 📊 Role-Based Dashboards
- **User Dashboard** — browse, filter, and paginate listings
- **Owner Dashboard** — manage own listings, view stats (total / published / draft)
- **Admin Dashboard** — system-wide control over users, listings, and owner requests

---

## 🧠 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Frontend                         │
│         Next.js (App Router) · TypeScript · SWR         │
│                  Tailwind CSS · Vercel                   │
└─────────────────────┬───────────────────────────────────┘
                      │ REST API (JSON)
┌─────────────────────▼───────────────────────────────────┐
│                        Backend                          │
│              Node.js · Express · JWT Auth               │
│          Parameterized Queries · Connection Pool         │
└─────────────────────┬───────────────────────────────────┘
                      │ SQL
┌─────────────────────▼───────────────────────────────────┐
│                      Database                           │
│          PostgreSQL · Normalized Schema · ACID           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Role-Based Access Control

| Action                   | User | Owner     | Admin     |
|--------------------------|:----:|:---------:|:---------:|
| Browse listings          | ✅   | ✅        | ✅        |
| Create listings          | ❌   | ✅        | ✅        |
| Edit own listings        | ❌   | ✅        | ✅        |
| Delete own listings      | ❌   | ✅        | ✅        |
| Publish / archive        | ❌   | ✅        | ✅        |
| Manage all listings      | ❌   | ❌        | ✅        |
| Manage users             | ❌   | ❌        | ✅        |
| Review owner requests    | ❌   | ❌        | ✅        |

> Enforced via **backend middleware** and **frontend route protection** — not just UI hiding.

---

## 🔄 Listing Lifecycle

```
  ┌─────────┐       Publish       ┌───────────┐      Archive      ┌──────────┐
  │  DRAFT  │ ──────────────────► │ PUBLISHED │ ────────────────► │ ARCHIVED │
  │(private)│                     │ (visible) │                    │(inactive)│
  └─────────┘                     └───────────┘                    └──────────┘
```

- **Draft** — created but not visible to users
- **Published** — visible and browsable on the platform
- **Archived** — hidden and inactive; no longer shown publicly

Invalid transitions are blocked at the API level — no skipping states.

---

## 🧾 Owner Request Workflow

```
User clicks            Request stored         Admin reviews
"Become Owner"  ──►   as PENDING       ──►   the request
                                                  │
                              ┌───────────────────┤
                              ▼                   ▼
                         ✅ APPROVE          ❌ REJECT
                              │                   │
                    Role → OWNER         Stays as USER
                    (via transaction)
```

- Status validation prevents duplicate requests
- Transactional role promotion keeps request log and role update atomic
- Separate admin endpoints for listing and acting on requests

---

## 🔌 API Modules

### Auth
| Method | Endpoint         | Description         |
|--------|------------------|---------------------|
| POST   | `/auth/register` | Register a new user |
| POST   | `/auth/login`    | Login and get JWT   |
| GET    | `/auth/me`       | Validate session    |

### Listings
| Method | Endpoint               | Description                    |
|--------|------------------------|--------------------------------|
| GET    | `/listings`            | Fetch all (with filters)       |
| GET    | `/listings/:id`        | Get listing by ID              |
| POST   | `/listings`            | Create a new listing           |
| PUT    | `/listings/:id`        | Update a listing               |
| DELETE | `/listings/:id`        | Delete a listing               |
| PATCH  | `/listings/:id/publish`| Publish a listing              |
| PATCH  | `/listings/:id/archive`| Archive a listing              |

### Owner Requests
| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| POST   | `/owner-requests`               | Submit owner request     |
| GET    | `/owner-requests`               | View pending requests    |
| PATCH  | `/owner-requests/:id/approve`   | Approve a request        |
| PATCH  | `/owner-requests/:id/reject`    | Reject a request         |

### Admin
| Method | Endpoint        | Description         |
|--------|-----------------|---------------------|
| GET    | `/admin/users`  | View all users      |
| GET    | `/admin/listings` | View all listings |

---

## 🔐 Security

| Layer        | Measure                                      |
|--------------|----------------------------------------------|
| Auth         | JWT with expiry, bcrypt password hashing     |
| API          | Role-based middleware on every protected route |
| Database     | Parameterized queries (SQL injection prevention) |
| Input        | Validation on all request bodies             |
| Frontend     | Route guards + conditional rendering         |
| Session      | Auto-logout on token failure                 |

---

## ⚡ Performance

| Optimization     | Implementation                               |
|------------------|----------------------------------------------|
| DB connections   | Connection pooling — no raw per-request opens|
| API calls        | Debounced search input                       |
| Data fetching    | SWR caching on the frontend                  |
| Page loads       | Code splitting + lazy loading                |
| Results          | Pagination — avoids loading unnecessary data |

**Target:** Lighthouse Score ≥ 90 · Load time < 2s

---

## 🛠️ Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | Next.js (App Router), TypeScript, Tailwind CSS, SWR |
| Backend    | Node.js, Express                        |
| Database   | PostgreSQL                              |
| Auth       | JWT, bcrypt                             |
| Deployment | Vercel (frontend), separate backend host|

---

## 📁 Project Structure

```
RentalHub/
├── frontend/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom SWR hooks
│   └── lib/              # Auth helpers, API clients
│
├── backend/
│   ├── routes/           # Express route handlers
│   ├── middleware/        # Auth & role protection
│   ├── controllers/      # Business logic
│   └── db/               # DB pool & parameterized queries
│
├── database/
│   └── schema.sql        # Normalized PostgreSQL schema
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- npm or yarn

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_secret_key
```

### Installation

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd frontend && npm install
```

### Run in Development

```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev
```

### Database Setup

```bash
# Run the schema against your PostgreSQL instance
psql -U your_user -d your_db -f database/schema.sql
```

---

## 🗺️ Future Roadmap

| Feature                    | Priority |
|----------------------------|----------|
| 🔔 Real-time notifications  | High     |
| 🖼️ Image uploads (S3/Cloudinary) | High |
| 💳 Booking & payment flow  | Medium   |
| 📈 Audit logs & activity tracking | Medium |
| ⚙️ Microservices / scaling discussion | Low |

---

## 🧩 Design Decisions

**Controlled owner access** — Owner role is not self-assignable. Every promotion goes through admin review to prevent misuse and maintain platform trust.

**State-machine listing workflow** — A `status` enum with transition guards replaces naive boolean flags, keeping lifecycle logic predictable and extensible.

**Connection pooling** — Database connections are pooled rather than opened per-request, significantly improving performance under load.

**Parameterized queries** — All SQL uses placeholders instead of string interpolation, eliminating SQL injection risk.

**Transactional role promotion** — Owner approval updates both the request log and the user role in a single transaction, ensuring consistency.

---

<div align="center">

**RentalHub** — Built with architecture that scales, security that holds, and a codebase that's ready for production.

</div>
