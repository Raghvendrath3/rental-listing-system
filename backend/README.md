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

The application exposes a health endpoint for monitoring and deployment validation:

GET /health

Returns a simple status response indicating the service is running.

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

