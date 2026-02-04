# SUI Protocol — Full Docs & Crawl

This folder holds an **in-depth index** of Sui protocol documentation and **every SDK** (official and community), plus scripts to **copy/crawl** and **wget** mirror the docs locally.

## Contents

| File | Purpose |
|------|--------|
| **SUI_DOCS_INDEX.md** | Full index: docs.sui.io sections, all SDKs (TS, Rust, dApp Kit, zkSend, Vue, Dart, Go, Kotlin, Python, Swift), Framework, API, data access, crawl targets |
| **crawl-docs.sh** | wget mirror of **docs.sui.io** (guides, concepts, references) |
| **crawl-sdk-docs.sh** | wget mirror of **sdk.mystenlabs.com** (TypeScript SDK, dApp Kit, zkSend, TypeDoc) |
| **crawl-all.sh** | Runs both crawls; optional manual steps for Rust SDK & pysui docs |
| **mirror/** | Output directory for mirrored HTML (gitignored) |

## Quick start

```bash
# Use Node 20 if you use nvm (recommended)
nvm use 20

# Make scripts executable once
chmod +x crawl-docs.sh crawl-sdk-docs.sh crawl-all.sh

# Mirror main Sui docs only
./crawl-docs.sh

# Mirror TypeScript/dApp Kit/zkSend docs only
./crawl-sdk-docs.sh

# Mirror both (full docs + SDK docs)
./crawl-all.sh
```

Custom output directory:

```bash
./crawl-docs.sh /path/to/docs-mirror
./crawl-sdk-docs.sh /path/to/sdk-mirror
```

## What gets mirrored

1. **docs.sui.io** — Guides (developer + operator), Concepts (Move, tokenomics, data access, cryptography), References (Sui API, SDKs, Rust SDK, Awesome Sui), Standards.
2. **sdk.mystenlabs.com** — TypeScript SDK quick start, dApp Kit, zkSend link builder, Slush Wallet dApp integration, TypeDoc API reference.

Optional (run manually, see SUI_DOCS_INDEX.md):

- **mystenlabs.github.io/sui** — Rust SDK crate docs  
- **pysui.readthedocs.io** — Python (pysui) docs  

## Full index

Open **SUI_DOCS_INDEX.md** for:

- Every docs.sui.io section with direct URLs  
- Every official SDK: TypeScript, dApp Kit, Rust, zkSend (with doc and repo links)  
- Every community SDK: Vue dApp Kit, Dart, Go, Kotlin (Ksui), Python (pysui), Swift (SuiKit)  
- Sui Framework, Sui RPC/API, gRPC, GraphQL RPC (beta), networks  
- Crawl targets summary and clone URLs for source repos  

## Notes

- **JSON-RPC is deprecated**; migrate to gRPC or GraphQL RPC by April 2026 (see docs).  
- Mirror output is under `docs-sui/mirror/` and is gitignored to avoid large commits.  
- Crawls are rate-limited and polite; **full mirror can take 10–30+ minutes**. Run without timeout for complete crawl: `./crawl-docs.sh` (no timeout in script).  
- An initial crawl was run; you have a partial mirror. Re-run `./crawl-docs.sh` to continue or get a fresh full mirror.
