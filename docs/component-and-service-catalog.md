# Reusable components, templates, and service directory

A curated starting point for coding agents and hackathon teams. Prefer integrating maintained components and services over recreating common UI, auth, storage, payments, charts, maps, or infrastructure from scratch.

This is a discovery directory, not an endorsement of every product or a requirement to use every tool. Check current docs, framework compatibility, maintenance activity, pricing/limits, data handling, and the exact license before adopting anything. Availability and free tiers change.

## Agent decision rule

Before implementing a common feature:

1. Inspect the project's framework, installed packages, design system, API contracts, and existing components.
2. Search this directory for a fitting maintained component, template, SDK, or managed service. Search official documentation and source repositories when the directory is insufficient.
3. Prefer the smallest compatible component that solves the requirement. Reuse the project's existing stack if it is already adequate.
4. Read installation instructions, peer dependencies, supported framework versions, accessibility notes, and license. For copy-paste components, inspect the actual source before adding it.
5. Check whether the feature needs a backend service or only a UI component. Never treat a frontend widget as authorization, validation, or secure business logic.
6. Present the selected option, reason, trade-offs, pricing/free-tier caveats, and any alternative before adding a major dependency or external service.
7. Integrate, test the real user flow, and document setup, environment variables, fallback behavior, and vendor-specific assumptions.

Do not install entire component packs or run unknown install scripts without inspecting them. Do not use paid services or create external accounts without approval. Do not copy assets or code with unclear licensing.

## Frontend: foundations and complete component systems

