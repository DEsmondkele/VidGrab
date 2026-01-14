# Multi-stage Dockerfile for VidGrab server

# Builder stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps (including dev deps for building client)
COPY package.json package-lock.json ./
RUN npm ci

# Copy everything and build (this runs Next build for client and bundles the server)
COPY . .
RUN npm run build

# Runner stage (production)
# Use Debian-based slim image for more reliable system packages
FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install Python, pip, and ffmpeg; then install yt-dlp
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 python3-pip ffmpeg ca-certificates \
 && pip3 install --no-cache-dir -U yt-dlp \
 && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
 && rm -rf /var/lib/apt/lists/*

# Copy built server and client artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/.next ./client/.next
COPY --from=builder /app/client/public ./client/public

# Copy package metadata and install production deps only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

EXPOSE 5000
CMD ["npm", "run", "start"]
