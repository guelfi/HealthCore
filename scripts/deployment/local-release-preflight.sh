#!/usr/bin/env bash
set -Eeuo pipefail

# Local-only release preflight. It never connects to OCI and never deletes volumes.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

: "${HEALTHCORE_JWT_KEY:?Set a temporary validation key in the environment}"

command -v docker >/dev/null 2>&1 || { echo "docker is required" >&2; exit 1; }
command -v curl >/dev/null 2>&1 || { echo "curl is required" >&2; exit 1; }

docker compose config --quiet

docker compose build healthcore-api healthcore-frontend
docker compose up -d healthcore-api healthcore-frontend

for attempt in $(seq 1 30); do
  if curl --fail --silent --show-error -H 'Host: healthcore.batuara.net' http://127.0.0.1:5000/health/live >/dev/null && \
     curl --fail --silent --show-error http://127.0.0.1:5005/health >/dev/null; then
    break
  fi
  if [[ "$attempt" == 30 ]]; then
    echo "HealthCore services did not become healthy" >&2
    docker compose ps
    exit 1
  fi
  sleep 2
done

status=$(curl --silent --output /dev/null --write-out '%{http_code}' http://127.0.0.1:5005/api/v1/pacientes)
[[ "$status" == "401" ]] || { echo "Expected protected route to return 401, got $status" >&2; exit 1; }

echo "HealthCore local release preflight passed"
docker compose ps