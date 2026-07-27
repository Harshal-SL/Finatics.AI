# ─── Frontend Dockerfile ──────────────────────────────────────────────────────
# Vite + React app for Finatics.AI
# Built as a static bundle and served by Vite preview
# ──────────────────────────────────────────────────────────────────────────────

# ── Stage 1: builder ───────────────────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

COPY package.json ./
COPY .npmrc* ./

# Intentionally NOT copying package-lock.json — it was generated on Windows
# and omits Linux-specific optional deps (@rollup/rollup-linux-x64-gnu).
# A fresh install resolves the correct platform binaries.
RUN npm install

COPY . .

# VITE_ env vars are baked in at build time
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_URL
ARG VITE_FRONTEND_URL
ARG VITE_PAYPAL_CLIENT_ID

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_API_URL=$VITE_API_URL \
    VITE_FRONTEND_URL=$VITE_FRONTEND_URL \
    VITE_PAYPAL_CLIENT_ID=$VITE_PAYPAL_CLIENT_ID

RUN npm run build

# ── Stage 2: serve with vite preview ──────────────────────────────────────────
FROM node:20-slim AS runtime

WORKDIR /app

# Only copy what's needed to run vite preview
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/vite.config.* ./

EXPOSE 4173

CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "4173"]
