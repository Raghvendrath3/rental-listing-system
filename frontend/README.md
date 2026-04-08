# RentalHub Frontend

Professional real estate rental listing platform built with Next.js 16, React 19, and Tailwind CSS. This is a modern, full-featured web application for browsing rental listings and managing properties.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [Documentation](#documentation)

## Features

### User Features
- Browse published rental listings with advanced filtering
- Filter by city, property type, and price range
- Responsive design optimized for mobile, tablet, and desktop
- Secure JWT-based authentication

### Owner Features
- Create and manage property listings
- Publish listings to make visible to users
- Archive listings to hide from public view
- Update listing details and pricing

### Admin Features
- View all listings (including drafts and archived)
- Manage all users and their roles
- View system statistics and metrics

### Security & Reliability
- JWT token-based authentication
- Content Security Policy (CSP) headers
- Role-based access control (RBAC)
- Input validation with Zod schemas
- Comprehensive error handling

## Tech Stack

- **Next.js 16**: React framework with App Router
- **React 19**: UI library with latest features
- **TypeScript**: Type-safe development
- **Tailwind CSS v4**: Utility-first CSS framework
- **Zod**: Schema validation
- **SWR**: Data fetching and caching

## Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0 or pnpm >= 8.0.0

### Setup

```bash
# Clone repository
git clone https://github.com/Raghvendrath3/rental-listing-system.git
cd rental-listing-system/frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev
```

Visit `http://localhost:3000`

## Project Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── auth/                 # Auth pages (login, register)
│   ├── dashboard/            # Protected dashboard routes
│   ├── layout.tsx            # Root layout with providers
│   └── page.tsx              # Home/landing page
├── components/               # Reusable React components
│   ├── common/               # Shared components
│   ├── dashboard/            # Dashboard components
│   ├── forms/                # Form components
│   ├── home/                 # Landing page sections
│   ├── listings/             # Listing components
│   ├── Toast/                # Notifications
│   └── Navbar.tsx            # Navigation bar
├── contexts/                 # React Context providers
├── hooks/                    # Custom React hooks
├── lib/                      # Utilities and helpers
├── config/                   # Configuration
├── types/                    # TypeScript type definitions
├── public/                   # Static assets
├── middleware.ts             # Security headers
├── next.config.ts            # Next.js config
└── package.json              # Dependencies
```

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run linter
```

### Coding Standards

- Use TypeScript (strict mode)
- Functional components with hooks
- Tailwind CSS for styling
- Zod for validation

## Building for Production

```bash
npm run build
npm run start
```

Verify:
- No console errors
- Pages load quickly
- All features work

## Deployment

Deploy to Vercel:

```bash
npm install -g vercel
vercel deploy --prod
```

See [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed instructions.

## Documentation

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development guidelines
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Application architecture
- **[SECURITY.md](./SECURITY.md)** - Security implementation
- **[../DEPLOYMENT.md](../DEPLOYMENT.md)** - Production deployment
- **[../API_TESTING.md](../API_TESTING.md)** - API testing guide

## Environment Variables

Required variables in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

See `.env.example` for all available variables.

## Support

- GitHub Issues: Report bugs
- Email: support@rentalhub.com
- Documentation: See docs folder
