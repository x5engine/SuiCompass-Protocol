# Product Requirements Document (PRD): SuiCompass Protocol

# PRD Title: SuiCompass Protocol V1
**Author:** Youssef Khouidi (Solo Founder)
**Team:** Youssef Khouidi
**Date:** February 2026

| Product Manager  | Youssef Khouidi |
| :---- | :---- |
| Engineering Lead | Youssef Khouidi |
| Designer | Youssef Khouidi |
| **Status** | **Ready for Launch** |

---

# Objective

To democratize access to the Sui DeFi ecosystem by replacing complex, fragmented UIs with a conversational "Intent Engine" and a unified "Compass" dashboard. SuiCompass creates a single verifiable control plane for wealth creation on Sui.

## Overview
**SuiCompass Protocol** is the first AI-Native OS for Sui. Unlike standard wallets that require manual navigation of dApps, SuiCompass allows users to express intent in natural language (e.g., "Stake 50% of my SUI for max yield") and executes it automatically.

## Problem
- **Fragmentation:** Users must juggle 5+ dApps (staking, lending, swapping).
- **Complexity:** "Hashes", "Epochs", and "Objects" confuse mass-market users.
- **Friction:** Executing a simple strategy takes too many clicks and approvals.

## Persona
| Key Persona | Description |
| :---- | :---- |
| **The "Yield Hunter"** | Wants optimized returns but hates researching validators manually. |
| **The "DeFi Curious"** | Has SUI tokens but is afraid of pressing the wrong button. |

---

## Features In (Scope)

### 1. **AI Intent Engine (Copilot)**
- **Goal:** Zero-UI execution.
- **Capability:** Parses natural language -> JSON -> Transaction Block.
- **Status:** ✅ Built & Live.

### 2. **Innovative Side Panel (The Compass)**
- **Goal:** Proactive guidance.
- **Capability:** Context-aware suggestions (Stake, Portfolio, Yield) via a reliable sidebar.
- **Status:** ✅ Built & Live.

### 3. **Real-time Staking Agent**
- **Goal:** Yield optimization.
- **Capability:** Fetches onchain validator data, sorts by APY, and constructs staking transactions.
- **Status:** ✅ Built & Live.

### 4. **Sui-Native Design System ("Sui Blue")**
- **Goal:** Trust & Aesthetic alignment.
- **Capability:** D3.js Token Graphs, Glassmorphism, Dark Mode.
- **Status:** ✅ Built & Live.

---

## Technical Considerations
- **Chain:** Sui Mainnet / Testnet.
- **Stack:** React 19, `@mysten/dapp-kit`, `@embedapi/core`.
- **Latency:** Real-time RPC connections via `SuiClient`.

## Success Metrics
- **Conversion:** >30% of chats result in a signed transaction.
- **Retention:** >40% of users connect their wallet >3x/week via the Persistent Connection feature.

---

## GTM Approach
Launch as a "DeFi Copilot" for the Sui Hackathon, positioning Youssef Khouidi as the pioneer of Agentic DeFi key infrastructure.

## Open Issues
- **None.** The MVP is code-complete and undergoing final deployment.

---

**Signed Off By:**
*Youssef Khouidi, Founder*