| Resource | Best fit | Agent guidance |
|---|---|---|
| [shadcn/ui](https://ui.shadcn.com/) | Customizable React application components and accessible building blocks | Strong default for React + Tailwind projects when the team wants component source in the repo. Check the current registry and supported base primitives. |
| [Radix UI](https://www.radix-ui.com/primitives) | Unstyled accessible interaction primitives | Use when the design system needs control over styling but should not reinvent keyboard and focus behavior. |
| [Base UI](https://base-ui.com/) | Unstyled accessible React components | Consider as a primitives foundation; verify compatibility with the existing shadcn/ui setup before mixing foundations. |
| [Mantine](https://mantine.dev/) | Broad ready-to-use React component system | Good when speed and a comprehensive package matter more than copying every component into the repo. |
| [HeroUI](https://www.heroui.com/) | Styled React components and application UI | Consider for a cohesive component system; verify framework and Tailwind version requirements. |
| [MUI](https://mui.com/) | Mature, data-heavy and enterprise-style React interfaces | Strong option for admin panels and complex data interfaces; avoid adding it alongside another full design system without a reason. |
| [Ant Design](https://ant.design/) | Enterprise dashboards and dense business workflows | Consider for tables, forms and admin workflows; keep the visual language consistent. |
| [daisyUI](https://daisyui.com/) | Fast Tailwind-based prototyping | Useful when a lightweight class-based component approach fits the project. |

**Default selection:** use one primary component system. Do not combine shadcn/ui, Mantine, MUI, and Ant Design indiscriminately.

## Frontend: visual components, blocks, and templates

| Resource | Best fit | Agent guidance |
|---|---|---|
| [React Bits](https://reactbits.dev/) | Animated text, backgrounds, effects and interactive React components | Excellent for selective visual polish. Inspect component source, styling variant, dependencies, and license before copying. |
| [Magic UI](https://magicui.design/) | Animated landing-page components, effects and sections | Use for a few high-impact sections; avoid making every element animated. |
| [Aceternity UI](https://ui.aceternity.com/) | Visually distinctive landing-page components and blocks | Use selectively for hero sections and visual storytelling; check each component's requirements and license. |
| [21st.dev](https://21st.dev/) | Discovering community-built React components and AI-friendly component workflows | Treat as a marketplace/discovery source. Review the author, source, dependencies, and license for each component. |
| [Motion Primitives](https://motion-primitives.com/) | Reusable motion and interaction patterns | Consider for purposeful transitions and micro-interactions. |
| [Tailark](https://tailark.com/) | Landing-page sections and marketing layouts | Useful when a project needs a fast marketing shell; verify free/paid boundaries. |
| [shadcn/ui Blocks](https://ui.shadcn.com/blocks) | Page-level layouts and common application sections | Prefer blocks that match the chosen shadcn/ui foundation. |
| [Uiverse](https://uiverse.io/) | Small community-made CSS/HTML UI elements | Use for isolated decorative elements only after reviewing code, accessibility, and licensing. |
| [Figma Community](https://www.figma.com/community) | Design references, kits and UI templates | Treat as design input, not production code; check asset licensing and recreate consistently in the app. |

## Frontend: specialist building blocks

| Need | Recommended starting points |
|---|---|
| Icons | [Lucide](https://lucide.dev/), [Phosphor](https://phosphoricons.com/) |
| Forms and validation | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/); [TanStack Form](https://tanstack.com/form/latest) for typed form state |
| Tables and data grids | [TanStack Table](https://tanstack.com/table/latest); [AG Grid](https://www.ag-grid.com/) for advanced grids |
| Charts | [Recharts](https://recharts.org/), [Apache ECharts](https://echarts.apache.org/), [Tremor](https://www.tremor.so/) |
| Animation | [Motion](https://motion.dev/), [GSAP](https://gsap.com/) when the interaction genuinely needs it |
| Rich-text editing | [Tiptap](https://tiptap.dev/) |
| Maps | [MapLibre](https://maplibre.org/), [Mapcn](https://mapcn.dev/) for React/shadcn-oriented map components |
| Command menus | [cmdk](https://cmdk.paco.me/) |
| Toasts | [Sonner](https://sonner.emilkowal.ski/) |
| Drag and drop | [dnd kit](https://dndkit.com/) |
| Accessible primitives | [React Aria](https://react-spectrum.adobe.com/react-aria/) |
| Component examples across design systems | [Component Gallery](https://component.gallery/) |

## Backend: choose the simplest suitable backend

| Resource | Best fit | Trade-offs / guidance |
|---|---|---|
| [Supabase](https://supabase.com/) | Fast full-stack apps needing PostgreSQL, Auth, Storage, Realtime and Edge Functions | Strong default for relational hackathon apps and SQL portability. Design Row Level Security policies carefully; never expose service-role secrets in the browser. |
| [Convex](https://convex.dev/) | TypeScript-first apps where reactive real-time data is central | Productive integrated backend with reactive queries and server functions; learn its data model and assess platform constraints before committing. |
| [Appwrite](https://appwrite.io/) | Integrated Auth, databases, storage, functions, messaging and realtime | Useful all-in-one option with SDKs, MCP and agent skills. Check cloud/self-hosting requirements. |
| [Firebase](https://firebase.google.com/) | Mobile-first apps, Google ecosystem integrations, push and analytics | Mature ecosystem; understand Firestore data modeling, security rules, and service-specific pricing. |
| [PocketBase](https://pocketbase.io/) | Small prototypes and self-hosted apps needing a compact backend | Very fast to start; assess scaling, operational and deployment constraints before choosing it for a critical workload. |
| [FastAPI](https://fastapi.tiangolo.com/) | Custom Python APIs, ML/CV/LLM inference and data processing | Good default when the project needs Python libraries or a dedicated inference service. Add auth, persistence, validation, and observability deliberately. |
| [Hono](https://hono.dev/) | Lightweight TypeScript APIs and edge runtimes | Good for small APIs and serverless/edge deployments; verify runtime compatibility for every dependency. |
| [NestJS](https://nestjs.com/) | Structured Node.js/TypeScript backend with modules and dependency injection | Better for larger or more complex services than a tiny hackathon API. |
| [Express](https://expressjs.com/) | Minimal Node.js HTTP APIs and existing Express codebases | Flexible and familiar, but teams must choose validation, auth, error handling and structure. |

### Backend templates and starter kits

- [FastAPI Full Stack Template](https://github.com/fastapi/full-stack-fastapi-template) — reference implementation for a Python full-stack app; inspect its deployment and dependency choices before adopting.
- [Supabase examples](https://github.com/supabase/supabase/tree/master/examples) — official integration examples.
- [Appwrite starter templates](https://github.com/appwrite/templates) — inspect the framework-specific template closest to the project.
- [Refine](https://refine.dev/) — React framework for CRUD-heavy admin panels and internal tools; can scaffold around supported data providers.
- [create-t3-app](https://create.t3.gg/) — opinionated TypeScript full-stack starter; use only when its stack fits rather than reshaping an existing project to match it.

A template is a starting point, not proof of security or correctness. Inspect auth, authorization, secrets, migrations, dependency versions, tests, and deployment defaults.

## Backend: focused infrastructure and integrations

| Need | Options | Agent guidance |
|---|---|---|
| PostgreSQL hosting | [Neon](https://neon.tech/), [Supabase](https://supabase.com/) | Choose one database authority; do not create duplicate sources of truth. |
| ORM / query layer | [Prisma](https://www.prisma.io/), [Drizzle](https://orm.drizzle.team/) | Use only if it fits the backend and adds value; keep migrations versioned. |
| Authentication | [Clerk](https://clerk.com/), [Better Auth](https://www.better-auth.com/), [Auth.js](https://authjs.dev/), or the selected BaaS auth | Avoid multiple competing session systems. Verify server-side authorization, not just UI route guards. |
| File and image storage | [Cloudinary](https://cloudinary.com/), [UploadThing](https://uploadthing.com/), [Amazon S3](https://aws.amazon.com/s3/) or selected BaaS storage | Validate file type/size, access rules, signed URLs and upload limits. |
| Payments | [Stripe](https://stripe.com/) | Check country availability, test mode, webhook signature verification, and competition rules before designing around it. |
| Email | [Resend](https://resend.com/) | Keep API keys server-side and provide a demo fallback if email delivery is not essential. |
| Background jobs and workflows | [Inngest](https://www.inngest.com/), [Trigger.dev](https://trigger.dev/) | Use for durable async workflows when a simple request/response handler is insufficient. |
| Cache / rate limits | [Upstash](https://upstash.com/) | Add only when caching, queues or distributed rate limits are needed. |
| API contracts and docs | [OpenAPI](https://www.openapis.org/), [Swagger UI](https://swagger.io/tools/swagger-ui/) | Define and validate the contract before parallel frontend/backend work. |

## AI, data, and model integrations

| Need | Starting points |
|---|---|
| Model/API catalog | [Hugging Face](https://huggingface.co/), [OpenRouter](https://openrouter.ai/) |
| Agent frameworks | [LangGraph](https://www.langchain.com/langgraph), [LlamaIndex](https://www.llamaindex.ai/), [smolagents](https://github.com/huggingface/smolagents) |
| Vector search | [pgvector](https://github.com/pgvector/pgvector), [Qdrant](https://qdrant.tech/), [Chroma](https://www.trychroma.com/) |
| Workflow automation | [n8n](https://n8n.io/) |
| Model evaluation / observability | [Langfuse](https://langfuse.com/), [Arize Phoenix](https://phoenix.arize.com/) |

Check model licenses, API data retention, rate limits, regional availability, latency, and fallback behavior. Never place model-provider secrets in frontend bundles.

## Testing, observability, and deployment

| Need | Starting points |
|---|---|
| Browser and end-to-end tests | [Playwright](https://playwright.dev/) |
| Unit/component tests | [Vitest](https://vitest.dev/), [Testing Library](https://testing-library.com/) |
| API testing | [Bruno](https://www.usebruno.com/), [Postman](https://www.postman.com/) |
| Error monitoring | [Sentry](https://sentry.io/) |
| Product analytics | [PostHog](https://posthog.com/) |
| Frontend hosting | [Vercel](https://vercel.com/), [Netlify](https://www.netlify.com/), [Cloudflare Pages](https://pages.cloudflare.com/) |
| API/container hosting | [Render](https://render.com/), [Railway](https://railway.com/), [Fly.io](https://fly.io/) |
| Local service orchestration | [Docker Compose](https://docs.docker.com/compose/) |

For hackathons, prefer the deployment platform the team can operate reliably. Confirm free-tier limits, sleep behavior, build minutes, region, cold starts, and whether the event permits external hosting.

## What community discussions suggest

Community posts are useful signals, not objective benchmarks. They repeatedly surface shadcn/ui for customizable React UI, Mantine for a broad ready-made component set, and Supabase/Convex as common backend choices with different trade-offs.

- [Reddit: free shadcn block and component libraries](https://www.reddit.com/r/shadcn/comments/1ormdg2/)
- [Reddit: favorite React component libraries](https://www.reddit.com/r/reactjs/comments/1ibcmgo/)
- [Reddit: ready-made components for Next.js](https://www.reddit.com/r/nextjs/comments/1nofhu5/)
- [Reddit: Supabase vs Convex](https://www.reddit.com/r/SaasDevelopers/comments/1sl7omu/)
- [Reddit: backend hosting choices](https://www.reddit.com/r/vercel/comments/1sb0hwl/)
- [DEV: UI component libraries for vibe coding](https://dev.to/escape_fromrussia/the-best-ui-component-libraries-for-vibe-coding-in-2026-37oi)
- [DEV: Supabase, Convex, Firebase comparison](https://dev.to/gimnathperera/convex-vs-firebase-vs-supabase-in-2026-stop-asking-which-one-is-best-bng)

## Default hackathon selection heuristics

- **React + Tailwind app:** start with the existing design system; if none exists, evaluate shadcn/ui. Add React Bits or Magic UI only for selected visual moments.
- **Admin/dashboard app:** evaluate Mantine, MUI, Ant Design or Refine before assembling every table and form manually.
- **Relational CRUD app:** evaluate Supabase/Postgres first.
- **Real-time collaborative TypeScript app:** evaluate Convex first.
- **Python/ML/AI backend:** use FastAPI for the custom API; pair it with one database/auth/storage provider where needed.
- **Mobile-first Google-integrated app:** evaluate Firebase.
- **Very small self-hosted prototype:** evaluate PocketBase.
- **Do not choose by popularity alone.** Match the product requirements, team familiarity, data model, deployment constraints, event rules, and deadline.

Last reviewed: 2026-11-02. Verify live documentation before each project.
