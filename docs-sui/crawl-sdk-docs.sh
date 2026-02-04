#!/usr/bin/env bash
# Mirror TypeScript SDK + dApp Kit + zkSend docs from sdk.mystenlabs.com.
# Usage: ./crawl-sdk-docs.sh [OUTPUT_DIR]
# Default OUTPUT_DIR: ./mirror/sdk.mystenlabs.com

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="${1:-$SCRIPT_DIR/mirror/sdk.mystenlabs.com}"
mkdir -p "$OUTPUT_DIR"
cd "$SCRIPT_DIR"

echo "=== SUI SDK docs mirror: sdk.mystenlabs.com -> $OUTPUT_DIR ==="

wget \
  --mirror \
  --convert-links \
  --adjust-extension \
  --page-requisites \
  --no-parent \
  --domains=sdk.mystenlabs.com \
  --no-check-certificate \
  --user-agent="Mozilla/5.0 (compatible; SuiSDKMirror/1.0)" \
  --limit-rate=500k \
  --wait=1 \
  --random-wait \
  -P "$(dirname "$OUTPUT_DIR")" \
  "https://sdk.mystenlabs.com/"

echo "=== Done. SDK docs saved under $OUTPUT_DIR ==="
