# Content directory

This directory is **not** part of the engine. Content is supplied at build time in one of two ways:

1. **`CONTENT_REPO`** — Set this env var to a Git URL. The prebuild script will clone that repo into `content/` before building.
2. **Symlink** — For local development, symlink a content repo here, e.g.  
   `ln -s /path/to/numanity-docs .`  
   (Content repos have `site.config.json` and section dirs like `adr/`, `designs/` at their root.)

Do not commit project-specific content to the engine repo.
