# Current Status

| Field | Value |
| --- | --- |
| Updated | 2026-07-22 |
| Active session | 2026-07-22-011 (in progress) |
| Branch | `codex/healthcore-hardening` |
| Baseline commit | `21d1c2adbc3e8f47e039e830d7e4e9d0f8ff642a` |
| Active phase | P02/P09/P13/P14/P15/P16 |
| Overall state | Local implementation threshold reached; external gates open |
| Production changes | None |

## Progress

- Work items: 22 of 28 done locally (78.6%), 0 in progress, 6 pending (21.4%).
- Weighted execution estimate: 78.6% complete locally; 21.4% remains in external approval, infrastructure, release, and history gates.
- OCI inspection was read-only: SSH access succeeded, Batuara containers and public site were healthy, and the containerized Nginx configuration passed `nginx -t`. No OCI configuration, reload, deployment, or Batuara resource was changed.

## Completed This Cycle

- Removed tracked databases, logs, PIDs, backups, invalid `.grok` data, stale root reports, obsolete task trees, and unused frontend modules.
- Kept only the repository `README.md` at root; project Markdown is organized under `docs/`.
- Added and actionlint-validated container-first GitHub Actions CI with pinned .NET SDK, frontend checks, dependency audits, image builds, Compose validation, and Playwright E2E. The workflow has no OCI or SSH mutation step.
- Hardened JWT validation, CORS, authorization defaults, Swagger exposure, rate limiting, health responses, and registration permissions.
- Added patient/exam resource authorization and doctor ownership tests; doctors cannot access unrelated patients or exams.
- Removed duplicate `/api/usuarios` and `/api/especialidades` endpoint blocks. Current frontend contracts remain `/users` and `/especialidades`.
- Changed frontend access tokens to memory-only storage, moved refresh tokens to an HttpOnly cookie with rotation/revocation, removed the public diagnostic surface and PII/debug storage checks, and aligned the client fallback with the Nginx `/api/` proxy.
- Updated .NET 8 packages to 8.0.22, pinned Docker images to healthy SDK/runtime tags, and kept npm/NuGet audits clean.
- Hardened the frontend image to non-root Nginx on port 8080, restricted headers/CSP, fixed health-location security headers, and corrected API proxy path/host forwarding.
- Removed the local SSH private-key copy and redacted the legacy documentation sample. Current working tree Gitleaks scan reports no leaks.
- Split API bootstrap into platform, security, persistence, and E2E extension modules without changing endpoint behavior.
- Added the canonical `/api/v1/` proxy contract while retaining the legacy `/api/` compatibility path during migration.
- Added isolated E2E-only user seeding; Production never invokes the seeder and receives empty E2E credentials.
- Reorganized frontend route pages by feature and validated the resulting Docker production image.
- Completed local CORS, rate-limit, security-header, health, logging, and Swagger hardening validation.
- Protected the local OCI SSH key with an explicit ignore rule and restrictive Windows ACL; the key is not tracked.
- Standardized the frontend public route to `/healthcore/`; `-frontend` remains only an internal service/container name. The Vite base path, image, Compose arguments, Nginx compatibility path, favicon, and route E2E smoke test are aligned.
- Added the OCI CD workflow and release script with main-branch gating, explicit confirmation, dirty-tree refusal, Batuara preflight checks, SQLite backup, targeted Nginx validation, HealthCore health checks, and rollback of an invalid Nginx edit. The workflow has not been triggered or published from this workspace.
- OCI read-only database evidence: the remote HealthCore API is healthy and reports healthy database, filesystem, and database-performance checks; the production volume is present. Backup/restore and post-release persistence remain unvalidated.

## Validation Evidence

- API build and final image build: pass in .NET SDK/Docker containers.
- API tests: `85/85` pass, zero failures/skips, including the refresh-cookie contract.
- Frontend install, type-check, lint, tests, and production build: pass; lint has 0 errors and 0 warnings, and Sass has no internal import deprecations.
- Compose config: pass with an ephemeral JWT key.
- API smoke: `/health/live` 200, `/health` 200, protected `/pacientes` 401 without token.
- Integrated API/frontend smoke: API/frontend health 200, application page 200, `/auth/refresh` 401 without cookie, `/api/pacientes` 401 through the corrected proxy, frontend user `nginx`.
- Browser E2E: `5/5` passed against rebuilt API/frontend images, including cookie refresh rotation and logout revocation.
- GitHub Actions workflow: `actionlint` pass after adding the isolated E2E environment. Local release preflight syntax pass.
- Trivy final-image scan: API and frontend report zero HIGH/CRITICAL vulnerabilities with `--ignore-unfixed` after Docker recovery.
- Gitleaks current tree: no leaks. Historical scan: 8 findings in old commits/paths; Gate B remains required for rotation and history rewrite.
- Current route smoke: `/healthcore` redirects to `/healthcore/`, the application and frontend health return 200, and protected `/api/v1/pacientes` returns 401 without authentication.

## Open Items

- Rotate exposed historical credentials and invalidate sessions, only after Gate B approval.
- Execute Git history rewrite, only after Gate B approval and backup.
- Validate the production database target and persistence/backup policy through the approved OCI read-only gate.
- Create isolated HealthCore OCI staging resources through Gate C.
- Promote with backup, smoke tests, and rollback evidence through Gate D.
- Complete the closure audit and release report after all external gates.

## Next Action

Complete the route/CD documentation and static validation in this session, then obtain authenticated GitHub validation and Gate B/C/D approvals before any production mutation.