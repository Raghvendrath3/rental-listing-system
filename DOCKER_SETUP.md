# 🐳 Rental Hub — Docker Setup & Operations Guide

## Overview
This document provides step-by-step instructions for building, running, and managing the Rental Hub application using Docker Compose.

**Key Services:**
- **PostgreSQL 16**: Relational database with initialization script
- **Express.js Backend**: REST API on port 5000
- **Next.js Frontend**: React application on port 3000

---

## Prerequisites

1. **Docker Desktop** installed and running
2. **.env.docker** file configured with environment variables (see `.env.example`)
3. **Project Structure:**
   ```
   rentalhub/
   ├── backend/
   │   ├── Dockerfile
   │   ├── src/
   │   └── package.json
   ├── frontend/
   │   ├── Dockerfile
   │   ├── app/
   │   └── package.json
   ├── docker-compose.yml
   ├── .env.docker
   └── database_schema.sql
   ```

---

## Environment Configuration

### 1. Create `.env.docker` File
Copy from `.env.example` and populate with your values:

```bash
# PostgreSQL credentials
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=rental_system

# Backend configuration
PORT=5000
NODE_ENV=production
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=rental_system
JWT_SECRET=your_jwt_secret_here

# Frontend configuration
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

**Important Notes:**
- `DB_HOST=db` references the PostgreSQL service name in docker-compose.yml
- Environment variables in `.env.docker` must be passed via `--env-file` flag
- Special characters in values (like `$` in JWT secrets) must be escaped with `\$`

---

## Step-by-Step Commands

### Step 1: Build All Images
```bash
docker compose -f docker-compose.yml --env-file .env.docker build
```

**What it does:**
- Builds Docker images for backend and frontend services
- Downloads base images (node:20-alpine, postgres:16-alpine)
- Installs dependencies (npm/npm ci)
- Compiles Next.js frontend to standalone bundle
- Creates layer cache for faster rebuilds

**Output:** Two images: `rentalhub-backend` and `rentalhub-frontend`

---

### Step 2: Start All Services
```bash
docker compose -f docker-compose.yml --env-file .env.docker up
```

**What it does:**
- Starts PostgreSQL container with initialized schema
- Waits for database to be healthy (healthcheck)
- Starts Express.js backend on port 5000
- Starts Next.js frontend on port 3000
- Creates isolated network for container communication

**Expected Output:**
```
[+] Running 3/3
  ✔ rentalhub_db is healthy
  ✔ rentalhub_backend is running
  ✔ rentalhub_frontend is running
```

**Access the application:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- API: `http://localhost:5000/api/v1`

---

### Step 3: Build and Start (Combined)
```bash
docker compose -f docker-compose.yml --env-file .env.docker up --build
```

**What it does:**
- Rebuilds images before starting containers
- Use this when you've modified Dockerfile or dependencies
- Faster than separate `build` and `up` commands

**When to use:**
- After updating `package.json`
- After modifying Dockerfile
- After pulling latest code changes

---

### Step 4: View Logs
```bash
docker compose -f docker-compose.yml --env-file .env.docker logs -f
```

**Flags:**
- `-f` (follow): Stream logs in real-time
- `--tail 50`: Show last 50 lines
- `service_name`: Logs for specific service (e.g., `backend`, `frontend`, `db`)

**Examples:**
```bash
# View only backend logs
docker compose -f docker-compose.yml --env-file .env.docker logs -f backend

# View last 100 lines of database logs
docker compose -f docker-compose.yml --env-file .env.docker logs --tail 100 db

# View all logs without following
docker compose -f docker-compose.yml --env-file .env.docker logs
```

---

### Step 5: Stop Services (Without Removing Data)
```bash
docker compose -f docker-compose.yml --env-file .env.docker stop
```

**What it does:**
- Gracefully stops all running containers
- Preserves data in named volumes (postgres_data)
- Containers can be restarted with `up`

**When to use:**
- Temporary shutdown
- Maintenance work
- Freeing up resources

---

### Step 6: Stop and Remove Services (Keep Data)
```bash
docker compose -f docker-compose.yml --env-file .env.docker down
```

**What it does:**
- Stops all containers
- Removes containers and networks
- Preserves named volumes (database data persists)

**When to use:**
- End of development session
- Clean restart

---

### Step 7: Full Cleanup (Remove Everything)
```bash
docker compose -f docker-compose.yml --env-file .env.docker down -v
```

**Flags:**
- `-v` (volumes): Remove named volumes (database data WILL BE DELETED)
- `--remove-orphans`: Remove containers not defined in compose file

