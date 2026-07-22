# HealthCore Release Checklist

This checklist is the controlled path for a HealthCore release. It is intentionally separate from Batuara.net and does not authorize OCI changes by itself.

## Gate A: Local validation

- Confirm the working tree and intended branch.
- Run the API build and tests in the .NET SDK container.
- Run frontend type-check, lint, unit tests, audit, and production build in Node 22.
- Run the Playwright E2E suite against rebuilt API and frontend images.
- Run Compose config validation and image scans.
- Confirm API and frontend ports are bound to the loopback interface unless an approved reverse proxy is already configured.

## Gate B: Credentials and history

- Rotate every credential found in historical scans before publishing a release.
- Revoke active sessions and refresh tokens after rotation.
- Preserve a protected backup of the current repository and refs.
- Perform history rewriting only from a fresh clone and only after written approval.
- Force-push only the approved branch and notify all collaborators.

## Gate C: OCI staging

- Use a HealthCore-only staging project or Compose namespace.
- Capture read-only evidence of Nginx routes, listening ports, Docker networks, volumes, and Batuara.net containers before changes.
- Confirm HealthCore binds only its approved ports and does not share Batuara volumes or networks.
- Create a database backup before starting the staged stack.
- Validate health, authentication, authorization, refresh-cookie behavior, proxy routing, and persistence.

## Gate D: Promotion and rollback

- Record image digests and the backup path before promotion.
- Use `docker compose up -d` for the HealthCore project only. Never use `docker compose down -v` in a production volume.
- Run the smoke suite through the approved domain and confirm the Batuara.net domain remains healthy.
- Roll back by restoring the previous image digests and database backup if any critical check fails.
- Record the result, timestamps, and evidence in the session log.

## Explicit prohibitions

- Do not expose API or frontend container ports directly to the public Internet when Nginx is the approved ingress.
- Do not run `docker system prune`, `docker compose down -v`, or broad container deletion on the shared VPS.
- Do not copy SSH private keys into the repository or commit credentials.
- Do not run deployment commands until Gates B, C, and D are approved.