# ─── Backend Dockerfile ───────────────────────────────────────────────────────
# Node.js Express API for Finatics.AI
# ──────────────────────────────────────────────────────────────────────────────

# ── Stage 1: deps ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy only package files first for layer-caching
COPY package*.json ./

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

# Copy application source
COPY . .

# Remove dev/test artifacts that don't belong in the image
RUN rm -rf test docs *.backup.js *.optimized.js

# Own everything as non-root user
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

# Use tini as the init process
ENTRYPOINT ["/sbin/tini", "--"]

# nodemon is fine for dev; in production use node directly
CMD ["node", "server.js"]
