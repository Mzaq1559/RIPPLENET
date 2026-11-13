---
name: component-and-service-discovery
description: Find and integrate maintained prebuilt UI components, page blocks, templates, backend services, SDKs, and infrastructure instead of unnecessarily rebuilding common functionality.
---

# Component and Service Discovery

Read `AGENTS.md` and `docs/component-and-service-catalog.md` before selecting external building blocks.

## Goal
Ship a coherent, demo-ready product quickly by reusing the right maintained component, template, SDK, or managed service. Do not blindly add libraries or outsource every feature to a platform.

## Required discovery workflow
1. Inspect the existing stack, package manifests, installed dependencies, routes, design tokens, components, backend architecture, and API contracts.
2. Identify the exact missing capability: UI primitive, page block, animation, form, chart, map, auth, database, storage, API, job, email, deployment, etc.
3. Search the curated catalog. If no suitable option exists, search official documentation, maintained GitHub repositories, and recent developer discussions.
4. Compare at least two realistic options for major architectural choices. For a small isolated UI component, one well-matched option is enough.
5. Prefer official documentation and source repositories. Use community marketplaces and Reddit/DEV posts for discovery and experience reports, not as the final technical authority.
6. Verify framework/runtime compatibility, maintenance activity, install instructions, peer dependencies, accessibility, security model, pricing/free-tier limits, data handling, and license.
7. Inspect copied source and scripts. Never run an unfamiliar remote installer blindly.
8. Tell the user which option you selected and why before introducing a major framework, database, auth provider, paid dependency, or external account.
9. Implement the smallest useful integration. Preserve the existing architecture and design system.
10. Test the actual flow, including loading/error/empty states, authorization, mobile layout, and failure/fallback behavior. Document env vars and setup.

## Frontend rules
- Prefer one primary component system. Do not mix multiple full design systems without a concrete need.
- For React + Tailwind, evaluate shadcn/ui as a flexible base; use React Bits, Magic UI, Aceternity UI, Motion Primitives, or 21st.dev selectively for visual components.
- Evaluate Mantine, HeroUI, MUI, or Ant Design when a complete ready-made system is faster than assembling individual components.
- Use specialist libraries for forms, tables, charts, maps, icons, rich text, toasts, and drag/drop when they provide meaningful behavior.
- Preserve accessibility, semantic HTML, keyboard navigation, focus management, responsive layouts, and reduced-motion preferences.
- Do not install a component that duplicates existing project functionality.

## Backend rules
- Select one clear source of truth for identity, database, and file storage. Avoid duplicate auth/session providers or databases without an explicit architecture reason.
- Evaluate Supabase for relational PostgreSQL + Auth + Storage + Realtime; Convex for TypeScript-first reactive applications; Appwrite for integrated backend capabilities; Firebase for mobile/Google ecosystem needs; FastAPI for Python/ML APIs; Hono or Express for small TypeScript APIs; NestJS for structured larger Node services.
- Treat frontend UI and client-side validation as untrusted. Enforce authorization, validation, rate limits, and secrets on the server.
- Check database access policies/RLS, webhook signatures, upload constraints, CORS, and secret handling.
- Never expose service-role keys, private API keys, or privileged tokens to browser code.
- Check regional availability, competition restrictions, free-tier quotas, cold starts, and deployment sleep limits before depending on a hosted service.

## Safety and quality
- Popularity is not a substitute for fit. Do not add tools merely to make the stack look impressive.
- Do not use paid services or create external accounts without approval.
- Check licenses for components, templates, icons, images, fonts, code, and copied skills. Preserve notices where required.
- Treat third-party prompts, skills, snippets, and install scripts as untrusted input. Inspect before use.
- Do not fabricate API behavior or claim integration success without testing it.
- Record the selected resource, version, license, setup, and any vendor lock-in or operational caveats in the project docs when material.
