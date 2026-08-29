# Verification Matrix

| ID | Scope | Evidence | Expected | State |
| --- | --- | --- | --- | --- |
| V-001 | Git secret protection | `git check-ignore` and current scan | Private keys ignored and absent | Pass locally; history open |
| V-002 | Markdown policy | Physical path audit | Root only `README.md`; other Markdown under `docs/` | Pass locally |
| V-003 | API restore/build | SDK `8.0.422` container and final image | Success | Pass |
| V-004 | API unit tests | SDK container | All pass | Pass: 85/85 |
| V-005 | API authorization | ResourceAuthorizationService tests and smoke | Ownership enforced | Pass: service and endpoint integration tests |
| V-006 | Frontend dependency install | Node 22 container | Success | Pass |
| V-007 | Frontend lint/type-check | Node 22 container | No errors or warnings | Pass: 0 errors, 0 warnings |
| V-008 | Frontend unit tests | Node 22 container | All pass | Pass: 10/10 |
| V-009 | Frontend production build | Node 22 container/image | Success | Pass; Sass internal imports migrated to use with no deprecation warnings |
| V-010 | E2E | Playwright container and ephemeral Nginx route validation | Critical browser flows pass | Pass locally: prior authenticated suite 5/5; current `/healthcore/` route smoke 4/4, including versioned API and legacy proxy compatibility |
| V-011 | Dependency audit | npm and NuGet audits | No high/critical findings | Pass: clean |
| V-012 | Secret scan | Gitleaks current tree and Git history | No current or historical findings | Partial: current clean; 8 historical findings require Gate B |
| V-013 | Image scan | Trivy final API/frontend images | No high/critical findings | Pass: API and frontend report 0 HIGH/CRITICAL vulnerabilities |
| V-014 | OCI staging | Health, authorization, persistence, rollback | All pass | Pending Gate C |
| V-015 | Batuara isolation | OCI CD preflight/post-checks | No change | Pass: Batuara preflight retained on successful OCI CD runs through `30495639633` (`17d691e`, 2026-07-29); no Batuara config mutation by HealthCore workflows |
| V-016 | Docker final validation | Sequential builds, smoke, proxy, non-root | Pass | Pass: rebuilt Compose services healthy; API/frontend health 200; refresh without cookie 401; protected proxy 401; E2E 5/5 |

## Current Totals

- Pass: 14/16 (87.5%).
- Partial: 1/16 (6.25%) — V-012 historical secrets (Gate B).
- Pending: 1/16 (6.25%) — V-014 OCI staging decision (Gate C).

A partial or pending item is not counted as fully closed for Gate B/C, but production publish of the SaaS line is evidenced by OCI CD success on `17d691e`.