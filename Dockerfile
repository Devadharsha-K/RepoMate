# ── Build stage ──────────────────────────────────────────────────────
# Using a single-stage build: the app has no compile/transpile step,
# so there's nothing to separate out. Alpine keeps the image small.
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy dependency manifests first so Docker can cache this layer.
# The image layer is only rebuilt when package.json or package-lock.json change.
COPY package.json package-lock.json ./

# Install production dependencies only (no devDependencies)
RUN npm ci --omit=dev

# Copy the rest of the source code
COPY server.js ./
COPY public ./public

# Tell Node.js we're in production
ENV NODE_ENV=production

# The app listens on 3000 by default; document that here.
# The actual port can be overridden at runtime via the PORT env var.
EXPOSE 3000

# Run as non-root for better security
USER node

CMD ["node", "server.js"]
