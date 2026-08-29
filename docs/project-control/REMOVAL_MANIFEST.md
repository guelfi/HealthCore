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
| RM-009 | Completed-implementation Markdown and historical session logs | Superseded by STATUS/BACKLOG/UI plan after OCI publish of `17d691e` | Link audit; docs/README updated | Done 2026-08-03 |

### RM-009 removed paths

- `docs/project-control/IMPLEMENTATION_STATUS_2026-07-23.md`
- `docs/project-control/OCI_READONLY_2026-07-22.md`
- `docs/project-control/sessions/2026-07-*.md` (13 session logs; `TEMPLATE.md` retained)
- `docs/tasks.md`
- `docs/AvaliaçãoTécnicaHealthCore.md`
- `docs/AnaliseProjetoWindsurf.md`
- `docs/analise-projeto.md`
- `docs/arquitetura-projeto.md` (unrelated Barbearia draft)
- `docs/frontend/mobile-improvements.md`
- `docs/frontend/mobile-audit-report.md`
- `docs/frontend/fab-implementation.md`

Historical file contents remain a separate Gate B activity and are not erased automatically.