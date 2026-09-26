# ─── Finatics.AI Backend Dockerfile (Root build context) ───────────────────────
# Node.js Express API for Finatics.AI
# ──────────────────────────────────────────────────────────────────────────────

# ── Stage 1: deps ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy only backend package files first for layer-caching
COPY backend/package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# ── Stage 2: runtime ───────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

# Add tini for proper PID-1 signal handling
RUN apk add --no-cache tini

WORKDIR /app

# Create a non-root user to run the app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source from backend
COPY backend/ .

# Remove dev/test artifacts that don't belong in the image
RUN rm -rf test docs *.backup.js *.optimized.js

# Own everything as non-root user
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

# Use tini as the init process
ENTRYPOINT ["/sbin/tini", "--"]

# Run production server
CMD ["node", "server.js"]
