# Removal Manifest

No candidate is removed solely by name. Each removal must have reference evidence and a successful verification result.

| ID | Candidate group | Evidence | Validation | State |
| --- | --- | --- | --- | --- |
| RM-001 | `.grok` and invalid `:LATEST_BACKUP:` | No runtime references; invalid Windows path | Working-tree audit | Done locally |
| RM-002 | Logs, PIDs, database files, backup DBs, env backups, local SSH key | Generated, ignored, duplicated, or sensitive | Builds, scans, smoke | Done locally; history open |
| RM-003 | Duplicate ngrok scripts and legacy debug/test material | Historical/debug-only material and no current references | Targeted link/import audit | Done locally; historical findings remain Gate B scope |
| RM-004 | Root reports and historical task plans | Stale or contradicted by implementation | Documentation inventory | Done locally |
| RM-005 | Dead frontend component systems | Outside application import graph | Type-check, lint, tests, build | Done |
| RM-006 | Duplicate API endpoint aliases | Same services with divergent authorization | API build, tests, frontend contract search | Done locally |
| RM-007 | Unused backend DTOs and methods | Declaration/reference analysis | Final API audit | Pending |
| RM-008 | Unused public assets and debug tooling | No application references | Build plus E2E smoke | In progress |

Historical file contents remain a separate Gate B activity and are not erased automatically.