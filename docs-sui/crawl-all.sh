#!/usr/bin/env bash
# Run all SUI doc crawls: docs.sui.io, sdk.mystenlabs.com, optional Rust/ReadTheDocs.
# Usage: ./crawl-all.sh
# Optional: set SKIP_MAIN=1 to skip docs.sui.io, SKIP_SDK=1 to skip sdk.mystenlabs.com

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIRROR_BASE="${SCRIPT_DIR}/mirror"
mkdir -p "$MIRROR_BASE"

if command -v nvm &>/dev/null; then
  nvm use 20 2>/dev/null || true
fi

echo "=== SUI full docs crawl (wget mirror) ==="

if [[ "${SKIP_MAIN:-0}" != "1" ]]; then
  "${SCRIPT_DIR}/crawl-docs.sh" "${MIRROR_BASE}/docs.sui.io"
else
  echo "Skipping docs.sui.io (SKIP_MAIN=1)"
fi

if [[ "${SKIP_SDK:-0}" != "1" ]]; then
  "${SCRIPT_DIR}/crawl-sdk-docs.sh" "${MIRROR_BASE}/sdk.mystenlabs.com"
else
  echo "Skipping sdk.mystenlabs.com (SKIP_SDK=1)"
fi

echo "=== Optional: Rust SDK (GitHub Pages) and pysui (Read the Docs) ==="
echo "  Rust SDK:  wget --mirror --convert-links -P $MIRROR_BASE https://mystenlabs.github.io/sui/sui_sdk/"
echo "  pysui:     wget --mirror --convert-links -P $MIRROR_BASE https://pysui.readthedocs.io/en/stable/"
echo "  Run manually if needed. crawl-all.sh only runs main docs + SDK by default."
echo ""
echo "=== All requested crawls finished. Mirror base: $MIRROR_BASE ==="
