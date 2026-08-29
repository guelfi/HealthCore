# Execution Backlog

States: `pending`, `in_progress`, `blocked`, `done`.

| ID | Priority | Work item | State | Evidence / next step |
| --- | --- | --- | --- | --- |
| P00-001 | Critical | Governance branch and control files | done | Control set exists |
| P00-002 | Critical | Exclude credentials from Git and Docker contexts | done | Ignore rules and current Gitleaks clean |
| P01-001 | Critical | Repository and container baseline | done | Baseline recorded |
| P02-001 | Critical | Remove tracked PII databases and runtime artifacts | done | Working tree clean of runtime artifacts; history open |
| P02-002 | Critical | Rotate exposed credentials and invalidate sessions | in_progress | Gate B SSH done (`OCI_SSH_PRIVATE_KEY` 2026-07-29, post-rotation CD green). Remaining: decide/execute `HEALTHCORE_JWT_KEY` + app/demo password rotation and session invalidation |
| P02-003 | Critical | Prepare Git history rewrite | done | Gate B procedure documented; execution still requires approval |
| P03-001 | High | Build and test .NET solution in SDK container | done | Final image build; 85/85 tests |
| P03-002 | High | Frontend install, checks, tests, and build in Node container | done | Build, type-check, lint 0/0, tests 10/10, Sass build clean, npm audit clean |
| P04-001 | Critical | Endpoint authorization, ownership, and browser smoke tests | done | API integration suite 85/85 and browser smoke suite pass; ownership API tests pass |
| P05-001 | High | Consolidate Markdown under `docs/` | done | Root retains README only |
| P05-002 | High | Remove obsolete scripts, reports, tasks, and assets | done | Cleanup completed; build, diff check, and reference audit pass |
| P06-001 | High | Remove unreachable frontend modules | done | Import/build validation pass |
| P06-002 | High | Remove duplicate routes, DTOs, methods, and mappings | done | Duplicate `/api` route blocks removed and tested |
| P07-001 | High | Split API bootstrap into feature modules | done | Platform, security, persistence, and E2E extension modules; build and 85/85 API tests pass |
| P07-002 | High | Establish canonical `/api/v1` contract | done | `/api/v1/` proxy added; legacy `/api/` retained; E2E compatibility checks pass |
| P08-001 | Critical | JWT, refresh, logout, user-state, registration flows | done | Isolated E2E user seed; authenticated login, refresh, logout revocation, and token response contract pass |
| P08-002 | Critical | Policy and resource authorization | done | Ownership service and endpoint integration tests pass |
| P08-003 | High | CORS, rate limits, headers, health, logs, Swagger | done | Local hardening and rebuilt-image validation pass; production ingress exercised by OCI CD preflight/smoke |
| P09-001 | Critical | Replace image seed DB with persistent migrations | done | EF migrations apply at startup and Compose uses the named `healthcore_data` volume |
| P09-002 | High | Validate production database target | done | Production volume retained across OCI CD runs; SQLite backup/restore and rollback previously validated; current release `17d691e` deployed 2026-07-29 |
| P10-001 | High | Reorganize frontend by feature | done | Route pages grouped under `presentation/features`; barrel exports and production Docker build pass |
| P10-002 | Critical | Remove tokens from localStorage and secure refresh flow | done | Memory-only access token, HttpOnly refresh cookie, rotation, revocation, and 5/5 E2E pass |
| P11-001 | Critical | Resolve npm, NuGet, image, and source vulnerabilities | done | npm/NuGet audits and Trivy scans clean for current tree; documented react-router exception; historical secrets remain Gate B |
| P12-001 | High | Container-first GitHub Actions workflow | done | CI green on `main` (`30495036346` for `17d691e`); OCI CD succeeded via authenticated repository runs |
| P13-001 | Critical | Create isolated HealthCore OCI staging resources | pending | Gate C decision still open; production deploy uses dedicated HealthCore Compose/network without a separate staging stack |
| P14-001 | Critical | Promote with backup, smoke tests, and rollback | done | OCI CD success `30495639633` (`17d691e`, 2026-07-29); prior rollback run `29936316021` validated restore path; Batuara preflight retained |
| P15-001 | Critical | Rewrite Git history after approval | pending | Gate B optional close-out; SSH already rotated; awaits explicit approval |
| P16-001 | High | Closure audit and release report | pending | After remaining Gate B JWT/app decisions (+ history rewrite if approved) |
