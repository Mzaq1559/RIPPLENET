# RippleNet AI Documentation

This directory documents the implemented RippleNet AI hackathon prototype.

## Start here

| Document | What it covers |
|---|---|
| [Architecture](architecture.md) | System context, Mermaid diagrams, runtime components, request lifecycle and trust boundaries |
| [Getting started](getting-started.md) | Local setup, environment, database initialization, commands, deployment and troubleshooting |
| [AI agent runtime](ai-agent-runtime.md) | Five Groq agents, prompt boundaries, caching, privacy and failure behavior |
| [API reference](api-reference.md) | Current application API route surface and role expectations |
| [Data model](data-model.md) | Prisma entities, relationships and persisted AI analysis |
| [Hackathon demo guide](demo-guide.md) | Safe demo preparation, run-of-show, validation checklist and known limitations |

## Supporting references

- [Component and service catalog](component-and-service-catalog.md) — discovery notes for libraries and services.
- [Agent ecosystem](agent-ecosystem.md) — repository coding-agent configuration and shared skills. This describes development tooling, not the runtime agents used by the application.

## Documentation policy

The code is the source of truth. This project evolved quickly during a hackathon, so older planning notes may describe ideas that are not implemented. Treat roadmap ideas, mock scenarios, and third-party integrations as planned or simulated unless the current application code proves otherwise. Update the relevant document whenever a route, schema, environment variable, external service, or agent contract changes.
