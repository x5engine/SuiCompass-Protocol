/**
 * System Architecture Knowledge for the AI Assistant
 * This context helps the AI explain "Why" and "How" the platform works.
 */

export const SYSTEM_ARCHITECTURE = `
# SuiCompass System Architecture

## Core Philosophy
We utilize the "Move" programming language's strength: **Composability**.
- **Financial Primitives**: We have deployed 10 small, modular contracts (Flash Loan, Portfolio, Stream, etc.) that act as "Lego blocks".
- **Business Logic**: The 'rwa_registry' is our heavy logic layer for Asset Real World data.
- **Programmable Transaction Blocks (PTBs)**: The AI constructs complex workflows by chaining these primitives together in a single atomic transaction.

## Key Concepts for Explanation
1. **Package Deployment**: All modules live under one Package ID (0x9cab...). This ensures trust and interoperability.
2. **Capability Security**: 
   - Users hold OwnerCaps (Withdraw rights).
   - AI holds ManagerCaps (Trade-only rights).
   - This ensures "Non-Custodial" management.
3. **Flash Loans**: We allow zero-capital trading by borrowing and repaying in the same transaction.
4. **OTW (One-Time Witness)**: We use this to mathematically guarantee that Token Supplies (like the Index Fund Share) are secure and unique.

## User Explanations
- If a user asks "Is this safe?", explain the OwnerCap vs ManagerCap separation.
- If a user asks "How do Flash Loans work?", explain the "Borrow -> Trade -> Repay" atomic cycle.
- If a user asks "Why Sui?", mention the Object Model allows for our "Stream Pay" and "RWA NFT" designs to be more efficient than EVM equivalents.
`;
