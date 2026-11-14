# Live AI Agent Runtime

RIPPLENET runs five independent Groq-powered analysis agents when a camp manager opens a real request:

1. **Flood evidence** — summarizes observed and forecast precipitation. Rainfall alone is not treated as proof of inundation, river level, soil saturation, or flood depth.
2. **Health triage support** — extracts urgency signals from reported needs. It does not diagnose, estimate outbreak probability, prescribe medicines, or replace a clinician.
3. **Logistics planning** — suggests relief items. The server checks suggested quantities against exact camp-stock names and quantities; the model cannot reserve, deduct, or create stock.
4. **Route information** — summarizes OSRM road-network distance and ETA. Road passability, closures, and vehicle suitability remain unverified unless a trusted source is added.
5. **Resource transparency** — reports that a cost estimate is unavailable until a verified price catalog exists. Placeholder prices are not used.

The five calls run concurrently. Each result includes its completion status, model identifier, a concise summary, and evidence derived from the supplied inputs. Failed agents are marked as failed; the system does not fabricate substitute results. The full result is cached on the request and reused on page refresh. A camp manager can explicitly request a new analysis; volunteer task views only read the saved result and never trigger duplicate agent runs.

## Risk and execution boundaries

- The request's numeric triage score remains a transparent deterministic heuristic. It is not an LLM-generated score, calibrated prediction, or population percentile.
- Agent output is advisory. It does not dispatch volunteers, forward requests, reserve stock, or alter request status.
- Clinical decisions require qualified medical review.
- OSRM route distance and duration are not proof of road safety or passability.
- No cost total is displayed without a verified price catalog.
- The UI displays concise findings and evidence, not hidden model chain-of-thought.

## Groq configuration

Set these server environment variables:

- `GROQ_API_KEY` — required.
- `GROQ_MODEL` — optional; defaults to `openai/gpt-oss-120b`.

The key must never be prefixed with `NEXT_PUBLIC_` or sent to the browser. The integration uses Groq's OpenAI-compatible Chat Completions endpoint and JSON mode without adding an SDK dependency.

## Data sent to Groq

The prompts include request type, priority, district, reported needs, people count, rainfall figures/source, and OSRM route metrics. Camp-stock records stay on the server and are compared locally against model-suggested item names, quantities, and units; the stock snapshot is not sent to Groq. The prompts intentionally exclude the citizen name, phone field, location field, request code, GPS coordinates, camp name, and stock snapshot. Obvious email, phone-number, and coordinate patterns inside reported-needs text are redacted. Do not put exact street addresses or other personal details into the free-text needs field. The application stores the returned advisory analysis in the request record for ten minutes.

Review the applicable data-handling terms and privacy requirements before using real citizen health or location information in production. Do not treat this hackathon integration as a certified clinical or emergency-dispatch system.

## Database update

The `Request` model stores `agentAnalysis` and `agentAnalysisAt`. After pulling this branch, regenerate the Prisma client and apply the schema change to the linked Neon database:

```bash
npx prisma db push
```

Do not run `db:reset` against a database containing data you need to preserve.
