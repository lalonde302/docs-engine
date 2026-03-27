# GitHub Actions

This repository does **not** define CI or deploy workflows.

Deployments and validation (lint, build, Vercel, etc.) are owned by **content repositories** — each site clones this engine at build time and sets `CONTENT_REPO` to its own markdown repo. See your content repo’s `.github/workflows/` (for example `tradeyard-docs`).

Rationale: the engine is a shared library; the **content repo** is what changes when docs update and should be the trigger for builds.
