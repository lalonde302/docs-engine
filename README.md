# Docs Engine

Multi-tenant documentation platform. One codebase; many sites. Content and branding live in separate **content repos**. At build time, set `CONTENT_REPO` to a Git URL and the prebuild clones that repo into `content/` and applies its `site.config.json`.

## How it works

- **This repo** = Next.js app (sidebar, markdown rendering, auth, theme). No project content is committed here; the checked-in `content/` folder only holds a placeholder README.
- **Content repos** = at the **repository root**: `site.config.json` plus section directories (`adr/`, `designs/`, `guides/`, etc.). Each product or team maintains its own content repo.

Build: `prebuild` runs `scripts/fetch-content.sh` (clone when `CONTENT_REPO` is set) then `scripts/generate-config.mjs` (patch `site.config.ts` from `content/site.config.json`). Then `next build`.

## Local development

Symlink a content repo into `content/` so the app has something to render:

```bash
rm -rf content
ln -s /path/to/your-content-repo content
npm run generate-config
npm run dev
```

Or set `CONTENT_REPO` and run `npm run build` (prebuild will clone into `content/`).

## Tech stack

- Next.js 15 (App Router), Tailwind, NextAuth (Google), react-markdown, Scalar API Reference (optional). See `site.config.ts` and the content repo’s `site.config.json` for sections, tabs, theme, and feature flags.

## Upstream

This codebase was extracted for reuse. Related lineages may publish their own copies; treat this repository as the **canonical engine** for consumers that depend on it.
