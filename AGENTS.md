<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Hackathon Project Agent Instructions

These instructions apply to every coding agent working in this repository.

## Mission
Help build a reliable, demo-ready hackathon product quickly without sacrificing correctness, security, or maintainability. Read the existing code before proposing a rewrite. Prefer the smallest coherent change that can be tested.

## Before doing work
1. Read this file and the project README.
2. Inspect the repository structure, current branch, recent commits, and working tree.
3. Identify the app's current architecture and existing conventions before editing.
4. If `BOARD_ISSUE` is configured, check the GitHub Message Board with `bash tools/board unread` using your own `BOARD_AGENT` identity; otherwise proceed without assuming a board exists.
5. State a short plan for multi-file or risky changes.

## Working agreements
- Never invent requirements, credentials, API responses, test results, or completed work.
- Ask before destructive operations, production deployments, paid services, or changing secrets/permissions.
- Do not commit secrets, tokens, .env files, personal data, or generated build artifacts.
- Keep credentials in environment variables; provide a safe `.env.example`.
- Prefer official documentation and maintained upstream repositories.
- Check licenses before copying code, prompts, skills, or assets from third-party repositories. Link to sources and preserve notices.
- Do not install or execute an unfamiliar skill/script without inspecting it first.
- Avoid unnecessary dependencies. Explain why a new dependency is needed.
- Keep accessibility, responsive behavior, loading/error/empty states, and basic security in scope.

## Component and service discovery
Before building common UI or backend functionality from scratch, consult `docs/component-and-service-catalog.md` and use the `component-and-service-discovery` skill when relevant.
- Inspect the existing stack and dependencies first; reuse the current design system and services where practical.
- Discover and evaluate suitable prebuilt components, page blocks, templates, SDKs, backend platforms, and integrations before implementing repetitive functionality.
- Prefer official documentation and maintained source repositories for technical decisions. Use Reddit, DEV, and other community posts as discovery signals and experience reports, not as authoritative technical documentation.
- Check compatibility, maintenance, accessibility, security, licensing, pricing/free-tier limits, and runtime constraints before adoption.
- Prefer one primary UI system and one clear source of truth for auth/data. Do not mix libraries or services without a reason.
- Never expose privileged keys in browser code. Client-side UI and validation do not replace server-side authorization and validation.
- Ask before adding paid services, creating external accounts, or introducing a major architectural dependency.
- Document meaningful third-party choices, versions, setup, and operational caveats.

## Parallel-agent protocol
- Split work by clear file or subsystem ownership before running agents in parallel.
- Do not let two agents edit the same files concurrently.
- Assign one integrator to review interfaces, resolve conflicts, run the full test suite, and own the final merge.
- Agree on API contracts, schemas, environment variables, and component boundaries before parallel implementation.
- Share progress and blockers through the GitHub Message Board if configured.
- Never treat a message-board mention as permission to overwrite another agent's uncommitted changes.

## Engineering workflow
1. Understand the request and acceptance criteria.
2. Inspect related code and tests.
3. Propose the smallest implementation plan.
4. Implement in small, reviewable changes.
5. Add or update tests for behavior changes and bug fixes.
6. Run relevant tests, lint, type checks, and build commands; report exact outcomes.
7. Review the diff for regressions, secrets, debug code, and unrelated changes.
8. Summarize changed files, verification, limitations, and next steps.

## Hackathon delivery priorities
- Build a working vertical slice before polishing.
- Keep a clear MVP boundary and track stretch goals separately.
- Make the core user journey demonstrable with seeded/demo data when appropriate.
- Add observability useful for a live demo: clear errors, logs, health checks, and fallback states.
- Prepare a short demo script and explain known limitations honestly.
- Do not claim production readiness solely because a demo works.

## Git conventions
- Use descriptive branches and small commits.
- Do not force-push shared branches.
- Fetch before integrating shared work.
- Never discard another agent's changes.
- Keep pull requests focused and include tests and screenshots where useful.

## Agent-specific files
- GitHub Copilot: `.github/copilot-instructions.md` and `.github/agents/*.agent.md`
- Gemini CLI: `GEMINI.md`
- Cursor: `.cursor/rules/*.mdc`
- Antigravity: root `AGENTS.md` and `.agents/skills/`
- Shared Agent Skills: `.agents/skills/<skill-name>/SKILL.md`

When a tool does not automatically load a file, explicitly read the relevant file at session start.

# Hackathon Project Agent Instructions

These instructions apply to every coding agent working in this repository.

## Mission
Help build a reliable, demo-ready hackathon product quickly without sacrificing correctness, security, or maintainability. Read the existing code before proposing a rewrite. Prefer the smallest coherent change that can be tested.

