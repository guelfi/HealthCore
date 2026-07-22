#!/usr/bin/env bash
set -Eeuo pipefail

: "${HEALTHCORE_DIR:?HEALTHCORE_DIR is required}"
: "${RELEASE_SHA:?RELEASE_SHA is required}"
: "${HEALTHCORE_ENV_FILE:?HEALTHCORE_ENV_FILE is required}"
RECONCILE_REMOTE_DIRTY="${RECONCILE_REMOTE_DIRTY:-false}"

cd "$HEALTHCORE_DIR"


if [[ -n "$(git status --porcelain)" ]]; then
  if [[ "$RECONCILE_REMOTE_DIRTY" != "true" ]]; then
    echo "HealthCore remote working tree is dirty; refusing deployment" >&2
    git status --short >&2
    exit 1
  fi

  dirty_paths="$(git status --porcelain | sed 's/^...//')"
  [[ "$dirty_paths" == $'src/Api/Dockerfile\nsrc/Api/Program.cs' ]] || {
    echo "Unexpected dirty paths; reconciliation refused" >&2
    printf '%s\n' "$dirty_paths" >&2
    exit 1
  }

  RECONCILIATION_DIR="/var/backups/healthcore/reconciliation/$(date -u +%Y%m%dT%H%M%SZ)"
  sudo install -d -m 700 "$RECONCILIATION_DIR"
  git diff --binary | sudo tee "$RECONCILIATION_DIR/working-tree.diff" >/dev/null
  git status --short | sudo tee "$RECONCILIATION_DIR/status.txt" >/dev/null
  sudo cp -p src/Api/Dockerfile src/Api/Program.cs "$RECONCILIATION_DIR/"
  sudo chmod 600 "$RECONCILIATION_DIR/working-tree.diff" "$RECONCILIATION_DIR/status.txt" "$RECONCILIATION_DIR/Dockerfile" "$RECONCILIATION_DIR/Program.cs"
  git restore --source=HEAD --staged --worktree -- src/Api/Dockerfile src/Api/Program.cs
  echo "Reconciled known OCI working-tree changes; backup: $RECONCILIATION_DIR"
fi

PREVIOUS_RELEASE_SHA="$(git rev-parse HEAD 2>/dev/null || true)"

git fetch origin main
git checkout main
git reset --hard "$RELEASE_SHA"
if [[ "$(git rev-parse HEAD)" != "$RELEASE_SHA" ]]; then
  echo "Remote commit does not match the approved release SHA" >&2
  exit 1
fi

BACKUP_DIR="/var/backups/healthcore"
RELEASE_METADATA_DIR="$BACKUP_DIR/releases"
CURRENT_RELEASE_FILE="$RELEASE_METADATA_DIR/current-release.sha"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_PATH="$BACKUP_DIR/healthcore-${STAMP}-${RELEASE_SHA:0:12}.db"
TEMP_BACKUP="/tmp/healthcore-${STAMP}.db"
sudo install -d -m 700 "$BACKUP_DIR"
API_CONTAINER="$(docker compose --env-file "$HEALTHCORE_ENV_FILE" ps -q healthcore-api | head -n 1)"
if [[ -n "$API_CONTAINER" ]] && docker inspect "$API_CONTAINER" >/dev/null 2>&1; then
  docker cp "$API_CONTAINER:/app/database/healthcore.db" "$TEMP_BACKUP"
  [[ -s "$TEMP_BACKUP" ]] || {
    rm -f "$TEMP_BACKUP"
    echo "HealthCore SQLite source is missing or empty; refusing deployment without a valid backup" >&2
    exit 1
  }
  sudo install -m 600 "$TEMP_BACKUP" "$BACKUP_PATH"
  rm -f "$TEMP_BACKUP"
else
  echo "HealthCore API service container is missing; refusing deployment without a database backup" >&2
  exit 1
fi
sudo test -s "$BACKUP_PATH" || { echo "SQLite backup was not created" >&2; exit 1; }

# Build before changing the running containers. The Nginx edit is restricted to
# the existing HealthCore upstream and is reverted if nginx validation fails.
docker compose --env-file "$HEALTHCORE_ENV_FILE" build healthcore-api healthcore-frontend

