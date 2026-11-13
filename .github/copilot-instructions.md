# GitHub Copilot Instructions

Read the root `AGENTS.md` before making changes. It is the canonical project-wide instruction set.

## Copilot-specific guidance
- Use repository context and inspect existing patterns before editing.
- Prefer focused diffs and preserve the project's established stack.
- For substantial work, delegate independent tasks only when file ownership and interfaces are explicit.
- Use the relevant shared skill in `.agents/skills/` when the task matches it.
- Before finishing, run the most relevant tests and report commands and results accurately.
- Never say a task is complete when tests, builds, or required checks were not run.
