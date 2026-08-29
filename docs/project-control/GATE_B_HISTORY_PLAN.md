# Gate B: Credential Rotation and Git History

Gate B covers credential rotation for historically exposed material and an optional approved Git history rewrite. SSH rotation is complete; JWT/app credential decisions and history rewrite remain.

## Required order

1. Create a protected backup of the repository, refs, deployment manifests, and operational evidence.
2. Rotate all credentials identified by the historical Gitleaks report in their source systems.
3. Invalidate sessions and refresh-token records after rotation.
4. Verify the current tree contains no secrets with Gitleaks and Git checks.
5. From a fresh clone, remove the approved historical paths with `git filter-repo` or the approved equivalent.
6. Run the full API/frontend/container/E2E validation suite.
7. Force-push only after written approval and notify every collaborator.
8. Re-run the historical secret scan and retain the report with the session evidence.

## Safety rules

- Never put a replacement credential in this document, a command line, or a repository file.
- Never rewrite history from the working clone containing unrelated user changes.
- Never rotate credentials after deployment has started; rotate first and validate second.
- Do not invalidate Batuara.net sessions or rewrite any repository other than HealthCore.

## Current state (2026-08-03)

| Item | State | Evidence |
| --- | --- | --- |
| OCI SSH key rotation | **Done** | Key `oci-key-2026-07-29` (ed25519) installed locally under `/home/guelfi/Projetos/`; OCI `authorized_keys` retains only the rotated key; old keys revoked. HealthCore GitHub secret `OCI_SSH_PRIVATE_KEY` updated 2026-07-29T21:24Z. OCI CD succeeded afterward (`30492393665`, `30495639633`). |
| GitHub account / PAT | Out of Gate B scope for HealthCore | Rotated in related work (Barbear.IA / shared OCI); HealthCore Actions already authenticate successfully. |
| `HEALTHCORE_JWT_KEY` | **Pending decision/execution** | Secret last updated 2026-07-22 (before SSH rotation). Rotate if historical Gitleaks findings include JWT material; then invalidate refresh sessions. |
| App/admin/demo passwords | **Pending decision/execution** | Rotate and invalidate sessions only if confirmed in historical material. |
| Git history rewrite | **Pending approval** | Historical scan still reports findings in old commits/paths; requires explicit operator approval before force-push. |
| Current working tree secret scan | Clean | No live-tree secrets required for SSH closure. |

## Remaining Gate B actions

1. Decide whether to rotate `HEALTHCORE_JWT_KEY` now (recommended if any historical JWT/fallback exposure is confirmed).
2. Decide whether demo/admin passwords from historical material still need rotation; invalidate sessions after any change.
3. Approve or defer Git history rewrite (`P15-001`).
4. Record closure evidence in STATUS / verification matrix after the above.
