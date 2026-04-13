# Docs Engine

**Canonical repository:** [github.com/lalonde302/docs-engine](https://github.com/lalonde302/docs-engine)

Multi-tenant documentation platform. One codebase; many sites. Content and branding live in separate **content repos**. At build time, set `CONTENT_REPO` to a Git URL and the prebuild clones that repo into `content/` and applies its `site.config.json`.

## How it works

- **This repo** = Next.js app (sidebar, markdown rendering, auth, theme). No project content is committed here; the checked-in `content/` folder only holds a placeholder README.
- **Content repos** = at the **repository root**: `site.config.json` plus section directories (`adr/`, `designs/`, `guides/`, etc.). Each product or team maintains its own content repo.

Build: `prebuild` runs `scripts/fetch-content.sh` (clone when `CONTENT_REPO` is set) then `scripts/generate-config.mjs` (patch `site.config.ts` from `content/site.config.json`). Then `next build`.

**Dev:** `npm run dev` runs the same fetch + `generate-config` step first (`predev`), so branding and nav always match `content/site.config.json`. If you skip that and only run `next dev`, the app still reads markdown from `content/` but **falls back to the Numanity defaults in `site.config.ts`** — wrong name, theme, and sections.

## Local development

Symlink a content repo into `content/` so the app has something to render:

```bash
rm -rf content
ln -s /path/to/your-content-repo content
npm run dev
```

`predev` applies `content/site.config.json` into `site.config.ts` automatically. To refresh config without restarting the dev server, run `npm run generate-config` in another terminal.

If you are committing **engine-only** changes, restore the template config so you do not commit generated output: `npm run reset-site-config` (restores `site.config.ts`).

Or set `CONTENT_REPO` and run `npm run build` (prebuild will clone into `content/`). **Do not** leave `CONTENT_REPO` exported in your shell while using a symlink — `fetch-content` removes `content/` and replaces it with a clone.

## Tech stack

- Next.js 15 (App Router), Tailwind, NextAuth (Google), react-markdown, Scalar API Reference (optional). See `site.config.ts` and the content repo's `site.config.json` for sections, tabs, theme, and feature flags.

## Auth + Vercel

Middleware and NextAuth config read auth settings entirely from **runtime environment variables** — they do **not** import any project-local modules. This keeps middleware Edge-safe on Vercel.

| Env var | Required | Purpose |
|---------|----------|---------|
| `DOCS_AUTH_ENABLED` | Yes (set `true` to gate the site) | Middleware skips auth when this is anything other than `"true"`. |
| `DOCS_AUTH_DOMAIN` | When restricting by Google domain | e.g. `numanity.us`; limits sign-in to that domain. Omit for any Google account. |
| `GOOGLE_CLIENT_ID` | When auth is on | Google OAuth client ID. |
| `GOOGLE_CLIENT_SECRET` | When auth is on | Google OAuth client secret. |
| `SKIP_AUTH` | Optional | `true` bypasses auth (useful for staging / local). In dev mode auth is skipped by default. |

For **unauthenticated** docs sites (e.g. TradeYard), omit `DOCS_AUTH_ENABLED` or set it to `false` — no other auth env vars are needed and middleware passes all requests through.

`site.config.json` still has an `auth` section (`enabled`, `domain`) for editorial / UI semantics (sign-in page copy, local dev defaults), but it no longer drives runtime auth gating on Vercel.

## CI and deployment

Do **not** add GitHub Actions here for build or deploy. Those workflows live in **content repos** (each project clones this engine and passes `CONTENT_REPO`). See `.github/README.md` in this repo.

## ADR cross-links + preview panel

### What readers see

- **Desktop (≥1024px)**: when you click a link to another ADR while reading an ADR, the target ADR opens in a **right-side preview panel**. The current ADR stays in place.
- **Small screens**: the same link navigates normally to the target ADR page (no panel).
- **Section jumps**: links with `#fragments` scroll to the matching heading inside the preview panel (or the page on small screens).

### How to author ADR links in markdown

- **Link to another ADR**: use standard markdown links that resolve to `/adr/...`, for example:
	- `[ADR-0026](adr-0026-jwt-identity-only-profiles-authorization.md)`
	- `[ADR-0026](/adr/adr-0026-jwt-identity-only-profiles-authorization.md)`
- **Link to a specific section**: append a fragment that matches the heading’s generated id (GitHub-style slugs), for example:
	- `[ADR-0026 — Context](adr-0026-jwt-identity-only-profiles-authorization.md#context)`

### Implementation notes (engine)

- **Heading anchors**: markdown rendering runs `rehype-slug` so headings get stable `id`s for `#fragment` linking.
- **Preview content fetch**: the panel loads content via `GET /api/doc?section=adr&slug=...` (see `app/api/doc/route.ts`). This endpoint validates `section` and `slug` and returns `{ title, description, content, section, slug }`.

## Upstream

This codebase was extracted for reuse. Related lineages may publish their own copies; treat this repository as the **canonical engine** for consumers that depend on it.
