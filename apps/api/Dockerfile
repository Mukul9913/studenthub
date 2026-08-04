# ==============================================================================
# StudentHub API Production Multi-Stage Dockerfile
# Stage 1: Builder & Dependency Pruning
# Stage 2: Minimal Non-Root Production Runtime
# ==============================================================================

# ------------------------------------------------------------------------------
# STAGE 1: Builder
# ------------------------------------------------------------------------------
FROM node:22-alpine AS builder

# Set working directory for monorepo build context
WORKDIR /app

# Enable Corepack and activate fixed pnpm version matching package.json
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy root monorepo manifests and configuration files first (for layer caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./

# Copy internal packages and target API application
COPY packages/types ./packages/types
COPY apps/api ./apps/api

# Install all workspace dependencies (including devDependencies for compilation)
RUN pnpm install --frozen-lockfile

# Build TypeScript contracts and API server bundles
RUN pnpm --filter @studenthub/api... build

# Deploy isolated production bundle (prunes devDependencies and bundles workspace packages)
RUN pnpm --filter @studenthub/api deploy --prune /app/deploy

# ------------------------------------------------------------------------------
# STAGE 2: Production Runner
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner

# Install curl for container Healthcheck (security hardened with no-cache)
RUN apk add --no-cache curl

# Set working directory for production application
WORKDIR /app

# Copy pruned production deployment bundle from builder stage
COPY --from=builder /app/deploy ./

# Ensure file ownership belongs to the built-in non-root 'node' user
RUN chown -R node:node /app

# Security Hardening: Switch execution context from root to non-privileged user 'node'
USER node

# Production Environment Variables (Defaults, configurable at container runtime)
ENV NODE_ENV=production \
    PORT=5000 \
    API_PREFIX=/api \
    LOG_LEVEL=info

# Expose HTTP service port
EXPOSE 5000

# Container Healthcheck verifying application responsiveness and MongoDB status
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:${PORT:-5000}/api/health || exit 1

# Launch production server via Node.js runtime
CMD ["node", "dist/server.js"]
