# RentalHub - Rental Listing System

A production-grade full-stack rental marketplace platform with role-based access control, advanced search capabilities, and an admin-controlled owner onboarding workflow.

**Status:** Fully Implemented | Production Ready | All Features Complete

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [API Endpoints](#api-endpoints)
6. [Database Schema](#database-schema)
7. [Deployment](#deployment)
8. [Development](#development)

## Features

- **User Authentication** - JWT-based login with bcrypt password hashing and 1-hour token expiry
- **Role-Based Access Control** - Three roles (user, owner, admin) with middleware-enforced permissions
- **Listing Management** - Full CRUD with state machine (draft → published → archived)
- **Advanced Search & Filtering** - Filter by keyword, city, price range, property type with pagination
- **Owner Request Workflow** - Controlled onboarding: users request owner status, admins approve/reject
- **Role-Based Dashboards** - Separate views for users, owners, and admins
- **Database Security** - Parameterized queries prevent SQL injection
- **Connection Pooling** - Optimized database performance under load

## Tech Stack

| Layer      | Technology |
|------------|-----------|
| Frontend   | Next.js (App Router) 16.1.6, React 19.2.3, TypeScript, Tailwind CSS |
| Backend    | Node.js, Express 4.18, PostgreSQL driver |
| Database   | PostgreSQL (via Supabase) |
| Auth       | JWT, bcrypt |
| Hosting    | Vercel (frontend), configurable backend |

## Project Structure

```
rental-listing-system/
├── frontend/               # Next.js application
│   ├── app/               # Pages and layouts
│   ├── components/        # Reusable React components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # API client, utilities
│   └── package.json
│
├── backend/               # Express API server
│   ├── src/
│   │   ├── routes/        # API route definitions
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── repositories/  # Data access layer
│   │   ├── middleware/    # Auth & authorization
│   │   └── config/        # Database configuration
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js v18+ and npm
- Supabase account with PostgreSQL database
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/Raghvendrath3/rental-listing-system.git
cd rental-listing-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Configuration

**Backend** (`backend/.env`):
```
DB_HOST=your_supabase_host
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=postgres
JWT_SECRET=your_jwt_secret
PORT=3000
```

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Running Locally

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

Visit `http://localhost:3000` in your browser.

## API Endpoints

### Authentication
- `POST /users` - Register new user
- `POST /users/login` - Login
- `GET /users/profile` - Get user profile

### Listings
- `GET /listings` - Get all listings (with filters)
- `GET /listings/:id` - Get listing by ID
- `POST /listings` - Create listing (owner required)
- `PATCH /listings/:id` - Update listing (owner required)
- `DELETE /listings/:id` - Delete listing (owner required)
- `PATCH /listings/:id/publish` - Publish listing (owner required)
- `PATCH /listings/:id/archive` - Archive listing (owner required)

### Owner Requests
- `POST /owner-requests` - Submit owner request
- `GET /owner-requests/check` - Check user's pending request
- `GET /owner-requests` - View all requests (admin only)
- `PATCH /owner-requests/:id/approve` - Approve request (admin only)
- `PATCH /owner-requests/:id/reject` - Reject request (admin only)

### Admin
- `GET /users/admin` - Get all users with pagination (admin only)
- `PATCH /users/:id/role` - Update user role (admin only)
- `DELETE /users/:id` - Delete user (admin only)
- `GET /admin/stats` - Get platform statistics (admin only)

## Database Schema

Core tables:
- `users` - User accounts with roles (user, owner, admin)
- `listings` - Rental listings with status and pricing
- `owner_requests` - Pending owner requests with approval workflow

See database schema in Supabase console or documentation files.

## Deployment

### Frontend (Vercel)
```bash
# One-click deployment via Vercel dashboard or:
vercel deploy --prod
```

### Backend
Deploy Node.js backend to Render, Railway, or your preferred platform.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Development

### API Testing
See [API_TESTING.md](./API_TESTING.md) for comprehensive testing procedures.

### Running Tests
```bash
npm test
```

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting

## License

MIT License - See LICENSE file

## Support

For issues and questions, open an issue on GitHub.
