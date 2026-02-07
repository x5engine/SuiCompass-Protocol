# SuiCompass Protocol

> **Production-Ready RWA Tokenization Platform on Sui Blockchain**

[![Live on Mainnet](https://img.shields.io/badge/Sui-Mainnet-4DA2FF?style=for-the-badge&logo=sui&logoColor=white)](https://suiscan.xyz/mainnet)
[![Live Demo](https://img.shields.io/badge/Live-SuiCompass.com-cyan)](https://suicompass.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

**🌐 Live Platform**: [suicompass.com](https://suicompass.com)

SuiCompass transforms natural language into executable Sui transactions. Stake, manage portfolios, and tokenize real-world assets (invoices, bills, receivables)—all through an institutional-grade interface with a premium "Sui Blue" aesthetic.

---

## 🚀 Key Features

### 💎 **RWA Tokenization** (Live on Mainnet)
- **AI Risk Auditing**: Automated fraud detection and authenticity verification.
- **IPFS Storage**: Decentralized document storage via Pinata.
- **Move Contract**: `rwa_registry.move` for Real Estate, Invoices, and Bonds.
- **On-Chain Lifecycle**: Track asset status (Pending → Paid → Settled).

### 🤖 **AI Copilot**
- **Natural Language DeFi**: Type "Stake 50 SUI" → Transaction executed.
- **Context-Aware**: Smart suggestions based on your portfolio.
- **Risk Analysis**: AI-powered transaction safety checks.

### 📊 **Portfolio Dashboard**
- **Real-time Tracking**: Live balance and staking positions via Sui RPC.
- **Token Graph**: Interactive D3.js network graphs for asset relationship mapping.
- **Sound & VFX**: Immersive "Sui Blue" theme with particle effects and audio feedback.

### 🔐 **Liquid Staking**
- **Auto-Agent**: Autonomous yield optimization (x402 Auto-Agent).
- **Validator Selection**: Smart selection for optimized APY.

### 💻 **CLI Tool**
```bash
# Stake SUI via terminal
sui-compass stake --amount 10 --validator 0x...

# Check portfolio
sui-compass portfolio --address 0x...
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 19)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ AI Copilot   │  │  Dashboard   │  │ RWA Minting  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Sui dApp Kit (@mysten/dapp-kit)                │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Sui System   │  │  RWA Registry │  │  IPFS/Pinata │
│  (Native)    │  │  Contract    │  │   Storage    │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Blockchain** | Sui Mainnet |
| **Smart Contracts** | Move Language (`contracts/`) |
| **Frontend** | React 19, TypeScript, Vite |
| **Wallet Integration** | @mysten/dapp-kit |
| **Storage** | IPFS (Pinata) |
| **AI/ML** | EmbedAPI (Intent Parsing), Custom Risk Models |
| **Styling** | Tailwind CSS (Sui Blue Theme) |
| **Visualization** | D3.js |
| **CLI** | Node.js (packages/sui-compass-cli) |

---

## 📦 Quick Start

### Prerequisites
- Node.js 20+
- Sui CLI (for contract deployment)
- Sui Wallet (browser extension)

### Installation

```bash
# Clone the repository
git clone https://github.com/x5engine/SuiCompass-Protocol.git
cd SuiCompass-Protocol

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

Create `.env`:

```env
# AI Engine (Required)
VITE_EMBEDAPI_KEY=your_embedapi_key

# Sui Network
VITE_SUI_NETWORK=mainnet
VITE_SUI_RPC_URL=https://fullnode.mainnet.sui.io:443

# RWA Contract (After deployment)
VITE_RWA_PACKAGE_ID=0x...
```

---

## 🧪 Testing & Deployment

### Smart Contract Deployment
```bash
cd contracts
sui client publish --gas-budget 100000000
```

### Running Tests
```bash
# Frontend
npm test

# Smart Contracts
cd contracts
sui move test
```

---

## 🌟 Roadmap

- [x] Phase 1: Core Sui integration
- [x] Phase 2: AI Intent Engine
- [x] Phase 3: x402 Auto-Agent
- [x] Phase 4: RWA Tokenization (Live on Mainnet)
- [x] Phase 5: CLI Tool
- [ ] Phase 6: Multi-chain Bridge Support
- [ ] Phase 7: Mobile App (iOS/Android)

---

## 👨‍💻 Author

**Youssef Khouidi** ([@x5engine](https://github.com/x5engine))

Built with ❤️ for the Sui ecosystem.

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.