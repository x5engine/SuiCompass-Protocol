# RWA Registry: Bridging Real World Assets to Sui

## 1. Introduction

The **RWA Registry** is a core component of the Sui DeFi Agent ecosystem. It enables the tokenization of Real-World Assets (RWAs) directly on the Sui blockchain. By leveraging Sui's object-centric data model, we create distinct, stateful digital representations of physical assets like real estate, invoices, and bonds.

This contract allows authorized issuers to mint unique NFTs (`RWANFT`) that carry vital metadata—valuation, location, and legal documentation links (IPFS)—providing a transparent and immutable record of ownership and asset status.

## 2. Key Features

*   **Asset Typing**: Native support for distinct asset classes:
    *   `Real Estate` (Type 1)
    *   `Invoice` (Type 2)
    *   `Bond` (Type 3)
*   **Rich Metadata**: Each NFT stores on-chain data including valuation (USD), physical location/identifier, and immutable links to off-chain documentation.
*   **Lifecycle Management**: Assets have a state machine tracking their status from `Pending` -> `Verified` -> `Paid` -> `Defaulted`.
*   **Issuer Authority**: Built-in permissioning ensures only the original issuer can update critical status fields (e.g., marking an invoice as "Paid").
*   **Sui Object Model**: Fully leverages Sui's object ownership, allowing RWAs to be transferred, used as collateral in DeFi protocols, or composable with other Move contracts.

## 3. Contract Technicals

*   **Package ID**: `0x3fbda5bad770f8a81d1d84741f1bc508a2f30275203c667ef1cc27fb88f750d2`
*   **Module**: `rwa_registry`
*   **Network**: Testnet/Mainnet (Check `DEPLOYMENT_PREPARATION.md` for current active env)

### Core Functions

*   `mint_real_estate(name, location, valuation, doc_uri, ctx)`
*   `mint_invoice(name, location, valuation, doc_uri, ctx)`
*   `mint_bond(name, location, valuation, doc_uri, ctx)`
*   `update_status(nft, new_status, ctx)`: **Issuer Only**
*   `burn(nft)`: Destroys the asset representation.

## 4. FAQ

### Q: Who can mint an RWA?
**A:** Currently, the contract is open for minting by any address, which becomes the "Issuer". In a production environment, this would likely be gated by a whitelist of verified legal entities.

### Q: How is the valuation determined?
**A:** The valuation is input by the issuer at the time of minting. It is stored as a `u64`. The standard convention is to scale the USD value by `1e6` (e.g., $50.00 = 50,000,000).

### Q: Can I fractionalize these RWAs?
**A:** This specific registry handles the *NFT* (the whole asset). To fractionalize, you would lock this NFT into a separate "Fractionalization Contract" which would then issue fungible shares (Coin<Share>). This is a planned future upgrade.

### Q: Where are the documents stored?
**A:** The contract stores a URI (Uniform Resource Identifier), typically pointing to an IPFS hash (e.g., `ipfs://Qm...`). This ensures the legal documents are decentralized and tamper-proof, but not stored directly on-chain to save storage costs.

### Q: What prevents an issuer from lying about the status?
**A:** The blockchain guarantees that *only* the issuer can update the status. Trust is placed in the issuer's reputation. Future versions will integrate with Oracle networks to automate status updates based on bank API feeds or other data sources.

## 5. Integration Guide for AI Agents

**Context for AI:**
When a user asks to "tokenize an invoice" or "register a property", use the `SuiRWAService` in `src/services/sui-rwa-service.ts`.

1.  **Identify Asset Type**: Classify user request into Real Estate, Invoice, or Bond.
2.  **Extract Metadata**: Parse the conversation for Name, Location/ID, and Value.
3.  **Upload Docs**: If the user provides a file, use the IPFS service to upload it and get the Hash.
4.  **Execute Mint**: Call `SuiRWAService.mintRWA(...)`.
5.  **Confirm**: Return the Explorer Link to the user using the newly created Object ID.
