# Decision Log

| ID | Date | Decision | Reason | Status |
| --- | --- | --- | --- | --- |
| D-001 | 2026-07-21 | Restrict all local file operations to the HealthCore workspace | User-mandated isolation | Accepted |
| D-002 | 2026-07-21 | Execute .NET and frontend validation only in containers | No local .NET SDK; reproducibility | Accepted |
| D-003 | 2026-07-21 | Use a modular monolith, not generic repository layers | Fits current size and EF Core usage | Accepted |
| D-004 | 2026-07-21 | Keep only root `README.md`; place all other Markdown in `docs/` | Prevent documentation sprawl | Accepted |
| D-005 | 2026-07-21 | Do not keep an archive directory for obsolete documents | Git history already preserves removed material | Accepted |
| D-006 | 2026-07-21 | Isolate HealthCore OCI Compose, network, volume, and deployment | Protect unrelated VPS projects | Accepted |
| D-007 | 2026-07-21 | Require explicit gates for history rewrite, shared Nginx, and production | Limit destructive and shared-infrastructure risk | Accepted |
