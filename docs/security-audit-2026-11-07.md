# Security audit, 2026-11-07

Target: `vukem-music` at branch `build/vukem-v0.39.0`.
Method: the vendored Cloudflare `security-audit` skill (`.claude/skills/security-audit`), full audit mode, profile `quick`.

Machine-readable records: [findings](security-audit-2026-11-07.findings.json), [coverage ledger](security-audit-2026-11-07.coverage.json).

## Scope and coverage statement

Partial coverage by design. Profile `quick`: one reviewer, coarse ledger units (5), one hunting pass, no follow-up waves. Source review only; no live endpoints were probed and no dependency was added. Scanners: `go tool govulncheck ./...` (0 reachable vulnerabilities) and `bun audit --prod` (none).

In scope: learner accounts (register, login, progress save, delete), session handling, JSON decoding limits, the score SVG pipeline and its single `dangerouslySetInnerHTML` sink, the SQLite backup command, Railway IaC, Dockerfile and the GitHub workflows (already SHA-pinned with non-persisted credentials).

Not reviewed in depth: lesson and harmony content, audio code, the score build against hostile LilyPond output, and the vukem framework itself.

## Summary

| Severity | Confirmed | Needs validation | Rejected |
| --- | --- | --- | --- |
| Critical | 0 | - | - |
| High | 0 | - | - |
| Medium | 0 | - | - |
| Low | 0 | - | - |
| Informational | 0 | - | - |
| Unrated | - | 1 | 2 |

No code finding was confirmed. One deployment question needs the owner.

## Findings

No confirmed findings.

## Needs validation

### NV-001 Railway service runs as uid 0 despite the non-root image user

- Fingerprint: `vukem-music:deploy:railway-runs-as-root`
- Location: `.railway/railway.ts:22`
- Blocker: Whether a volume group id or ownership setting would let the service run unprivileged is Railway platform behaviour outside the repository.
- Owner check: Owner tests RAILWAY_RUN_UID=1000 with a volume ownership fix in a staging environment.

## Rejected after validation

- `vukem-music:scores:svg-xss`: Content is build-time curated and sanitized, not user supplied.
- `vukem-music:accounts:sql-injection`: Parameterized and bounded.

Hardening notes, not findings: login throttling keys on the handle (10 attempts per 10 minutes, shared by successful logins), so anyone can lock a known handle out for ten minutes; the per-IP limit of 10 requests per minute applies first. Registration answers 409 for a taken handle, which is a handle oracle by design.

## Verification

Findings and ledger passed the skill validators (`validate-findings.cjs`: 3 records; `validate-coverage-ledger.cjs`: 5 units), run on Windows Node with a preload shim for the missing POSIX no-follow constants. The skill's own CLI tests fail 7 cases on Windows for the same reason, as in `vukem-email`.