NGINX_CONF="/var/www/nginx/nginx.conf"
NGINX_BACKUP="${NGINX_CONF}.healthcore-${STAMP}.bak"
sudo cp -p "$NGINX_CONF" "$NGINX_BACKUP"

# A single-file bind mount keeps the old inode when the host file is replaced.
# Edit the mounted file in place and recreate only the shared Nginx proxy so the
# new configuration is actually loaded without touching any application project.
if grep -Fq 'set $upstream_healthcore_front http://healthcore-frontend:80;' "$NGINX_CONF"; then
  sudo sed -i 's#http://healthcore-frontend:80;#http://healthcore-frontend:8080;#' "$NGINX_CONF"
fi

if ! grep -Fq 'set $upstream_healthcore_front http://healthcore-frontend:8080;' "$NGINX_CONF"; then
  echo 'HealthCore Nginx upstream is not configured for port 8080' >&2
  sudo tee "$NGINX_CONF" < "$NGINX_BACKUP" >/dev/null
  exit 1
fi

# Keep IP-based access compatible with the API's production AllowedHosts.
# Scope these edits to HealthCore locations only; shared project routes remain untouched.
sudo sed -i '/location \/healthcore\/swagger {/,/^    }/ { s#proxy_pass http://healthcore-api:5000/swagger/;#proxy_pass http://healthcore-api:5000/healthcore-api/swagger/;#; s#proxy_set_header Host .*;#proxy_set_header Host healthcore.batuara.net;#; }' "$NGINX_CONF"
sudo sed -i '/location \/healthcore\/api\/ {/,/^    }/ s#proxy_set_header Host .*;#proxy_set_header Host healthcore.batuara.net;#' "$NGINX_CONF"

grep -Fq 'location /healthcore/swagger' "$NGINX_CONF" || {
  echo 'HealthCore Swagger Nginx route is missing' >&2
  sudo tee "$NGINX_CONF" < "$NGINX_BACKUP" >/dev/null
  exit 1
}
grep -Fq 'location /healthcore/api/' "$NGINX_CONF" || {
  echo 'HealthCore API Nginx route is missing' >&2
  sudo tee "$NGINX_CONF" < "$NGINX_BACKUP" >/dev/null
  exit 1
}

if ! docker run --rm --network none \
  -v "$NGINX_CONF:/etc/nginx/nginx.conf:ro" \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  -v /etc/ssl/hako:/etc/ssl/hako:ro \
  nginx:stable-alpine nginx -t; then
  sudo tee "$NGINX_CONF" < "$NGINX_BACKUP" >/dev/null
  exit 1
fi

