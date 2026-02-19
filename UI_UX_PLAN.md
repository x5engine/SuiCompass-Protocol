# UI/UX Master Plan: SuiCompass

**Objective:** Create an intuitive, "Sui Blue" aesthetic interface that demystifies advanced DeFi concepts.
**Core Navigation:** Dashboard (Overview) | Market (Trade/Invest) | Assets (RWA) | Games (Lottery) | Profile (Identity)

---

## 1. RWA Registry (Asset Management)
*   **Location:** `Dashboard -> RWA Tokenization`
*   **UI Components:**
    *   **Asset Card:** Displays Asset Type (Real Estate/Bond), Location, Valuation ($), and Status (Pending/Verified).
    *   **Minting Form:** A multi-step wizard.
        1.  Select Type (Icon Grid).
        2.  Input Metadata (Name, Value).
        3.  Upload Docs (Drag & Drop -> IPFS).
        4.  Review & Mint.
*   **User Journey:** "I want to tokenize an invoice." -> Clicks "Mint Asset" -> Fills Form -> Signs Tx -> Sees "Invoice #101" in Dashboard.

## 2. AI-Managed Portfolio (Robo-Advisor)
*   **Location:** `Dashboard -> Portfolio`
*   **UI Components:**
    *   **Performance Chart:** Area chart showing Value vs Time (with "AI Rebalance" markers).
    *   **Strategy Toggle:** "Conservative (Stablecoins)" vs "Aggressive (Sui Ecosystem)".
    *   **Deposit/Withdraw Modal:** Simple input field with "Max" button.
*   **User Journey:** User deposits 100 SUI -> Selects "Aggressive" -> AI Agent (backend) monitors and rebalances.

## 3. Decentralized Index Fund (ETF)
*   **Location:** `Market -> Index Funds`
*   **UI Components:**
    *   **Fund Composition Donut:** Visualizes the basket (e.g., 50% SUI, 30% USDC).
    *   **"Buy Index" Button:** One-click swap into `SUIIDX` tokens.
*   **User Journey:** "I want diversification." -> Click "Buy Index" -> Wallet signs -> User now holds Share Tokens.

## 4. Flash Loan Arbitrage
*   **Location:** `Market -> Arbitrage Scanner`
*   **UI Components:**
    *   **Live Opportunity Feed:** Scrolling list of potential arbs (e.g., "Cetus -> Turbos: +0.5%").
    *   **"Execute" Action:** A lightning bolt button next to opportunities.
    *   **Profit Terminal:** A retro-style console log showing the atomic tx steps.
*   **User Journey:** User sees opportunity -> Clicks Bolt -> Tx executes -> Toast notification: "You made 0.5 SUI profit (0 capital used)".

## 5. Prediction Market
*   **Location:** `Market -> Predictions`
*   **UI Components:**
    *   **Binary Card:** "Will SUI hit $2?" with Green "Yes" and Red "No" bars showing liquidity.
    *   **Outcome Slider:** Visual probability (e.g., 60% Yes).
*   **User Journey:** User believes Price Up -> Bets "Yes" -> Smart Contract holds funds -> Oracle resolves -> User claims winnings.

## 6. Social Trading (Copy Trading)
*   **Location:** `Market -> Copy Trading`
*   **UI Components:**
    *   **Trader Leaderboard:** Rank by ROI%, AUM, and Risk Score.
    *   **"Copy" Button:** Deposits funds into that specific Trader's Vault.
*   **User Journey:** Browse top traders -> Select "SuiWhale_99" -> Deposit 500 SUI -> Watch balance grow (minus fees).

## 7. Stream Payments
*   **Location:** `Dashboard -> Payments`
*   **UI Components:**
    *   **Stream Visualizer:** A progress bar that fills up in real-time (water flowing animation).
    *   **Create Stream Form:** Recipient Address, Total Amount, Duration.
    *   **"Claim Vested" Button:** Only active for the payee.
*   **User Journey:** Employer creates stream -> Employee sees bar filling -> Clicks "Claim" to withdraw what has vested so far.

## 8. Derivatives (Options)
*   **Location:** `Market -> Derivatives`
*   **UI Components:**
    *   **Option Chain:** Table showing Strike Prices, Expiry Dates, and Premiums.
    *   **Greeks Visualizer (Simplified):** "High Risk / High Reward" gauge.
*   **User Journey:** User wants to hedge -> Buys Put Option -> Pays Premium -> Holds `CallOption` object.

## 9. Gamified Staking (Lossless Lottery)
*   **Location:** `Games -> Lossless Lottery`
*   **UI Components:**
    *   **Jackpot Counter:** Rolling number ticker of current interest pot.
    *   **"Enter Pool" Ticket:** Graphic ticket stub interface.
    *   **Winner Feed:** "Alice just won 50 SUI!".
*   **User Journey:** Deposit 10 SUI -> Receive "Ticket" -> Wait for weekly draw -> Check if won (Principal always withdrawable).

## 10. Cross-Chain Bridge
*   **Location:** `Dashboard -> Bridge`
*   **UI Components:**
    *   **Chain Selector:** "From Sui" -> "To Solana" (Visual icons).
    *   **Route Preview:** Shows fees and estimated time.
*   **User Journey:** User selects assets -> "Bridge" -> Assets burned/locked on Sui -> Message sent to Relayer.

## 11. Reputation ID
*   **Location:** `Profile -> Identity`
*   **UI Components:**
    *   **Credit Score Gauge:** A speedometer style gauge (0-1000).
    *   **History Log:** "Repaid Loan (+10 pts)", "Defaulted (-50 pts)".
    *   **Badges:** Visual NFTs for "High Credit", "OG User".
*   **User Journey:** User interacts with protocol -> Score updates automatically -> High score unlocks lower collateral rates.
