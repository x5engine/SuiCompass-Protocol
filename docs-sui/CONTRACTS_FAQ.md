# SuiCompass Contracts: Frequently Asked Questions

**Everything you need to know about the smart contracts powering SuiCompass.**

---

## 🏗️ Architecture & Philosophy

### Q: Why do some contracts look "basic" compared to the RWA Registry?
**A:** This is a feature of the **Move** programming language, not a bug! 
*   **The RWA Registry** is a "Business Contract." It enforces specific rules about real-world data (Invoices, Bonds) and lifecycles. It *needs* to be complex to be safe.
*   **The Other 10 Contracts** (Portfolio, Flash Loan, etc.) are "Financial Primitives." Think of them as Lego blocks. They are intentionally minimal and efficient.
    *   *Example:* The **Flash Loan** contract doesn't need to know *what* you are trading. It only cares that you pay back the loan. The AI Agent handles the complex trading strategy off-chain.

### Q: Did you deploy 11 separate things?
**A:** No, we deployed **one massive Package**.
In Sui, contracts (modules) are bundled into a **Package**. Our package `suicompass` (ID: `0x9cab...`) contains all 11 modules inside it. This allows them to interact with each other seamlessly and share the same versioning.

### Q: Why "Public" functions instead of "Entry" functions?
**A:** We use **Programmable Transaction Blocks (PTBs)**.
*   **Old Way (Entry):** You trigger one function, it does one thing.
*   **SuiCompass Way (Public):** We can chain multiple actions into a single transaction.
    *   *Scenario:* "Borrow Flash Loan" -> "Swap on Cetus" -> "Repay Loan".
    *   By keeping functions `public`, the AI Agent can mix and match them to create powerful, complex workflows dynamically.

---

## 🔐 Security & Safety

### Q: Can the AI Agent steal my funds from the Portfolio?
**A:** **No.** 
The `Portfolio` contract uses a capability-based security model. 
*   **You (The User)** hold the `OwnerCap`, which is the *only* thing that can call `withdraw`.
*   **The AI** holds a `ManagerCap`, which *only* allows it to call `execute_strategy` (trade/rebalance). It technically cannot transfer funds out of the portfolio object.

### Q: What is the "One-Time Witness" (OTW)?
**A:** It's a special security pattern in Sui that ensures a token (like the `INDEX_FUND` shares) can only be created *once*. This guarantees that the supply is strictly controlled by the contract logic and cannot be inflated by developers later.

---

## 🤖 AI Integration

### Q: How does the AI know what to do?
**A:** The AI doesn't "guess." It uses a strict mapping of **Intents** to **Move Functions**.
1.  You say: "Invest in the index fund."
2.  AI recognizes intent: `INVEST_INDEX`.
3.  AI looks up the contract: `suicompass::index_fund`.
4.  AI builds the transaction: `mint_shares(amount)`.
This hybrid approach combines the flexibility of LLMs with the deterministic security of code.
