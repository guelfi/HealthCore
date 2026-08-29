# Current Status

| Field | Value |
| --- | --- |
| Updated | 2026-08-03 |
| Active session | Gate B SSH closure |
| Branch | `main` |
| Current production release | `17d691e415f485fbabe30c5a91ea201cd14d93a8` |
| Latest repository commit | `17d691e415f485fbabe30c5a91ea201cd14d93a8` |
| Overall estimate | 96% complete |
| Overall state | SaaS published to OCI; Gate B SSH rotation done; JWT/app credential decision and optional history rewrite remain |

## Completed Evidence

- Main history normalization and force-push were completed; current GitHub contributor attribution does not show verified commits from `mmcarvaxd`, `qwen-coder`, or `warp-agent`. GitHub contributor cards cannot be manually deleted.
- Root sanitation is complete: only `README.md` remains as root Markdown; project documentation and control records are under `docs/`.
- Container-first CI is green in GitHub Actions, including API build/tests in a .NET SDK container, frontend checks/build, Compose validation, dependency audit, and Browser E2E.
- Security hardening and duplicate endpoint/code cleanup are implemented and covered by automated checks.
- The public route is `/healthcore/`; `-frontend` remains internal only.
- SaaS UI/UX implementation (`85229dc`, phases 0-9) was merged to `main` and promoted through subsequent deploy hardening commits.
- OCI CD run [`30495639633`](https://github.com/guelfi/HealthCore/actions/runs/30495639633) succeeded on 2026-07-29 for commit `17d691e...` (event `workflow_run` after green CI), deploying the current production release with Compose backup/smoke gates and Batuara preflight.
- Prior successful OCI CD runs on the same release line: [`30492393665`](https://github.com/guelfi/HealthCore/actions/runs/30492393665) (`workflow_dispatch`, `e016dcb...`) and [`30455100005`](https://github.com/guelfi/HealthCore/actions/runs/30455100005) (`workflow_run`, `e016dcb...`).
- Earlier OCI deployment run `29935488551` succeeded on main commit `ffa89e5...`, with SQLite backup, API/frontend health checks, Nginx validation, and Batuara preflight/post-checks.
- OCI recovery validation run `29935334880` passed SQLite integrity and isolated restore validation.
- OCI rollback run `29936316021` succeeded, restoring production from `b3c6437...` to known-good `d914f1d...`; temporary recovery files were removed.
- Batuara public availability, Nginx syntax, and Batuara API/public-site/database container health passed before and after HealthCore operations. No Batuara configuration or files were changed.
- **Gate B SSH complete (2026-07-29):** OCI key rotated to `oci-key-2026-07-29`; old authorized keys revoked on `129.153.86.168`; HealthCore secret `OCI_SSH_PRIVATE_KEY` updated 2026-07-29T21:24Z; post-rotation deploys succeeded.

## Remaining Gates

- Decide/execute rotation of `HEALTHCORE_JWT_KEY` if historical exposure is confirmed; invalidate refresh sessions afterward.
- Decide/execute rotation of any app/admin/demo passwords confirmed in historical material; invalidate sessions afterward.
- Approve or defer Git history rewrite (Gate B / `P15-001`).
- Decide whether a separate OCI staging stack is mandatory (`P13-001`).
- Complete the closure audit and publish the final verification report (`P16-001`).

## Next Session

Resolve JWT and app-password Gate B decisions (rotate or explicitly waive with evidence), then either approve history rewrite or defer it, and finish the closure report.
