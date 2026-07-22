# HealthCore Master Plan

## Objective

Deliver a secure, maintainable, container-tested HealthCore release, remove obsolete material, establish reliable CI, and deploy to OCI without impacting any other project on the shared VPS.

## Local Scope

All local file operations are restricted to `C:\Users\MarcoGuelfi\Projetos\HealthCore`. No other local directory may be read, written, moved, or deleted. Docker build contexts and bind mounts must remain inside this directory.

## Phases

| Phase | Outcome | State |
| --- | --- | --- |
| P00 | Governance, branch, secret protection, and controls | Complete |
| P01 | Reproducible baseline and inventory | Complete |
| P02 | Security containment and secret/data removal | In progress (Gate B) |
| P03 | Container-only build and test toolchain | Complete locally |
| P04 | Security and regression test baseline | In progress (smoke E2E pass; authenticated flows pending) |
| P05 | Repository and documentation sanitation | Complete locally; link audit open |
| P06 | Dead and duplicate code removal | Complete locally; final static audit open |
| P07 | Backend modularization and canonical API | Pending |
| P08 | Authentication, authorization, and HTTP hardening | In progress |
| P09 | Persistent data model and migration strategy | In progress |
| P10 | Frontend feature architecture and token hardening | In progress |
| P11 | Dependency, image, and source security audits | Complete locally; history Gate B open |
| P12 | GitHub Actions container-first CI | Complete locally; authenticated run pending |
| P13 | Isolated OCI staging and Nginx validation | Pending |
| P14 | Production promotion and rollback verification | Pending |
| P15 | Git history sanitation and final documentation | Pending (Gate B) |
| P16 | Closure audit and release evidence | Pending |

## Mandatory Gates

| Gate | Approval required before |
| --- | --- |
| A | Local implementation start (approved 2026-07-21) |
| B | Credential rotation and Git history rewrite |
| C | Any write or reload in shared OCI infrastructure |
| D | Production promotion |

## Definition of Done

- All tracked files are necessary source, tests, infrastructure, or current documentation.
- Only `README.md` and `docs/**/*.md` are tracked Markdown paths.
- All builds, tests, audits, and migrations pass in containers.
- No known critical or high vulnerability remains without an approved exception.
- Authorization and ownership rules have integration tests.
- No secret, token, log, database, or patient data is tracked in Git.
- HealthCore has isolated OCI deployment resources and a tested rollback.
- Batuara and other VPS projects remain unchanged and healthy.
- Every completed item has evidence in the verification matrix and session log.