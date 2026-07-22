# Current Status

| Field | Value |
| --- | --- |
| Updated | 2026-07-22 |
| Active session | 2026-07-22-013 |
| Branch | `main` |
| Current production release | `d914f1d9e523c0f53fc2069b5579fbf37fe63966` |
| Latest repository commit | `b3c64373a81e39d31a1fb42c77f2fe37e5d8c035` |
| Overall estimate | 90% complete |
| Overall state | Production publish and tested rollback complete; credential rotation and final closure remain |

## Completed Evidence

- Main history normalization and force-push were completed; current GitHub contributor attribution does not show verified commits from `mmcarvaxd`, `qwen-coder`, or `warp-agent`. GitHub contributor cards cannot be manually deleted.
- Root sanitation is complete: only `README.md` remains as root Markdown; project documentation and control records are under `docs/`.
- The local SSH key `ssh-key-2025-08-28.pem` is ignored and protected by restrictive Windows ACLs; its contents were never exposed.
- Container-first CI is green in GitHub Actions, including API build/tests in a .NET SDK container, frontend checks/build, Compose validation, dependency audit, and Browser E2E.
- Security hardening and duplicate endpoint/code cleanup are implemented and covered by automated checks.
- The public route is `/healthcore/`; `-frontend` remains internal only.
- OCI deployment run `29935488551` succeeded on main commit `ffa89e5...`, with SQLite backup, API/frontend health checks, Nginx validation, and Batuara preflight/post-checks.
- OCI recovery validation run `29935334880` passed SQLite integrity and isolated restore validation.
- OCI rollback run `29936316021` succeeded, restoring production from `b3c6437...` to known-good `d914f1d...`; temporary recovery files were removed.
- Batuara public availability, Nginx syntax, and Batuara API/public-site/database container health passed before and after HealthCore operations. No Batuara configuration or files were changed.

## Remaining Gates

- Rotate the real OCI authorized SSH key and revoke the historical key after installing the replacement. This requires a newly generated key pair and a controlled secret update.
- Rotate any application/admin credentials that may have existed in historical material, invalidate active sessions, and record the new secret identifiers without storing values in Git.
- Decide whether a separate OCI staging stack is mandatory. Containerized CI staging is complete; a separately isolated OCI staging resource was not provisioned.
- Complete the closure audit and publish the final verification report after credential rotation.

## Next Session

Execute credential rotation with the new values supplied/approved by the operator, then run the final audit and mark the plan complete only after the remaining gates have evidence.
