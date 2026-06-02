# ==============================================================================
# 🚀 RENTAL HUB — FRONTEND PRODUCTION DOCKERFILE (Next.js Multi-stage)
# ==============================================================================

# --- 1. DEPENDENCY STAGE ---
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install dependencies (including devDependencies for build engines)
RUN npm ci

# --- 2. BUILDER STAGE ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from stage 1
COPY --from=base /app/node_modules ./node_modules
COPY . .

# Environment variables needed at BUILD TIME (baked into static JS client-side bundles)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Compile Next.js to standalone release
RUN npm run build

# --- 3. RUNNER STAGE ---
FROM node:20-alpine AS runner
WORKDIR /app

# Production environment configurations
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Run container process under non-privileged system user for protection
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy essential runtime files traced by Next.js standalone engine
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Standalone server starter
CMD ["node", "server.js"]
