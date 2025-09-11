# Build stage
FROM node:22-alpine AS build
WORKDIR /app

# Install build dependencies with timeout and retry
RUN apk add --no-cache --timeout 300 python3 make g++ || \
    (sleep 10 && apk add --no-cache --timeout 300 python3 make g++)

# Copy package files first for better caching
COPY src/Web/package*.json ./

# Install dependencies with optimizations and timeout handling
RUN npm config set fetch-timeout 600000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci --only=production --no-audit --no-fund --timeout=600000 && \
    npm ci --only=development --no-audit --no-fund --timeout=600000

# Copy source code
COPY src/Web/ .

# Build arguments
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=2048 --max-semi-space-size=128"
ENV VITE_BUILD_TIMEOUT=600000

# Pre-build optimization with timeout and memory management
RUN timeout 600 npm run build -- --mode production || \
    (echo "Build timeout, retrying with reduced memory..." && \
     NODE_OPTIONS="--max-old-space-size=1024" timeout 900 npm run build -- --mode production)

# Production stage
FROM nginx:alpine AS final

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY src/Web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=build /app/dist /usr/share/nginx/html

# Create non-root user (nginx group already exists in nginx:alpine)
RUN adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx nginx || true

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]