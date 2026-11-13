---
name: parallel-agent-work
description: Coordinate multiple coding agents safely using task boundaries, file ownership, shared contracts, and integration checks. Use whenever two or more agents may edit the same repository.
---

# Parallel Agent Workflow

## Before parallelizing
1. Break the request into independent deliverables.
2. Assign one owner per file or directory; avoid overlapping ownership.
3. Define shared interfaces, API schemas, types, and environment variables first.
4. Give every agent the same acceptance criteria and relevant context.
5. Keep one integrator responsible for merging and end-to-end verification.

## During execution
- Agents inspect the current branch and working tree before editing.
- Agents do not overwrite another agent's uncommitted work.
- Communicate contract changes and blockers immediately.
- Use separate branches or worktrees for substantial concurrent changes.
- Do not let multiple agents run migrations or modify lockfiles simultaneously.

## Integration
1. Fetch all branches and inspect diffs.
2. Integrate one task at a time.
3. Resolve conflicts intentionally; never blindly accept one side.
4. Run integration tests after all pieces are combined.
5. Verify the complete user journey and report unresolved issues.
