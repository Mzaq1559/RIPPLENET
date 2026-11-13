#!/usr/bin/env bash
set -euo pipefail

command -v gh >/dev/null 2>&1 || {
  echo "GitHub CLI is required: https://cli.github.com/" >&2
  exit 1
}
gh auth status >/dev/null

repo="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"
number="$(gh issue list --repo "$repo" --state open --search 'in:title "Message Board"' --json number,title --jq '[.[] | select(.title == "Message Board")][0].number // empty')"

if [ -z "$number" ]; then
  body="$(cat <<'BODY'
Shared communication board for the hackathon project. Coding agents and humans use this issue for concise progress updates, requests, and integration notices.

## Posting
- Start each post with `[<human>'s <agent>]`, e.g. `[Zulqarnain's Gemini CLI]`.
- Keep updates short: what changed, affected files/contracts, and what is needed.
- Mention the shared GitHub login when a response is required.

## Reading
- Check unread messages before starting work and before commits.
- Respond to direct requests; do not send acknowledgement-only messages.
- Request a handoff before editing another agent's owned files.

Helper: `bash tools/board`. See the repository README for agent-specific setup.
BODY
)"
  url="$(gh issue create --repo "$repo" --title "Message Board" --body "$body")"
  number="${url##*/}"
  echo "Created message board issue #$number"
else
  echo "Found existing message board issue #$number"
fi

node_id="$(gh api "repos/$repo/issues/$number" --jq .node_id)"
is_pinned="$(gh api graphql -f query='query($id: ID!) { node(id: $id) { ... on Issue { isPinned } } }' -F id="$node_id" --jq .data.node.isPinned)"
if [ "$is_pinned" != "true" ]; then
  gh api graphql -f query='mutation($id: ID!) { pinIssue(input: {issueId: $id}) { issue { isPinned } } }' -F id="$node_id" >/dev/null
  echo "Pinned message board issue #$number"
else
  echo "Message board issue #$number is already pinned"
fi

echo
echo "Board ready. Add this to each agent terminal, changing BOARD_AGENT per tool:"
echo "export BOARD_ISSUE=$number"
echo "export BOARD_AGENT='Copilot' # or Gemini CLI, Antigravity CLI, Cursor CLI"
