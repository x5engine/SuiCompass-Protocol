# SUI Protocol — Full Documentation Index

In-depth index of **Sui** protocol documentation, APIs, and **every SDK** (official and community). Use this with the crawl scripts to mirror docs locally.

---

## 1. Official documentation (primary)

| Resource | URL | Notes |
|----------|-----|--------|
| **Main docs** | https://docs.sui.io/ | Docusaurus site — use wget/crawl |
| **Guides** | https://docs.sui.io/guides | Developer & operator guides |
| **Concepts** | https://docs.sui.io/concepts | Architecture, Move, tokenomics, data access |
| **References** | https://docs.sui.io/references | API, SDKs, Sui Framework |
| **Standards** | https://docs.sui.io/standards | On-chain standards |

### 1.1 Docs sections (for crawl / wget)

**Guides — Developer**
- Getting started: https://docs.sui.io/guides/developer/getting-started/sui-install
- Sui client config: https://docs.sui.io/guides/developer/getting-started/sui-client-config
- Create address: https://docs.sui.io/guides/developer/getting-started/create-address
- Faucet: https://docs.sui.io/guides/developer/getting-started/faucet
- Hello World: https://docs.sui.io/guides/developer/getting-started/hello-world
- Object model: https://docs.sui.io/guides/developer/objects/object-model
- Object ownership: https://docs.sui.io/guides/developer/objects/object-ownership
- Transfers: https://docs.sui.io/guides/developer/objects/transfers
- Dynamic fields: https://docs.sui.io/guides/developer/objects/dynamic-fields
- Object versioning: https://docs.sui.io/guides/developer/objects/object-versioning
- Simulating references: https://docs.sui.io/guides/developer/objects/simulating-references
- Move package management: https://docs.sui.io/guides/developer/packages/move-package-management
- Package upgrades: https://docs.sui.io/guides/developer/packages/package-upgrades
- Custom policies: https://docs.sui.io/guides/developer/packages/custom-policies
- Automated address management: https://docs.sui.io/guides/developer/packages/automated-address-management
- Sign and send transactions: https://docs.sui.io/guides/developer/transactions/sign-and-send-transactions
- Building PTBs: https://docs.sui.io/guides/developer/transactions/build-ptbs
- Sponsored transactions: https://docs.sui.io/guides/developer/transactions/sponsored-transactions
- Using gRPC: https://docs.sui.io/guides/developer/data/grpc
- Query with GraphQL: https://docs.sui.io/guides/developer/data/graphql
- Custom indexing framework: https://docs.sui.io/guides/developer/data/custom-indexing-framework
- Custom indexer + Walrus: https://docs.sui.io/guides/developer/data/custom-indexer-walrus
- Using events: https://docs.sui.io/guides/developer/data/events
- Create currencies and tokens: https://docs.sui.io/guides/developer/tokens/create-currency
- Regulated currency & deny list: https://docs.sui.io/guides/developer/tokens/regulated-currency
- In-game currency: https://docs.sui.io/guides/developer/tokens/in-game-currency
- Loyalty token: https://docs.sui.io/guides/developer/tokens/loyalty-token
- Vesting strategies: https://docs.sui.io/guides/developer/tokens/vesting
- Create NFT: https://docs.sui.io/guides/developer/nfts/create-nft
- Soulbound NFT: https://docs.sui.io/guides/developer/nfts/soulbound-nft
- NFT rental: https://docs.sui.io/guides/developer/nfts/nft-rental
- Asset tokenization: https://docs.sui.io/guides/developer/nfts/asset-tokenization
- On-chain time: https://docs.sui.io/guides/developer/primitive/clock
- On-chain randomness: https://docs.sui.io/guides/developer/primitive/randomness
- Signatures in Move: https://docs.sui.io/guides/developer/cryptography/signatures-move
- Groth16: https://docs.sui.io/guides/developer/cryptography/groth16
- Hashing: https://docs.sui.io/guides/developer/cryptography/hashing
- ECVRF: https://docs.sui.io/guides/developer/cryptography/ecvrf
- Multisig: https://docs.sui.io/guides/developer/cryptography/multisig
- zkLogin: https://docs.sui.io/guides/developer/cryptography/zklogin
- OpenID providers: https://docs.sui.io/guides/developer/cryptography/openid-providers
- zkLogin example: https://docs.sui.io/guides/developer/cryptography/zklogin-example
- Nautilus overview: https://docs.sui.io/guides/developer/nautilus/overview
- Using Nautilus: https://docs.sui.io/guides/developer/nautilus/using-nautilus
- Customize Nautilus: https://docs.sui.io/guides/developer/nautilus/customize
- Dev cheat sheet: https://docs.sui.io/guides/developer/dev-cheat-sheet

**Guides — Operator**
- Operator overview: https://docs.sui.io/guides/operator/overview
- Run full node: https://docs.sui.io/guides/operator/sui-full-node
- Full node data management: https://docs.sui.io/guides/operator/full-node-data-management
- Monitoring: https://docs.sui.io/guides/operator/monitoring
- Validator config: https://docs.sui.io/guides/operator/validator/validator-config
- Bridge node: https://docs.sui.io/guides/operator/bridge-node-configuration

