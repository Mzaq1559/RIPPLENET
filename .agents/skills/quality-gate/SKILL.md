---
name: quality-gate
description: Run a practical pre-merge and pre-demo quality review covering tests, builds, security, configuration, and user-facing failure states.
---

# Quality Gate

## Inspect
- Git diff and status; check for accidental unrelated changes.
- Secrets, tokens, credentials, private URLs, and real user data.
- Dependency additions, lockfile changes, licenses, and vulnerable patterns.
- Configuration defaults and a safe `.env.example`.

## Verify
- Run the repository's documented lint, type-check, unit, integration, and build commands.
- Check health/readiness endpoints and critical API flows when present.
- Check responsive layout, keyboard access, and error/empty/loading states for UI changes.
- Verify a clean setup path from README instructions when practical.

## Report
List each command and its actual outcome. Explicitly identify unrun checks and blockers. Never convert a warning or skipped check into a pass.
