# Agent ecosystem and reusable skills

This boilerplate is designed around the tools currently used by the maintainer:

- GitHub Copilot / Copilot CLI
- Gemini CLI
- Antigravity CLI
- Cursor CLI

## Shared layer

The portable baseline is:
- `AGENTS.md` — project-wide engineering and collaboration rules.
- `.agents/skills/*/SKILL.md` — reusable Agent Skills in the open SKILL.md format.
- `docs/component-and-service-catalog.md` — curated frontend, backend, integration, testing, and deployment resources.
- `config/upstream-sources.json` — curated upstream repositories.
- `config/upstream-lock.json` — latest observed upstream commit pins.

Agent Skills are portable in format, but discovery paths and supported features vary by host. This repository uses `.agents/skills/` as the shared project skills directory for Cursor, Gemini CLI, and Antigravity. GitHub Copilot also supports project skills in `.github/skills/`; check your Copilot surface/version if it does not discover `.agents/skills/` automatically.

## Host-specific configuration

| Tool | Repository configuration |
|---|---|
| GitHub Copilot | `.github/copilot-instructions.md`, `.github/agents/*.agent.md`, skills |
| Gemini CLI | `GEMINI.md`, `AGENTS.md`, skills |
| Antigravity CLI | `AGENTS.md`, `.agents/skills/` |
| Cursor CLI | `AGENTS.md`, `.cursor/rules/*.mdc`, `.agents/skills/` |

Always verify the current official documentation for your installed version. Do not assume a configuration feature supported by one host is supported by another.

## Component and service discovery

Every agent should consult [the component and service catalog](component-and-service-catalog.md) before rebuilding common frontend or backend functionality. The `component-and-service-discovery` skill defines the selection workflow, compatibility checks, licensing review, security requirements, and integration standards.

The catalog covers frontend foundations, visual components, page blocks and templates; specialist forms, tables, charts, maps and icons; backend platforms, starter templates, databases, auth, storage, payments, email, jobs and caching; plus AI/data tools, testing, observability and deployment.

The catalog is curated rather than exhaustive. Community discussions (Reddit, DEV and other developer platforms) are discovery signals; verify technical claims using official documentation. Re-check pricing, availability, versions and licenses for every new hackathon.

## High-value upstream repositories

| Repository | What to look for | Adoption policy |
|---|---|---|
| [github/awesome-copilot](https://github.com/github/awesome-copilot) | Copilot custom agents, instructions, prompts, skills | Select individual assets; inspect before adopting |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | General-purpose skills maintained by Vercel | Install only relevant skills |
| [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) | Broad cross-agent skill discovery catalog | Discovery index; never bulk-install |
| [obra/superpowers](https://github.com/obra/superpowers) | Structured engineering and agentic development workflows | Evaluate workflow fit and license |
| [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) | Gemini CLI implementation and official docs | Track compatibility changes |
| [Piebald-AI/awesome-gemini-cli](https://github.com/Piebald-AI/awesome-gemini-cli) | Gemini CLI extensions and integrations | Verify extensions individually |
| [azizu06/hackathon-agent-board](https://github.com/azizu06/hackathon-agent-board) | GitHub Issue-based agent-to-agent communication | Review script changes before syncing |

## Discover and install skills

GitHub CLI has a `gh skill` command in newer releases. The official GitHub documentation describes previewing skills before installation, installing to a selected agent host, and updating skills using recorded provenance. This command requires GitHub CLI 2.90.0 or later; older versions do not provide it.

Examples (check `gh skill --help` first):
```bash
gh skill search frontend
gh skill preview github/awesome-copilot documentation-writer
gh skill install github/awesome-copilot documentation-writer --agent github-copilot --scope project
gh skill install vercel-labs/agent-skills --agent cursor --scope project
gh skill update --all
```

Do not blindly install a whole skills collection. Third-party skills are instructions and may include scripts; inspect `SKILL.md`, scripts, source, and license first. Prefer pinned versions for important workflows.

## Included baseline skills

The repository ships project-owned skills for hackathon MVP planning, parallel-agent coordination, API contracts, frontend quality, security review, quality gates, demo readiness, and component/service discovery. It also includes selected skills from GitHub's awesome-copilot collection: `documentation-writer` and `create-implementation-plan`. Copilot has specialist agent profiles for planning, frontend implementation, testing, and code review. Third-party content and its MIT license are tracked in `THIRD_PARTY.md`.

## Upstream update automation

The scheduled GitHub Action checks each repository's default-branch commit and updates `config/upstream-lock.json`. It then syncs only the explicitly allowlisted files in `config/upstream-files.json` from those pinned commits. If anything changes, it opens a pull request.

It never copies arbitrary files or executes upstream scripts. Review the PR, read the upstream changelog/diff, inspect licenses and skill instructions, then merge deliberately. This avoids silently importing prompt injections, breaking changes, or incompatible instructions.
