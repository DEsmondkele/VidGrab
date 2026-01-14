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
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install Python, pip, and ffmpeg; then install yt-dlp
RUN apk add --no-cache python3 py3-pip ffmpeg \
 && pip3 install --no-cache-dir -U yt-dlp \
 && rm -rf /var/cache/apk/*

# Copy built server and client artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/.next ./client/.next
COPY --from=builder /app/client/public ./client/public

# Copy package metadata and install production deps only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

EXPOSE 5000
CMD ["npm", "run", "start"]