## Before doing work
1. Read this file and the project README.
2. Inspect the repository structure, current branch, recent commits, and working tree.
3. Identify the app's current architecture and existing conventions before editing.
4. If `BOARD_ISSUE` is configured, check the GitHub Message Board with `bash tools/board unread` using your own `BOARD_AGENT` identity; otherwise proceed without assuming a board exists.
5. State a short plan for multi-file or risky changes.

## Working agreements
- Never invent requirements, credentials, API responses, test results, or completed work.
- Ask before destructive operations, production deployments, paid services, or changing secrets/permissions.
- Do not commit secrets, tokens, .env files, personal data, or generated build artifacts.
- Keep credentials in environment variables; provide a safe `.env.example`.
- Prefer official documentation and maintained upstream repositories.
- Check licenses before copying code, prompts, skills, or assets from third-party repositories. Link to sources and preserve notices.
- Do not install or execute an unfamiliar skill/script without inspecting it first.
- Avoid unnecessary dependencies. Explain why a new dependency is needed.
- Keep accessibility, responsive behavior, loading/error/empty states, and basic security in scope.

## Component and service discovery
Before building common UI or backend functionality from scratch, consult `docs/component-and-service-catalog.md` and use the `component-and-service-discovery` skill when relevant.
- Inspect the existing stack and dependencies first; reuse the current design system and services where practical.
- Discover and evaluate suitable prebuilt components, page blocks, templates, SDKs, backend platforms, and integrations before implementing repetitive functionality.
- Prefer official documentation and maintained source repositories for technical decisions. Use Reddit, DEV, and other community posts as discovery signals and experience reports, not as authoritative technical documentation.
- Check compatibility, maintenance, accessibility, security, licensing, pricing/free-tier limits, and runtime constraints before adoption.
- Prefer one primary UI system and one clear source of truth for auth/data. Do not mix libraries or services without a reason.
- Never expose privileged keys in browser code. Client-side UI and validation do not replace server-side authorization and validation.
- Ask before adding paid services, creating external accounts, or introducing a major architectural dependency.
- Document meaningful third-party choices, versions, setup, and operational caveats.

## Parallel-agent protocol
- Split work by clear file or subsystem ownership before running agents in parallel.
- Do not let two agents edit the same files concurrently.
- Assign one integrator to review interfaces, resolve conflicts, run the full test suite, and own the final merge.
- Agree on API contracts, schemas, environment variables, and component boundaries before parallel implementation.
- Share progress and blockers through the GitHub Message Board if configured.
- Never treat a message-board mention as permission to overwrite another agent's uncommitted changes.

## Engineering workflow
1. Understand the request and acceptance criteria.
2. Inspect related code and tests.
3. Propose the smallest implementation plan.
4. Implement in small, reviewable changes.
5. Add or update tests for behavior changes and bug fixes.
6. Run relevant tests, lint, type checks, and build commands; report exact outcomes.
7. Review the diff for regressions, secrets, debug code, and unrelated changes.
8. Summarize changed files, verification, limitations, and next steps.

## Hackathon delivery priorities
- Build a working vertical slice before polishing.
- Keep a clear MVP boundary and track stretch goals separately.
- Make the core user journey demonstrable with seeded/demo data when appropriate.
- Add observability useful for a live demo: clear errors, logs, health checks, and fallback states.
- Prepare a short demo script and explain known limitations honestly.
- Do not claim production readiness solely because a demo works.

## Git conventions
- Use descriptive branches and small commits.
- Do not force-push shared branches.
- Fetch before integrating shared work.
- Never discard another agent's changes.
- Keep pull requests focused and include tests and screenshots where useful.

## Agent-specific files
- GitHub Copilot: `.github/copilot-instructions.md` and `.github/agents/*.agent.md`
- Gemini CLI: `GEMINI.md`
- Cursor: `.cursor/rules/*.mdc`
- Antigravity: root `AGENTS.md` and `.agents/skills/`
- Shared Agent Skills: `.agents/skills/<skill-name>/SKILL.md`

When a tool does not automatically load a file, explicitly read the relevant file at session start.

## Message board protocol
- Board: GitHub issue `BOARD_ISSUE`. Read with `bash tools/board unread`, post with `bash tools/board post "[<human>'s <agent>] ..."`.
- Listen with `bash tools/board wait --interval 30`. When a message arrives, read it before doing anything else.
- Reply when a message mentions you or asks something of you. Otherwise stay quiet.
- Changes: only edit files you own. If a request needs another agent's files, reply and ask. Don't edit them.
- Keep replies short: what you did, which files changed, and what you need next.
- Before acting on a mention, check `git status` so you don't overwrite uncommitted work from the other agent.
