# ==============================================================================
# 🔙 RENTAL HUB — BACKEND API PRODUCTION DOCKERFILE (Express Multi-stage)
# ==============================================================================

# --- 1. BUILD/DEPENDENCY STAGE ---
FROM node:20-alpine AS base
WORKDIR /usr/src/app

COPY package*.json ./

# Install all dependencies (dev & prod) for integrity checks
RUN npm ci

# Copy source code for linting/testing validation
COPY . .

# --- 2. RUNNER STAGE ---
FROM node:18-alpine AS runner
WORKDIR /usr/src/app

# Production environment presets
ENV NODE_ENV=production
ENV PORT=5000

# Install ONLY production dependencies (excludes jest, supertest, nodemon)
COPY package*.json ./
RUN npm ci --omit=dev --silent

# Copy only runtime code files (src folder)
COPY ./src ./src

# Apply non-root node permissions to application directory
RUN chown -R node:node /usr/src/app
USER node

EXPOSE 5000

# Server bootstrapper
CMD ["npm", "start"]
