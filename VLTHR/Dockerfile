# ALTHR Terminal — Next.js Frontend
# Runs the React/Next.js UI, served on port 3000.

FROM node:20-alpine AS base
WORKDIR /app

# ── Deps layer (cached unless package.json changes) ────────────────────────
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# ── Dev layer (hot reload via volume mount) ────────────────────────────────
FROM base AS dev
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ── Build layer ─────────────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── Runtime layer ───────────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_PUBLIC_BACKEND_URL=http://backend:4000

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => r.statusCode < 500 ? process.exit(0) : process.exit(1))"

CMD ["node", "server.js"]
