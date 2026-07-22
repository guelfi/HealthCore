#!/usr/bin/env bash
set -Eeuo pipefail

: "\${HEALTHCORE_DIR:?HEALTHCORE_DIR is required}"
: "\${ACTION:?ACTION is required}"
: "\${HEALTHCORE_ENV_FILE:?HEALTHCORE_ENV_FILE is required}"

BACKUP_DIR="/var/backups/healthcore"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
METADATA_DIR="$BACKUP_DIR/releases"
cd "$HEALTHCORE_DIR"

health_ok() {
  curl --fail --silent --show-error -H 'Host: healthcore.batuara.net' http://127.0.0.1:5000/health/live >/dev/null &&
    curl --fail --silent --show-error http://127.0.0.1:5005/health >/dev/null
}

wait_for_health() {
  for attempt in $(seq 1 30); do
    if health_ok; then
      return 0
    fi
    sleep 2
  done
  return 1
}

assert_batuara() {
  local status
  status="$(curl --fail --silent --show-error --output /dev/null --write-out '%{http_code}' --max-time 15 https://batuara.org.br/)"
  [[ "$status" == "200" ]] || { echo "Batuara.net public check failed: $status" >&2; return 1; }
  docker ps --filter name=batuara-net-api --filter health=healthy --format '{{.Names}}' | grep -qx batuara-net-api
  docker ps --filter name=batuara-net-public-website --filter health=healthy --format '{{.Names}}' | grep -qx batuara-net-public-website
  docker ps --filter name=batuara-net-db --filter health=healthy --format '{{.Names}}' | grep -qx batuara-net-db
}

latest_backup() {
  sudo find "$BACKUP_DIR" -maxdepth 1 -type f -name 'healthcore-*.db' -printf '%T@ %p\n' |
    sort -nr |
    awk 'NR == 1 { sub(/^[^ ]+ /, ""); print }'
}

validate_backup() {
  local source="$1"
  sudo test -s "$source" || { echo "SQLite backup is missing or empty: $source" >&2; return 1; }
  [[ "$(sudo stat -c '%a' "$source")" == "600" ]] || { echo "SQLite backup permissions are not 600: $source" >&2; return 1; }

  local restore_dir="$BACKUP_DIR/recovery/$STAMP"
  local restored="$restore_dir/restored.db"
  sudo install -d -m 700 "$restore_dir"
  sudo install -m 600 "$source" "$restored"

  docker run --rm --pull=missing -v "$restored:/restore.db:ro" python:3.12-alpine \
    python -c 'import sqlite3; db = sqlite3.connect("/restore.db"); result = db.execute("PRAGMA integrity_check").fetchone()[0]; assert result == "ok", result; print("SQLite integrity:", result); db.close()'

  echo "SQLite backup restored and validated in isolation: $restored"
}

make_backup() {
  local target="$BACKUP_DIR/recovery/$STAMP/current.db"
  sudo install -d -m 700 "$BACKUP_DIR/recovery/$STAMP"
  docker cp healthcore-api:/app/database/healthcore.db /tmp/healthcore-recovery.db
  sudo install -m 600 /tmp/healthcore-recovery.db "$target"
  rm -f /tmp/healthcore-recovery.db
  [[ -s "$target" ]] || { echo "Current database backup was not created" >&2; return 1; }
  echo "$target"
}

rollback_healthcore() {
  local target_sha="$TARGET_SHA"
  [[ "$target_sha" =~ ^[0-9a-f]{40}$ ]] || { echo "TARGET_SHA must be a full 40-character commit SHA" >&2; return 1; }

  git fetch origin main
  git cat-file -e "$target_sha^{commit}" || { echo "Target SHA is not available in the OCI repository: $target_sha" >&2; return 1; }

  local current_sha
  current_sha="$(git rev-parse HEAD)"
  [[ "$current_sha" != "$target_sha" ]] || { echo "TARGET_SHA must differ from the currently deployed commit" >&2; return 1; }

  make_backup
  git checkout main
  git reset --hard "$target_sha"

  set +e
  docker compose --env-file "$HEALTHCORE_ENV_FILE" build healthcore-api healthcore-frontend
  local result=$?
  if [[ "$result" == 0 ]]; then
    docker compose --env-file "$HEALTHCORE_ENV_FILE" up -d --remove-orphans
    result=$?
  fi
  if [[ "$result" == 0 ]]; then
    docker exec nginx-proxy nginx -s reload
    wait_for_health
    result=$?
  fi
  set -e

  if [[ "$result" != 0 ]]; then
    echo "Rollback target failed health/build validation; restoring $current_sha" >&2
    git reset --hard "$current_sha"
    docker compose --env-file "$HEALTHCORE_ENV_FILE" build healthcore-api healthcore-frontend
    docker compose --env-file "$HEALTHCORE_ENV_FILE" up -d --remove-orphans
    docker exec nginx-proxy nginx -s reload
    wait_for_health
    echo "HealthCore restored to $current_sha after failed rollback target" >&2
    return "$result"
  fi

  assert_batuara
  local current_file="$METADATA_DIR/current-release.sha"
  local previous_file="$METADATA_DIR/previous-release.sha"
  sudo install -d -m 700 "$METADATA_DIR"
  printf '%s\n' "$target_sha" | sudo tee "$current_file" >/dev/null
  printf '%s\n' "$current_sha" | sudo tee "$previous_file" >/dev/null
  echo "HealthCore rollback completed: $current_sha -> $target_sha"
}

case "$ACTION" in
  validate-backup)
    backup="$(latest_backup)"
    [[ -n "$backup" ]] || { echo "No HealthCore SQLite backup found in $BACKUP_DIR" >&2; exit 1; }
    validate_backup "$backup"
    assert_batuara
    ;;
  rollback)
    : "\${TARGET_SHA:?TARGET_SHA is required for rollback}"
    rollback_healthcore
    ;;
  *)
    echo "Unsupported ACTION: $ACTION" >&2
    exit 1
    ;;
esac
