# Getting Started

## Prerequisites

- Node.js 20+ and npm.
- A PostgreSQL database. The deployment configuration uses Neon.
- A Groq API key for live multi-agent analysis.
- Git.

Use the Node.js version supported by the installed Next.js 16 release. The project does not require a separate Python service.

## Installation

```bash
git clone https://github.com/Mzaq1559/RIPPLENET.git
cd RIPPLENET
npm install
```

## Environment variables

Copy the template:

```bash
cp .env.example .env
```

Configure:

| Variable | Required | Description |
|---|---:|---|
| `DATABASE_URL` | Yes | PostgreSQL pooled connection string used for application queries |
| `DIRECT_URL` | Yes | Direct PostgreSQL connection string used by Prisma schema operations |
| `GROQ_API_KEY` | For live AI | Secret API key for Groq; server-side only |
| `GROQ_MODEL` | No | Groq model identifier; default is `openai/gpt-oss-120b` |

Use provider-issued connection strings and credentials. Do not put secrets in `NEXT_PUBLIC_*` variables, client components, screenshots, issue comments, or commits.

## Database initialization

Generate Prisma Client and apply the current schema:

```bash
npx prisma generate
npx prisma db push
```

If you intentionally need sample records, inspect `prisma/seed.js` and then run:

```bash
npm run db:seed
```

Seed data is for development/demo use. Verify any seeded credentials in the seed script and never reuse them in a public deployment.

**Data safety:** `npm run db:reset` is destructive. It applies the schema with data-loss acceptance and runs the seed script. Only use it against a disposable local database.

## Run locally

```bash
npm run dev
```

Visit http://localhost:3000.

For live AI analysis, use a valid Groq key and open a persisted request through the camp queue. The static demo page is a scenario preview and must not be presented as a live model run.

## Quality checks

```bash
npx eslint app/status/page.tsx app/queue/page.tsx
npm run build
```

The repository's full lint command may report issues in unrelated legacy files. Record the exact command and output when reporting status; do not claim lint is clean based on a targeted run.

The build script runs `prisma generate` followed by `next build`. It does not verify that the database is reachable, Groq credentials are valid, or external APIs are available at runtime.

## Production deployment

A typical deployment on Vercel requires:

1. Import the repository into the deployment platform.
2. Configure `DATABASE_URL`, `DIRECT_URL`, and `GROQ_API_KEY` as server-side environment variables.
3. Optionally set `GROQ_MODEL`.
4. Ensure the database is reachable from the deployment environment.
5. Run the deployment build and verify the deployed request, login, queue, and AI flows with non-sensitive demo data.

The package includes a `vercel-build` script that runs Prisma generation, `prisma db push`, and the Next.js build. Schema mutation during deployment should be reviewed carefully; for a production-grade release, use a controlled migration workflow and backup/rollback plan rather than casually applying schema changes.

## Troubleshooting

### AI analysis says it is not configured

- Confirm `GROQ_API_KEY` exists in the server environment.
- Restart the development server after changing `.env`.
- Do not prefix the variable with `NEXT_PUBLIC_`.

### Provider rate limit or timeout

- Groq may return a rate-limit response or be temporarily unavailable.
- The current adapter uses a 25-second request timeout.
- Retry after the provider's limit window; avoid repeatedly refreshing the analysis page.

### Agent returns failed / invalid JSON

- Check server logs for the sanitized provider status.
- Confirm the configured model supports the requested JSON response format.
- A failed agent is an explicit failure, not a fabricated fallback.

### Database connection errors

- Verify both connection strings and SSL parameters.
- Use the pooled URL for application traffic and direct URL for schema operations.
- Confirm the database is active and network access is allowed.

### Weather or route evidence is unavailable

- Open-Meteo and OSRM are external dependencies.
- Check network connectivity and service response; do not replace missing values with guessed values.
- OSRM route distance and ETA do not prove road passability during a flood.

### Build succeeds but login or live analysis fails

A production build checks compilation and static generation. It does not exercise credentials, database writes, authorization, provider API calls, or end-to-end workflows. Run the demo checklist in [demo-guide.md](demo-guide.md).
