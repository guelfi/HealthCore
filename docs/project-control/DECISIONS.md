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
| D-008 | 2026-07-23 | Set HealthCore monthly SaaS price to R$49,00 and trial period to 30 days | Product/pricing decision for landing page and subscription flow | Accepted |
| D-009 | 2026-07-23 | Do not implement real PIX, Evolution API, or e-mail provider integrations in this UI/UX version | Keep scope controlled; leave integrations planned/configurable | Accepted |
| D-010 | 2026-07-23 | Provide configurable billing templates with separate e-mail and WhatsApp/Evolution API tabs | Supports future notification channels without external integration now | Accepted |
| D-011 | 2026-07-23 | Reactivate overdue doctors manually by administrator after payment proof received by e-mail or WhatsApp | Matches current operational process before payment automation | Accepted |
| D-012 | 2026-07-23 | Public doctor registration creates an active 30-day trial account and stores the selected monthly/annual billing cycle | Implements SaaS onboarding without real PIX/e-mail/WhatsApp integrations in this version | Accepted |
| D-013 | 2026-07-23 | Show the real system specialty count in the doctor dashboard while keeping specialty CRUD restricted to administrators | Doctors need to consult available specialties, but authorization remains profile-based | Accepted |
| D-014 | 2026-07-23 | Align the doctor dashboard lower cards as two half-width columns under the four metric cards on desktop | Improves visual balance and follows the approved dashboard layout direction | Accepted |
| D-015 | 2026-07-23 | Keep the public Swagger path identical locally and in OCI as `/healthcore/swagger/index.html` | Reduces environment drift; only host/IP changes between local and production | Accepted |
| D-016 | 2026-07-23 | Treat the local UI/RBAC/Swagger validation as approved before OCI deployment | User approved phases 0 to 9 and confirmed Swagger in the internal browser | Accepted |
| D-017 | 2026-07-23 | Redirect logout to the public landing page | Keeps the SaaS entry point consistent after session termination | Accepted |
| D-018 | 2026-07-23 | Keep demo/seed passwords normalized through opt-in configuration, not hardcoded in runtime logic | Supports local validation while avoiding accidental production credential coupling | Accepted |