**What it does:**
- Stops and removes all containers
- Removes networks
- **DELETES DATABASE DATA** (postgres_data volume)

**⚠️ WARNING:** Use only when you want a fresh database. Data cannot be recovered.

---

### Step 8: Restart Services
```bash
docker compose -f docker-compose.yml --env-file .env.docker restart
```

**What it does:**
- Stops all containers
- Starts them again with same configuration
- Preserves all data

**When to use:**
- Apply environment variable changes
- Recover from application errors
- Restart individual service: `restart backend`

---

### Step 9: View Running Containers
```bash
docker compose -f docker-compose.yml ps
```

**Output shows:**
- Container names
- Status (running, exited, unhealthy)
- Port mappings
- Resource usage

---

### Step 10: Execute Commands in Running Container
```bash
docker compose -f docker-compose.yml --env-file .env.docker exec backend npm run test
docker compose -f docker-compose.yml --env-file .env.docker exec db psql -U postgres -d rental_system
```

**What it does:**
- Runs a command inside a running container
- No need to stop/restart
- Useful for debugging or running migrations

---

## Troubleshooting

### Database Won't Connect
```bash
# Check database logs
docker compose -f docker-compose.yml --env-file .env.docker logs db

# Verify connection from backend
docker compose -f docker-compose.yml --env-file .env.docker exec backend \
  nc -zv db 5432
```

### Frontend Can't Reach Backend
```bash
# Check backend is running
docker compose -f docker-compose.yml ps

# Check backend logs
docker compose -f docker-compose.yml --env-file .env.docker logs backend

# Verify NEXT_PUBLIC_API_URL in .env.docker
```

### Container Exits Immediately
```bash
# Check specific service logs
docker compose -f docker-compose.yml --env-file .env.docker logs backend

# Common causes:
# - Missing environment variables
# - Port already in use
# - Database connection failed
```

### Port Already in Use
```bash
# Change port in .env.docker (e.g., FRONTEND_PORT=3001)
# Or find process using the port:
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows
```

---

## Common Workflows

### Development Setup (Fresh Start)
```bash
# Initial setup
docker compose -f docker-compose.yml --env-file .env.docker up --build

# In another terminal, watch logs
docker compose -f docker-compose.yml --env-file .env.docker logs -f
```

### After Code Changes
```bash
# Option 1: Rebuild and restart
docker compose -f docker-compose.yml --env-file .env.docker up --build

# Option 2: Just restart (if no dependency changes)
docker compose -f docker-compose.yml --env-file .env.docker restart backend
```

### Reset Database (Keep Application Running)
```bash
docker compose -f docker-compose.yml --env-file .env.docker down -v
docker compose -f docker-compose.yml --env-file .env.docker up
```

### Check Database Schema
```bash
docker compose -f docker-compose.yml --env-file .env.docker exec db \
  psql -U postgres -d rental_system -c "\dt"
```

---

## Docker Compose File Structure

**Services:**
1. **db** - PostgreSQL 16 Alpine
   - Volume: `postgres_data` (persists database)
   - Init script: `database_schema.sql`
   - Healthcheck: Verifies PG is accepting connections
   - Network: `rental_net`

2. **backend** - Express.js API
   - Multi-stage build (reduces image size)
   - Node 20 Alpine
   - Depends on: `db` (waits for healthcheck)
   - Network: `rental_net`

3. **frontend** - Next.js React App
   - Multi-stage build (base → builder → runner)
   - Node 20 Alpine
   - Depends on: `backend`
   - Network: `rental_net`

**Volumes:**
- `postgres_data`: Persists PostgreSQL data between restarts

**Networks:**
- `rental_net`: Bridge network for container-to-container communication

---

## Performance Tips

1. **Multi-stage Builds**: Reduces final image size
   - Base stage: Dependencies only
   - Builder stage: Compilation
   - Runner stage: Final production image

2. **Layer Caching**: Docker caches build layers
   - Put frequently changing code at the end
   - Stable dependencies at the beginning

3. **Alpine Images**: Minimal base images (~5MB vs 900MB)
   - Smaller images = faster pulls and starts
   - Used for all services

4. **Health Checks**: Backend waits for DB to be ready
   - `depends_on: condition: service_healthy`
   - Prevents connection errors

---

## Version Info

- PostgreSQL: 16-alpine
- Node.js: 20-alpine (frontend & backend)
- Next.js: 16.2.6
- Express: Latest (from package.json)
- Docker Compose: v3.8+

---

## References

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker CLI Reference](https://docs.docker.com/reference/cli/docker/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Node.js Docker Image](https://hub.docker.com/_/node)
