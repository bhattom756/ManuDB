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
WORKDIR /app/frontend
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
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy startup script
COPY start.sh ./
RUN chmod +x start.sh

# Set ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port (Railway will set PORT automatically)
EXPOSE $PORT

# Health check (Railway handles this automatically)
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD node backend/healthcheck.js

# Start the application
CMD ["./start.sh"]
