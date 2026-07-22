# OCI Read-Only Inspection 2026-07-22

## Scope

Inspection only, through the project-local OCI SSH key. No remote file, container, Nginx configuration, database, or service was modified. No deployment was executed.

## VPS and Batuara baseline

- SSH access to the configured OCI host succeeded.
- The host runs the reverse proxy in the `nginx-proxy` container; host-level `nginx` is not installed.
- `docker exec nginx-proxy nginx -t` passed.
- Batuara API, public website, admin dashboard, and database containers were running and healthy.
- `https://batuara.org.br/` and `https://www.batuara.org.br/` returned HTTP 200.

## HealthCore baseline

- Remote project directory: `/var/www/HealthCore`.
- The remote working tree is dirty (`src/Api/Dockerfile` and `src/Api/Program.cs`), so the prepared CD workflow must refuse deployment until the tree is reconciled.
- The remote API is healthy on its internal port and reports healthy database, filesystem, and database-performance checks.
- The persistent volume `healthcore_data` exists. The inspection did not copy, restore, migrate, or alter the database.
- The current remote Nginx route is `/healthcore/`; the remote deployment is an older state and still proxies the frontend upstream on port 80. The local hardened image uses port 8080 and the CD script validates this targeted change before reload.

## Release consequence

The OCI evidence supports the safety preflight but does not authorize production deployment. Required gates remain: reconcile the dirty remote tree, authenticate and validate GitHub Actions, approve credential rotation/history handling, create isolated staging, and execute promotion with backup, smoke, and rollback evidence.