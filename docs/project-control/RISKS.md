# Risk Register

| ID | Severity | Risk | Mitigation | State |
| --- | --- | --- | --- | --- |
| R-001 | Critical | Historical Git objects may contain databases, logs, and credentials | Rotate, purge history after Gate B, scan | Open |
| R-002 | Critical | Previously committed JWT fallback/private material may remain in history | Invalidate sessions, rotate secrets, rewrite history | Open |
| R-003 | Critical | Authenticated browser E2E coverage is incomplete | Smoke suite 3/3 passes; add login/refresh/logout flows with isolated test data | Mitigated locally; authenticated flows open |
| R-004 | Critical | OCI API database persistence is unverified | Read-only inspect, backup before any recreate | Open |
| R-005 | Critical | Shared OCI Compose can affect unrelated projects | Dedicated project/network; no shared-resource mutation | Open |
| R-006 | High | Shared Nginx change can affect Batuara | Gate C, backup, syntax test, canary, rollback | Open |
| R-007 | High | GitHub workflow has not run under repository credentials | Re-authenticate the intended GitHub account and run CI | Open; local gh credential invalid |
| R-008 | High | Frontend lint/Sass warnings may hide future defects | Warning budget and cleanup batches | In progress |
| R-009 | High | Dead-script surface may hide broken operational paths | Final import/link audit | In progress |
| R-010 | Medium | Legacy OCI documentation may be mistaken for active deployment | Label legacy docs and validate actual workflow | Mitigated locally |
| R-011 | High | Local SSH key could be committed or copied into images | Removed local copy, ignored extensions, current scan clean | Mitigated locally; history open |
| R-012 | High | FluentAssertions license must be confirmed for release | Confirm license or replace before production | Open |
| R-013 | High | Docker Desktop/containerd storage I/O blocks closure image re-scan | Docker restarted; final Trivy scan completed with zero HIGH/CRITICAL findings | Mitigated locally |
