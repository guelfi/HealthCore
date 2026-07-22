# HealthCore Master Plan

## Objective

Deliver a secure, maintainable, container-tested HealthCore release, remove obsolete material, establish reliable CI, and deploy to OCI without impacting any other project on the shared VPS.

## Scope Rule

All local file operations remain restricted to `C:\Users\MarcoGuelfi\Projetos\HealthCore`. OCI mutations are performed only by the HealthCore GitHub Actions workflows. Batuara is checked by preflight/post-checks and is never modified by HealthCore tooling.

## Phases

| Phase | Outcome | State |
| --- | --- | --- |
| P00 | Governance, branches, secret protection, controls | Complete |
| P01 | Reproducible baseline and inventory | Complete |
| P02 | Security containment and secret/data removal | In progress: credential rotation |
| P03 | Container-only build and test toolchain | Complete |
| P04 | Security and regression test baseline | Complete |
| P05 | Repository and documentation sanitation | Complete |
| P06 | Dead and duplicate code removal | Complete |
| P07 | Backend modularization and canonical API | Complete |
| P08 | Authentication, authorization, and HTTP hardening | Complete |
| P09 | Persistent data validation and backup/restore | Complete for current SQLite release |
| P10 | Frontend feature architecture and token hardening | Complete |
| P11 | Dependency, image, and source security audits | Complete; historical credential rotation remains |
| P12 | GitHub Actions container-first CI | Complete |
| P13 | OCI preflight, Nginx validation, and deployment gate | Complete; separate OCI staging decision open |
| P14 | Production promotion and rollback verification | Complete |
| P15 | Git history sanitation and final documentation | In progress: credential rotation and closure report |
| P16 | Closure audit and release evidence | Pending final credential evidence |

## Definition of Done

- All tracked files are necessary source, tests, infrastructure, or current documentation.
- Only `README.md` and `docs/**/*.md` are tracked Markdown paths.
- All builds, tests, audits, and migrations pass in containers.
- No known critical or high vulnerability remains without an approved exception.
- Authorization and ownership rules have integration tests.
- No secret, token, log, database, or patient data is tracked in Git.
- HealthCore has an isolated, workflow-driven OCI deployment and a tested rollback.
- Batuara and other VPS projects remain unchanged and healthy.
- Every completed item has evidence in the verification matrix and session log.
- Credential rotation and final audit evidence are recorded before declaring 100%.