**Concepts**
- Networks: https://docs.sui.io/concepts/sui-architecture/networks
- Storage: https://docs.sui.io/concepts/sui-architecture/storage
- Consensus: https://docs.sui.io/concepts/sui-architecture/consensus
- Epochs & reconfiguration: https://docs.sui.io/concepts/sui-architecture/epochs
- Security: https://docs.sui.io/concepts/sui-architecture/security
- Protocol upgrades: https://docs.sui.io/concepts/sui-architecture/protocol-upgrades
- Transaction lifecycle: https://docs.sui.io/concepts/transactions/transaction-lifecycle
- Programmable transaction blocks: https://docs.sui.io/concepts/transactions/programmable-tx-blocks
- Sponsored transactions: https://docs.sui.io/concepts/transactions/sponsored-transactions
- Gas smashing: https://docs.sui.io/concepts/transactions/gas-smashing
- Coin management: https://docs.sui.io/concepts/transactions/coin-management
- Transaction authentication: https://docs.sui.io/concepts/transactions/transaction-auth
- SUI tokenomics: https://docs.sui.io/concepts/tokenomics/sui-tokenomics
- Staking and unstaking: https://docs.sui.io/concepts/tokenomics/staking-unstaking
- SUI bridging: https://docs.sui.io/concepts/tokenomics/sui-bridging
- Gas fees: https://docs.sui.io/concepts/tokenomics/gas-fees
- Move concepts: https://docs.sui.io/concepts/sui-move-concepts
- Move packages: https://docs.sui.io/concepts/move-packages
- Move conventions: https://docs.sui.io/concepts/move-conventions
- Move 2024 migration: https://docs.sui.io/concepts/move-2024-migration
- Data access overview: https://docs.sui.io/concepts/data-access/data-serving
- GraphQL indexer: https://docs.sui.io/concepts/data-access/graphql-indexer
- GraphQL RPC: https://docs.sui.io/concepts/data-access/graphql-rpc
- Cryptography: https://docs.sui.io/concepts/cryptography
- zkLogin: https://docs.sui.io/concepts/zklogin
- Passkeys: https://docs.sui.io/concepts/passkeys
- Nautilus: https://docs.sui.io/concepts/nautilus
- Checkpoint verification: https://docs.sui.io/concepts/checkpoint-verification
- Gaming: https://docs.sui.io/concepts/gaming
- Research papers: https://docs.sui.io/concepts/research-papers

**References**
- Sui RPC (API): https://docs.sui.io/references/sui-api
- Sui SDKs: https://docs.sui.io/references/sui-sdks
- Rust SDK: https://docs.sui.io/references/rust-sdk
- Awesome Sui: https://docs.sui.io/references/awesome-sui

---

## 2. Sui Framework (Move standard library)

| Resource | URL |
|----------|-----|
| Framework docs (GitHub) | https://github.com/MystenLabs/sui/tree/main/crates/sui-framework/docs |

---

## 3. Official SDKs (with docs / crawl URLs)

### 3.1 TypeScript SDK
| Resource | URL | Crawl |
|----------|-----|--------|
| Quick start & docs | https://sdk.mystenlabs.com/ | Yes (wget) |
| TypeScript section | https://sdk.mystenlabs.com/typescript | |
| API reference (TypeDoc) | https://sdk.mystenlabs.com/typedoc/index.html | Yes |
| NPM | `@mysten/sui` | |
| Repo | https://github.com/mystenlabs/ts-sdks | Clone |

Packages: `@mysten/sui/client`, `@mysten/sui/transactions`, `@mysten/sui/keypairs/*`, `@mysten/sui/cryptography`, `@mysten/sui/bcs`, `@mysten/sui/multisig`, `@mysten/sui/faucet`, `@mysten/sui/zklogin`, `@mysten/sui/utils`.

### 3.2 dApp Kit (React)
| Resource | URL | Crawl |
|----------|-----|--------|
| Docs | https://sdk.mystenlabs.com/dapp-kit | Yes |
| RPC hooks | https://sdk.mystenlabs.com/dapp-kit/rpc-hooks | |
| TypeDoc module | https://sdk.mystenlabs.com/typedoc/modules/_mysten_dapp-kit.html | |
| NPM | `@mysten/dapp-kit` | |

### 3.3 Rust SDK
| Resource | URL | Crawl |
|----------|-----|--------|
| Crate docs (GitHub Pages) | https://mystenlabs.github.io/sui/sui_sdk/index.html | Yes |
| sui_sdk_types | https://mystenlabs.github.io/sui-rust-sdk/sui_sdk_types/index.html | Yes |
| Docs page on docs.sui.io | https://docs.sui.io/references/rust-sdk | Via main crawl |
| Crate in main repo | https://github.com/MystenLabs/sui/tree/main/crates/sui-sdk | Clone |
| Standalone Rust SDK repo | https://github.com/MystenLabs/sui-rust-sdk | Clone |
| Cargo | `sui-sdk = { git = "https://github.com/mystenlabs/sui", package = "sui-sdk" }` | |

