# SuiCompass Protocol: Contract Suite

This document details the 11 "Top-Notch" Move contracts deployed as part of the SuiCompass ecosystem. These contracts power the AI agent's capabilities, enabling autonomous finance, RWA tokenization, and advanced trading strategies.

## 🔗 Deployment Details
- **Package ID:** `0x9cab3a40743b2ee7d6aedb268135fda191d94b14c90a9201d5a713c085b216c4`
- **Network:** Mainnet/Testnet (Active Environment)
- **Publisher:** `suicompass`

---

## 1. RWA Registry (`rwa_registry`)
**Purpose:** The core engine for Real-World Asset tokenization.
*   **Asset Types:** Real Estate, Invoices, Bonds.
*   **Features:** Metadata storage (IPFS), status tracking (Pending -> Verified -> Paid), and issuer authority management.
*   **AI Integration:** "Tokenize this invoice for $5,000."

## 2. AI-Managed Portfolio (`portfolio`)
**Purpose:** A non-custodial "Robo-Advisor" vault.
*   **Mechanism:** Users deposit SUI. An AI agent (holding a `ManagerCap`) can rebalance assets to maximize yield but **cannot** withdraw funds.
*   **Safety:** Users retain full ownership and withdrawal rights.
*   **AI Integration:** "Rebalance my portfolio to 70% SUI, 30% USDC."

## 3. Decentralized Index Fund (`index_fund`)
**Purpose:** Single-click diversification via an on-chain ETF.
*   **Mechanism:** Users deposit a basket of assets (e.g., SUI + USDC) and receive a fungible `SHARE` token representing ownership of the pool.
*   **Features:** Constant-ratio enforcement (e.g., 100 SUI : 1 USDC).
*   **AI Integration:** "Buy 10 shares of the Sui Ecosystem Index."

## 4. Flash Loan Arbitrage (`flash_loan`)
**Purpose:** Zero-capital arbitrage execution engine.
*   **Mechanism:** Borrow assets -> Execute Trade -> Repay Loan + Fee -> Keep Profit. All in one atomic transaction block.
*   **Risk:** Zero capital risk for the user (tx reverts if unprofitable).
*   **AI Integration:** "Scan specifically for arbitrage opportunities on Cetus."

## 5. Prediction Market (`prediction_market`)
**Purpose:** Binary options market for speculating on real-world outcomes.
*   **Mechanism:** Users bet SUI on "Yes" or "No". A trusted Oracle resolves the market, and the winning side claims the pot.
*   **Features:** Oracle-gated resolution, proportional payout logic.
*   **AI Integration:** "What are the odds SUI hits $5 this week?"

## 6. Social Trading Vault (`social_trading`)
**Purpose:** Copy-trading vaults with automated performance fees.
*   **Mechanism:** Investors deposit funds into a vault managed by a "Trader". The Trader executes trades; if profitable, a % fee is minted to the Trader.
*   **Features:** `VAULT_SHARE` tokens track ownership. High-water mark logic (planned).
*   **AI Integration:** "Copy the top-performing whale's strategy."

## 7. Stream Payments (`stream_pay`)
**Purpose:** Real-time token vesting and payroll.
*   **Mechanism:** Payer locks funds; Payee can withdraw vested amounts by the second.
*   **Tech:** Leverages Move's `Clock` module for precise time-based unlocking.
*   **AI Integration:** "Stream 1000 SUI to Alice over the next 30 days."

## 8. Sui Object Derivatives (`derivatives`)
**Purpose:** Hedging via Call/Put options on specific NFTs.
*   **Mechanism:** Seller locks an asset (like an RWA NFT) and sets a Strike Price & Expiry. Buyer pays a premium for the option.
*   **Utility:** Hedge against the volatility of the underlying asset value.
*   **AI Integration:** "Buy a Call Option on this Real Estate NFT."

## 9. Gamified Staking / Lossless Lottery (`lossless_lottery`)
**Purpose:** "PoolTogether" style savings game.
*   **Mechanism:** Users deposit SUI. The collective pool earns staking yield. This yield is awarded to one random winner periodically.
*   **Safety:** Principal is never at risk; only the *interest* is used for the prize.
*   **AI Integration:** "Enter the weekly lossless lottery with 50 SUI."

## 10. Cross-Chain Bridge Adaptor (`bridge_adaptor`)
**Purpose:** Unified interface for AI cross-chain operations.
*   **Mechanism:** Abstracts complexities of Wormhole/LayerZero into a single `bridge_asset` call.
*   **Features:** Emits standardized events for off-chain bridge relayers to pick up.
*   **AI Integration:** "Bridge my assets to Solana."

## 11. DID / Reputation Identity (`reputation_id`)
**Purpose:** On-chain credit scoring.
*   **Mechanism:** A `ReputationProfile` object tracks a user's transaction history and successful loan repayments.
*   **Utility:** Enables undercollateralized lending for high-score users.
*   **AI Integration:** "Check my current DeFi credit score."
