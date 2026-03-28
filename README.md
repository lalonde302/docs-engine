# Docs Engine

**Canonical repository:** [github.com/lalonde302/docs-engine](https://github.com/lalonde302/docs-engine)

Multi-tenant documentation platform. One codebase; many sites. Content and branding live in separate **content repos**. At build time, set `CONTENT_REPO` to a Git URL and the prebuild clones that repo into `content/` and applies its `site.config.json`.

## How it works

- **This repo** = Next.js app (sidebar, markdown rendering, auth, theme). No project content is committed here; the checked-in `content/` folder only holds a placeholder README.
- **Content repos** = at the **repository root**: `site.config.json` plus section directories (`adr/`, `designs/`, `guides/`, etc.). Each product or team maintains its own content repo.

Build: `prebuild` runs `scripts/fetch-content.sh` (clone when `CONTENT_REPO` is set) then `scripts/generate-config.mjs` (patch `site.config.ts` and `lib/generatedAuthFlags.ts` from `content/site.config.json`). The auth flags file stays **small and Edge-safe** so Vercel middleware does not import the full `site.config` bundle. Then `next build`.

**Dev:** `npm run dev` runs the same fetch + `generate-config` step first (`predev`), so branding and nav always match `content/site.config.json`. If you skip that and only run `next dev`, the app still reads markdown from `content/` but **falls back to the Numanity defaults in `site.config.ts`** — wrong name, theme, and sections.

## Local development

Symlink a content repo into `content/` so the app has something to render:

```bash
rm -rf content
ln -s /path/to/your-content-repo content
npm run dev
```

`predev` applies `content/site.config.json` into `site.config.ts` automatically. To refresh config without restarting the dev server, run `npm run generate-config` in another terminal.

If you are committing **engine-only** changes, restore the template files so you do not commit generated config: `npm run reset-site-config` (restores `site.config.ts` and `lib/generatedAuthFlags.ts`).

Or set `CONTENT_REPO` and run `npm run build` (prebuild will clone into `content/`). **Do not** leave `CONTENT_REPO` exported in your shell while using a symlink — `fetch-content` removes `content/` and replaces it with a clone.

## Tech stack

- Next.js 15 (App Router), Tailwind, NextAuth (Google), react-markdown, Scalar API Reference (optional). See `site.config.ts` and the content repo’s `site.config.json` for sections, tabs, theme, and feature flags.

**Auth + Vercel:** Middleware does **not** import `lib/auth` (NextAuth’s full init is not Edge-safe on Vercel). It uses `getToken` from `next-auth/jwt` plus `AUTH_SECRET`. For content with `auth.enabled: true`, set **`AUTH_SECRET`** in the Vercel project environment.

## CI and deployment

Do **not** add GitHub Actions here for build or deploy. Those workflows live in **content repos** (each project clones this engine and passes `CONTENT_REPO`). See `.github/README.md` in this repo.

## Upstream

This codebase was extracted for reuse. Related lineages may publish their own copies; treat this repository as the **canonical engine** for consumers that depend on it.