### 3.4 zkSend SDK
| Resource | URL | Crawl |
|----------|-----|--------|
| Link builder docs | https://sdk.mystenlabs.com/zksend/link-builder | Yes |
| NPM | `@mysten/zksend` | |
| Slush Wallet (dApp integration) | https://sdk.mystenlabs.com/slush-wallet/dapp | Yes |

---

## 4. Community SDKs (with docs / repos)

### 4.1 dApp Kit (Vue)
| Resource | URL |
|----------|-----|
| Repo | https://github.com/SuiCraftTeam/Sui-dApp-Kit-Vue |
| Docs | https://suicraftteam.github.io/sui-dapp-kit-vue/ (if published) |

### 4.2 Dart SDK
| Resource | URL |
|----------|-----|
| Listed in official docs | https://docs.sui.io/references/sui-sdks (see Community SDKs) |
| Search: "Sui Dart SDK" for current repo | |

### 4.3 Go SDK
| Resource | URL |
|----------|-----|
| Listed in official docs | https://docs.sui.io/references/sui-sdks (see Community SDKs) |
| Search: "Sui Go SDK" for current repo | |

### 4.4 Kotlin SDK (Ksui)
| Resource | URL |
|----------|-----|
| Description | Kotlin Multiplatform JSON-RPC wrapper + crypto for Sui full node |
| Official docs link | https://docs.sui.io/references/sui-sdks |
| Search: "Ksui Kotlin Sui" for repo | |

### 4.5 Python SDK (pysui)
| Resource | URL | Crawl |
|----------|-----|--------|
| Repo | https://github.com/FrankC01/pysui | Clone |
| Read the Docs | https://pysui.readthedocs.io/en/stable | Yes (wget) |
| PyPI | https://pypi.org/project/pysui/ | |
| Install | `pip install pysui` | |

### 4.6 Swift SDK (SuiKit)
| Resource | URL |
|----------|-----|
| Repo | https://github.com/OpenDive/SuiKit |
| Alternative (Cosmostation) | https://github.com/cosmostation/suiswift (SuiSwift, iOS beta) |

---

## 5. Data access & RPC

| Resource | URL | Notes |
|----------|-----|--------|
| Access Sui data | https://docs.sui.io/concepts/data-access/data-serving | Overview |
| gRPC | https://docs.sui.io/concepts/data-access/grpc | Preferred over JSON-RPC |
| GraphQL RPC (beta) | https://docs.sui.io/concepts/data-access/graphql-rpc | Migrate by Apr 2026 |
| GraphQL indexer | https://docs.sui.io/concepts/data-access/graphql-indexer | Beta |
| Sui RPC (JSON-RPC) | https://docs.sui.io/references/sui-api | **Deprecated** — migrate to gRPC/GraphQL |

Networks:
- Mainnet: `https://fullnode.mainnet.sui.io:443`
- Testnet: `https://fullnode.testnet.sui.io:443`
- Devnet: `https://fullnode.devnet.sui.io:443`
- Local: `http://127.0.0.1:9000`

---

## 6. Ecosystem & extras

| Resource | URL |
|----------|-----|
| Sui ecosystem | https://sui.directory/?_project_type=api,developer-tools,infrastructure,sdk |
| Awesome Sui | https://docs.sui.io/references/awesome-sui |
| Sui blog | https://blog.sui.io/ |
| Sui Developer Cheat Sheet | https://docs.sui.io/guides/developer/dev-cheat-sheet |

---

## 7. Crawl / wget targets summary

Use the scripts in this folder to mirror these domains:

| Target | Purpose |
|--------|---------|
| `https://docs.sui.io/` | Full Sui docs (guides, concepts, references) |
| `https://sdk.mystenlabs.com/` | TypeScript SDK, dApp Kit, zkSend docs + TypeDoc |
| `https://mystenlabs.github.io/sui/` | Rust SDK crate docs |
| `https://mystenlabs.github.io/sui-rust-sdk/` | Rust SDK types docs |
| `https://pysui.readthedocs.io/` | Python (pysui) docs |

Clone for full source + examples:
- https://github.com/MystenLabs/sui (Move, framework, Rust SDK, validators)
- https://github.com/mystenlabs/ts-sdks (TypeScript + dApp Kit)
- https://github.com/MystenLabs/sui-rust-sdk (standalone Rust SDK)
- https://github.com/FrankC01/pysui (Python)
- https://github.com/OpenDive/SuiKit (Swift)
- https://github.com/SuiCraftTeam/Sui-dApp-Kit-Vue (Vue)

---

*Generated for local mirroring and offline reference. Keep crawl output in `docs-sui/mirror/` (gitignored).*
