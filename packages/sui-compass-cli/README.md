# 👻 CasperGhost CLI

**Full-featured command-line interface for CasperGhost - AI-Powered DeFi Assistant**

All UI actions available via CLI commands! Stake, unstake, claim rewards, tokenize assets, deploy contracts, and more - all from your terminal.

## 🚀 Installation

```bash
npm install -g casper-ghost
```

Or use with `npx`:

```bash
npx casper-ghost <command>
```

## 📋 Prerequisites

1. **Node.js 18+**
2. **Environment Variables** (create `.env` file or export):

```bash
# Required
VITE_EMBEDAPI_KEY=your_embedapi_key
PUBLIC_KEY=your_casper_public_key

# Optional
CASPER_RPC_URL=https://rpc.testnet.casper.network
CASPER_NETWORK=casper-test
WISE_LENDING_CONTRACT_HASH=hash-...
CSPR_CLOUD_API_KEY=your_api_key
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_KEY=your_pinata_secret
```

## 🎯 Commands

### Staking

```bash
# Stake CSPR (auto-select best validator)
ghost stake 100

# Stake to specific validator
ghost stake 100 --validator <public_key>

# Auto-select best validator by APY
ghost stake 100 --validator max

# Unstake tokens
ghost unstake 50
ghost unstake all

# Claim rewards
ghost claim
```

### Portfolio & Balance

```bash
# Show full portfolio
ghost portfolio

# Check balance only
ghost balance

# JSON output
ghost portfolio --json
```

### Validators

```bash
# List all validators
ghost validators

# Top 10 validators
ghost validators --top 10

# JSON output
ghost validators --json
```

### RWA Tokenization

```bash
# Tokenize invoice from file
ghost tokenize --type invoice --amount 1000 --file invoice.pdf

# Tokenize from URL
ghost tokenize --type bill --amount 500 --url https://example.com/bill.pdf

# With description
ghost tokenize --type invoice --amount 1000 --file invoice.pdf --description "Q4 2024 invoice"
```

### Contract Deployment

```bash
# Deploy staking pool
ghost deploy --template staking-pool

# Interactive mode
ghost deploy --interactive
```

### Transfers

```bash
# Transfer CSPR
ghost transfer <address> 100

# Transfer to CSPR.name
ghost transfer alice.cspr 50
```

### NFTs

```bash
# List your NFTs
ghost nft list

# Browse collections
ghost nft browse
```

### Cross-Chain Bridge

```bash
# Bridge from Ethereum
ghost bridge --from ethereum --to casper --amount 100

# Interactive mode
ghost bridge --interactive
```

### AI Chat (Interactive)

```bash
# Start interactive chat session
ghost chat
```

## 💡 Examples

```bash
# Quick stake
ghost stake 100

# Check portfolio
ghost portfolio

# Find best validator
ghost validators --top 1

# Tokenize invoice
ghost tokenize --type invoice --amount 1000 --file invoice.pdf

# Interactive AI chat
ghost chat
```

## 🔧 Configuration

### Global Options

```bash
--network <network>        # casper-test or casper (default: casper-test)
--public-key <key>         # Your Casper public key
--private-key <key>        # Private key (use with caution!)
--key-path <path>          # Path to private key file
```

### Environment Variables

Set in `.env` file or export:

- `VITE_EMBEDAPI_KEY` - EmbedAPI key for AI features
- `PUBLIC_KEY` - Your Casper public key (hex)
- `CASPER_RPC_URL` - Casper RPC endpoint
- `CASPER_NETWORK` - Network name
- `WISE_LENDING_CONTRACT_HASH` - WiseLending contract hash
- `CSPR_CLOUD_API_KEY` - CSPR.cloud API key (optional)
- `PINATA_API_KEY` - Pinata API key for IPFS (optional)
- `PINATA_SECRET_KEY` - Pinata secret key (optional)

## 🛠️ Development

```bash
# Clone repository
git clone https://github.com/casperghost/casper-ghost

# Install dependencies
cd packages/casper-ghost-cli
npm install

# Link for local development
npm link

# Test
ghost --help
```

## 📦 Package Info

- **Name:** `casper-ghost`
- **Version:** 1.0.0
- **License:** MIT
- **Repository:** https://github.com/casperghost/casper-ghost

## 🔗 Links

- **Web App:** https://casperghost.pro
- **Documentation:** https://github.com/casperghost/casper-ghost
- **Support:** https://github.com/casperghost/casper-ghost/issues

## ⚠️ Security Notes

- Never commit private keys to version control
- Use environment variables for sensitive data
- For production, use hardware wallets or secure key management
- Transaction signing requires wallet connection (Casper Signer)

## 🎉 Features

✅ **All UI Actions Available**
- Staking, unstaking, claiming rewards
- Portfolio management
- Validator selection
- RWA tokenization with AI risk audit
- Contract deployment
- Transfers
- NFT operations
- Cross-chain bridging
- Interactive AI chat

✅ **Beautiful CLI Output**
- Color-coded messages
- Progress indicators
- JSON output option
- Clear error messages

✅ **Production Ready**
- Error handling
- Input validation
- Transaction previews
- Confirmation prompts

---

**Made with ❤️ by the CasperGhost Team**
