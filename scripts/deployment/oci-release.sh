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
  sudo chmod 600 "$RECONCILIATION_DIR"/*
  git restore --source=HEAD --staged --worktree -- src/Api/Dockerfile src/Api/Program.cs
  echo "Reconciled known OCI working-tree changes; backup: $RECONCILIATION_DIR"
fi

git fetch origin main
git checkout main
git pull --ff-only origin main
if [[ "$(git rev-parse HEAD)" != "$RELEASE_SHA" ]]; then
  echo "Remote commit does not match the approved release SHA" >&2
  exit 1
fi

BACKUP_DIR="/var/backups/healthcore"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_PATH="$BACKUP_DIR/healthcore-${STAMP}-${RELEASE_SHA:0:12}.db"
mkdir -p "$BACKUP_DIR"
if docker inspect healthcore-api >/dev/null 2>&1; then
  docker cp healthcore-api:/app/database/healthcore.db "$BACKUP_PATH"
  chmod 600 "$BACKUP_PATH"
fi

# Build before changing the running containers. The Nginx edit is restricted to
# the existing HealthCore upstream and is reverted if nginx validation fails.
docker compose --env-file "$HEALTHCORE_ENV_FILE" build healthcore-api healthcore-frontend

NGINX_CONF="/var/www/nginx/nginx.conf"
NGINX_BACKUP="${NGINX_CONF}.healthcore-${STAMP}.bak"
if grep -Fq 'set $upstream_healthcore_front http://healthcore-frontend:80;' "$NGINX_CONF"; then
  sudo cp -p "$NGINX_CONF" "$NGINX_BACKUP"
  sudo sed -i 's#http://healthcore-frontend:80;#http://healthcore-frontend:8080;#' "$NGINX_CONF"
fi

if ! grep -Fq 'set $upstream_healthcore_front http://healthcore-frontend:8080;' "$NGINX_CONF"; then
  echo 'HealthCore Nginx upstream is not configured for port 8080' >&2
  if [[ -f "$NGINX_BACKUP" ]]; then sudo cp -p "$NGINX_BACKUP" "$NGINX_CONF"; fi
  exit 1
fi

if ! docker exec nginx-proxy nginx -t; then
  if [[ -f "$NGINX_BACKUP" ]]; then sudo cp -p "$NGINX_BACKUP" "$NGINX_CONF"; fi
  exit 1
fi

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
    exit 1
  fi
  sleep 2
done

batuara_status="$(curl --fail --silent --show-error --output /dev/null --write-out '%{http_code}' --max-time 15 https://batuara.org.br/)"
[[ "$batuara_status" == "200" ]] || { echo "Batuara.net public check failed: $batuara_status" >&2; exit 1; }

healthcore_status="$(curl --fail --silent --show-error --insecure --output /dev/null --write-out '%{http_code}' --max-time 15 https://127.0.0.1/healthcore/)"
[[ "$healthcore_status" == "200" ]] || { echo "HealthCore Nginx route failed: $healthcore_status" >&2; exit 1; }

echo "HealthCore release $RELEASE_SHA deployed"
echo "SQLite backup: $BACKUP_PATH"
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep -E 'batuara-net|healthcore|nginx-proxy' || true