#!/bin/bash
#
# Fetches an external content repo into content/ when CONTENT_REPO is set.
# If CONTENT_REPO is unset, the repo's own content/ directory is used as-is.
#
# Optional env vars:
#   CONTENT_REPO   - Git URL of the content repository
#   CONTENT_BRANCH - Branch to clone (default: main)

set -euo pipefail

if [ -z "${CONTENT_REPO:-}" ]; then
	echo "[fetch-content] CONTENT_REPO not set — using local content/"
	exit 0
fi

BRANCH="${CONTENT_BRANCH:-main}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
CONTENT_DIR="$ROOT_DIR/content"

echo "[fetch-content] Cloning $CONTENT_REPO (branch: $BRANCH) into content/"

rm -rf "$CONTENT_DIR"
git clone --depth 1 --branch "$BRANCH" "$CONTENT_REPO" "$CONTENT_DIR"

# Remove the nested .git so it doesn't confuse Next.js or Vercel
rm -rf "$CONTENT_DIR/.git"

echo "[fetch-content] Content fetched successfully."
