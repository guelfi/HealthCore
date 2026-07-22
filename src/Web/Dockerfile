FROM node:22-alpine AS build
WORKDIR /app

RUN apk add --no-cache python3 make g++
COPY src/Web/package*.json ./
RUN npm ci --no-audit --no-fund

COPY src/Web/ ./
ARG VITE_API_URL
ARG VITE_BASE_PATH=/healthcore/
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BASE_PATH=$VITE_BASE_PATH
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npm run build -- --mode production

FROM nginx:alpine AS final
RUN apk add --no-cache curl
COPY src/Web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

RUN adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx nginx || true
RUN sed -i -E -e 's#pid[[:space:]]+/var/run/nginx.pid;#pid /tmp/nginx.pid;#' -e 's#pid[[:space:]]+/run/nginx.pid;#pid /tmp/nginx.pid;#' -e 's#pid[[:space:]]+/var/cache/nginx/nginx.pid;#pid /tmp/nginx.pid;#' /etc/nginx/nginx.conf && chmod 1777 /tmp && chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d
RUN nginx -t && rm -f /tmp/nginx.pid

USER nginx

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3   CMD curl -f http://localhost:8080/health || exit 1

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]