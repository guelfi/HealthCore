# Gate B: Credential Rotation and Git History

This procedure is prepared but intentionally not executed. It requires explicit approval because it changes credentials, invalidates sessions, and rewrites shared Git history.

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

## Current state

- Current working tree secret scan: clean.
- Historical scan: 8 findings remain in old commits/paths.
- Execution status: awaiting Gate B approval and credential owner confirmation.