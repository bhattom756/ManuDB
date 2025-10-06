# Multi-stage build for production
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install backend dependencies (without postinstall script)
WORKDIR /app/backend
RUN npm ci --only=production --ignore-scripts

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm ci

# Build frontend
FROM base AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy backend dependencies
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY backend/ ./backend/

# Copy built frontend
COPY --from=frontend-builder /app/dist ./frontend/dist

# Run database setup for production
RUN cd backend && npm run prod-setup || echo "Database setup will run on first start"

# Set ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node backend/healthcheck.js

# Start the application
CMD ["node", "backend/server.js"]