recreate_nginx_proxy() {
  local previous_name="nginx-proxy-healthcore-previous"
  local network
  local networks=()

  while IFS= read -r network; do
    [[ -n "$network" ]] && networks+=("$network")
  done < <(docker inspect nginx-proxy --format '{{range $network, $_ := .NetworkSettings.Networks}}{{$network}}{{"\n"}}{{end}}')

  ((${#networks[@]} > 0)) || {
    echo 'Nginx proxy has no Docker networks; refusing recreation' >&2
    return 1
  }

  docker stop nginx-proxy
  docker rename nginx-proxy "$previous_name"

  restore_previous_nginx() {
    docker rm -f nginx-proxy >/dev/null 2>&1 || true
    docker rename "$previous_name" nginx-proxy
    docker start nginx-proxy >/dev/null
  }

  if ! docker create --name nginx-proxy --restart unless-stopped --network none \
      -p 80:80 -p 443:443 \
      -v "$NGINX_CONF:/etc/nginx/nginx.conf:ro" \
      -v /etc/letsencrypt:/etc/letsencrypt:ro \
      -v /etc/ssl/hako:/etc/ssl/hako:ro \
      nginx:stable-alpine nginx -g 'daemon off;'; then
    restore_previous_nginx
    return 1
  fi

  for network in "${networks[@]}"; do
    if ! docker network connect "$network" nginx-proxy; then
      restore_previous_nginx
      return 1
    fi
  done

  if ! docker start nginx-proxy >/dev/null || ! docker exec nginx-proxy nginx -t; then
    restore_previous_nginx
    return 1
  fi

  docker rm -f "$previous_name" >/dev/null
}

recreate_nginx_proxy

# A previous HealthCore compose project may have left the published frontend
# container behind under a different project name. Reclaim only containers that
# identify themselves as the HealthCore frontend before binding port 5005.
while IFS= read -r container_id; do
  [[ -n "$container_id" ]] || continue
  container_name="$(docker inspect --format '{{.Name}}' "$container_id" | sed 's#^/##')"
  compose_service="$(docker inspect --format '{{index .Config.Labels "com.docker.compose.service"}}' "$container_id")"
  if [[ "$compose_service" == "healthcore-frontend" || "$container_name" == "healthcore-frontend" || "$container_name" == healthcore-frontend-* || "$container_name" == healthcore-healthcore-frontend-* ]]; then
    docker rm -f "$container_id"
  else
    echo "Port 5005 is occupied by an unrelated container: $container_name" >&2
    exit 1
  fi
done < <(docker ps -aq --filter publish=5005)

docker compose --env-file "$HEALTHCORE_ENV_FILE" up -d --remove-orphans
docker exec nginx-proxy nginx -s reload

for attempt in $(seq 1 30); do
  if curl --fail --silent --show-error -H 'Host: healthcore.batuara.net' http://127.0.0.1:5000/health/live >/dev/null && \
     curl --fail --silent --show-error http://127.0.0.1:5005/health >/dev/null; then
    break
  fi
  if [[ "$attempt" == 30 ]]; then
    echo "HealthCore did not become healthy" >&2
    docker compose --env-file "$HEALTHCORE_ENV_FILE" ps
    frontend_container="$(docker compose --env-file "$HEALTHCORE_ENV_FILE" ps -q healthcore-frontend || true)"
    if [[ -n "$frontend_container" ]]; then
      docker logs --tail 100 "$frontend_container" >&2 || true
      docker exec "$frontend_container" nginx -t >&2 || true
    fi
    exit 1
  fi
  sleep 2
done

batuara_status="$(curl --fail --silent --show-error --output /dev/null --write-out '%{http_code}' --max-time 15 https://batuara.org.br/)"
[[ "$batuara_status" == "200" ]] || { echo "Batuara.net public check failed: $batuara_status" >&2; exit 1; }

healthcore_status="$(curl --fail --silent --show-error --insecure --output /dev/null --write-out '%{http_code}' --max-time 15 https://127.0.0.1/healthcore/)"
[[ "$healthcore_status" == "200" ]] || { echo "HealthCore Nginx route failed: $healthcore_status" >&2; exit 1; }

healthcore_ip_status="$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' --max-time 15 -H 'Host: 129.153.86.168' http://127.0.0.1/healthcore/)"
[[ "$healthcore_ip_status" == "200" ]] || { echo "HealthCore IP route failed: $healthcore_ip_status" >&2; exit 1; }

healthcore_swagger_status="$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' --max-time 15 -H 'Host: 129.153.86.168' http://127.0.0.1/healthcore/swagger/)"
[[ "$healthcore_swagger_status" == "200" ]] || { echo "HealthCore Swagger route failed: $healthcore_swagger_status" >&2; exit 1; }

sudo install -d -m 700 "$RELEASE_METADATA_DIR"
printf '%s\n' "$RELEASE_SHA" | sudo tee "$CURRENT_RELEASE_FILE" >/dev/null
printf '%s\n' "$RELEASE_SHA" | sudo tee "$RELEASE_METADATA_DIR/$STAMP.sha" >/dev/null
if [[ -n "$PREVIOUS_RELEASE_SHA" && "$PREVIOUS_RELEASE_SHA" != "$RELEASE_SHA" ]]; then
  printf '%s\n' "$PREVIOUS_RELEASE_SHA" | sudo tee "$RELEASE_METADATA_DIR/previous-release.sha" >/dev/null
fi

echo "HealthCore release $RELEASE_SHA deployed"
echo "SQLite backup: $BACKUP_PATH"
echo "Previous release: ${PREVIOUS_RELEASE_SHA:-unknown}"
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep -E 'batuara-net|healthcore|nginx-proxy' || true
