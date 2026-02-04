#!/usr/bin/env bash
# Mirror docs.sui.io locally (full Sui protocol docs).
# Usage: ./crawl-docs.sh [OUTPUT_DIR]
# Default OUTPUT_DIR: ./mirror/docs.sui.io
# Requires: wget, nvm use 20 (optional, for env)

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="${1:-$SCRIPT_DIR/mirror/docs.sui.io}"
mkdir -p "$OUTPUT_DIR"
cd "$SCRIPT_DIR"

echo "=== SUI docs mirror: docs.sui.io -> $OUTPUT_DIR ==="

# Polite crawl: limit rate, wait between requests, stay on domain
wget \
  --mirror \
  --convert-links \
  --adjust-extension \
  --page-requisites \
  --no-parent \
  --domains=docs.sui.io \
  --no-check-certificate \
  --user-agent="Mozilla/5.0 (compatible; SuiDocsMirror/1.0)" \
  --limit-rate=500k \
  --wait=1 \
  --random-wait \
  --reject='*.mp4,*.mp3,*.avi,*.zip,*.tar.gz' \
  -P "$(dirname "$OUTPUT_DIR")" \
  "https://docs.sui.io/"

echo "=== Done. Docs saved under $OUTPUT_DIR ==="
