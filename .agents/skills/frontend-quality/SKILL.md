---
name: frontend-quality
description: Build and review polished, accessible, responsive frontend experiences for hackathon demos, including UI states, forms, performance, and visual consistency.
---

# Frontend Quality

## Before implementation
- Inspect the existing framework, routing, design tokens, component patterns, and dependencies.
- Read `.agents/skills/component-and-service-discovery/SKILL.md` and consult `docs/component-and-service-catalog.md` when choosing reusable UI components.
- Identify the primary user journey and the smallest set of screens needed for the MVP.
- Look for maintained prebuilt components, blocks, templates, and specialist libraries before rebuilding common patterns. Check compatibility, source, license, and dependencies.
- Reuse existing components and styles; do not add a UI library without a clear reason.
- Prefer one primary component system. For React + Tailwind, evaluate shadcn/ui as a foundation and React Bits, Magic UI, Aceternity UI, Motion Primitives, or 21st.dev for selective visual elements. Consider Mantine, HeroUI, MUI, or Ant Design when a complete system is more appropriate.

## Implementation
- Build responsive layouts for narrow mobile, tablet, and desktop widths.
- Use semantic HTML, keyboard-accessible controls, visible focus states, and meaningful labels.
- Include loading, empty, success, validation, and failure states.
- Keep forms understandable and validate on both client and server.
- Use consistent spacing, typography, contrast, and component states.
- Respect reduced-motion preferences; use animation to support hierarchy, not distract.
- Avoid fake interactions, placeholder buttons, and decorative data presented as real.

## Review
- Exercise the main flow with keyboard and mouse.
- Check layout overflow, console errors, broken assets, and slow or blocking interactions.
- Verify that the UI communicates API failures and recovery paths honestly.
- Confirm copied components retain required attribution and comply with their license.
