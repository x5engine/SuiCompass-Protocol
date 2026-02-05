# RWA Smart Contract Deployment Guide

This guide walks you through deploying the RWA (Real-World Asset) tokenization smart contract to Sui Mainnet.

## Prerequisites

### 1. Install Sui CLI

If you haven't already, install the Sui CLI:

```bash
# Using suiup (recommended)
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch mainnet sui

# Or use our helper script
./scripts/install-sui.sh
```

Verify installation:
```bash
sui --version
```

### 2. Configure Sui Client

Initialize your Sui client configuration:
```bash
sui client
```

This will:
- Create a new wallet if you don't have one
- Generate a recovery phrase (**SAVE THIS SECURELY!**)
- Set up your client configuration

### 3. Switch to Mainnet

Ensure you're on the correct network:
```bash
sui client switch --env mainnet
```

Verify:
```bash
sui client active-env
# Should output: mainnet
```

### 4. Get Your Wallet Address

```bash
sui client active-address
```

Example output:
```
0x100b1748b2061176c787599d19aea3f7f8b9323351bfe10a3cd93778b5731056
```

## Funding Your Wallet

You need SUI tokens to pay for gas fees.

### Estimated Cost
- **Deployment**: ~16,242,400 MIST (~0.016 SUI or ~$0.05 USD)
- **Recommended**: Fund with at least **0.1 SUI** for safety

### How to Get SUI

1. **Centralized Exchanges**: Binance, Coinbase, KuCoin, OKX
2. **DEXs on Sui**: Cetus, Turbos Finance, Aftermath Finance
3. **Bridges**: Wormhole, LayerZero (from other chains)

Send SUI to your wallet address from step 4 above.

### Verify Balance

```bash
sui client gas
```

You should see gas coins listed with their amounts.

## Deployment Steps

### Step 1: Estimate Cost (Dry Run)

Run the deployment script to estimate gas costs without spending anything:

```bash
npx tsx scripts/deploy-rwa.ts
```

This will:
- Build the Move package
- Run a dry-run simulation
- Display estimated gas costs

### Step 2: Deploy to Mainnet

Once you've verified the cost and have sufficient funds:

```bash
cd sui_rwa
sui client publish --gas-budget 100000000 --skip-dependency-verification
```

**Parameters:**
- `--gas-budget 100000000`: Maximum gas (0.1 SUI) - you'll only be charged what's actually used
- `--skip-dependency-verification`: Speeds up deployment (safe for this contract)

### Step 3: Save the Package ID

After successful deployment, you'll see output like:

```
╭─────────────────────────────────────────────────────────────────────╮
│ Object Changes                                                      │
├─────────────────────────────────────────────────────────────────────┤
│ Created Objects:                                                    │
│  ┌──                                                                │
│  │ ObjectID: 0xabcd1234...                                         │
│  │ Sender: 0x100b1748...                                           │
│  │ Owner: Immutable                                                │
│  │ ObjectType: 0x2::package::Package                               │
│  │ Version: 1                                                      │
│  └──                                                                │
╰─────────────────────────────────────────────────────────────────────╯
```

**Copy the Package ID** (the ObjectID with type `package`).

### Step 4: Update Frontend Configuration

Create or update your `.env` file in the project root:

```bash
echo "VITE_RWA_PACKAGE_ID=0xYOUR_PACKAGE_ID_HERE" >> .env
```

Replace `0xYOUR_PACKAGE_ID_HERE` with the actual Package ID from step 3.

### Step 5: Verify Deployment

Check your deployment on Sui Explorer:
```
https://suiscan.xyz/mainnet/object/YOUR_PACKAGE_ID
```

## Testing the Contract

### Run Move Tests (Optional)

Before deployment, you can run the contract's unit tests:

```bash
cd sui_rwa
sui move test
```

All tests should pass.

### Frontend Integration Tests

The TypeScript integration tests verify the frontend can interact with the contract:

```bash
npm test src/services/__tests__/rwa-tokenization.test.ts
```

## Using the Contract

Once deployed, users can mint RWA NFTs through your frontend:

1. **Build the frontend**:
   ```bash
   npm run build
   ```

2. **Deploy to hosting** (Firebase, Vercel, Netlify, etc.)

3. **Users can now**:
   - Upload asset documents (invoices, bills, etc.)
   - Get AI risk assessment
   - Mint RWA NFTs on-chain
   - Track asset status (Pending → Paid → etc.)

## Troubleshooting

### "Insufficient gas"
- Increase your wallet balance
- Or increase `--gas-budget` (max: your wallet balance)

### "Command 'sui' not found"
- Ensure Sui CLI is installed and in your PATH
- Try: `export PATH="$HOME/.cargo/bin:$PATH"`

### "Client/Server version mismatch"
- Update your Sui CLI: `cargo install --locked --git https://github.com/MystenLabs/sui.git --branch mainnet sui --force`

### Build fails
- Ensure you're in the `sui_rwa` directory
- Check that `Move.toml` exists
- Verify all dependencies are correct

## Security Notes

- ✅ **Recovery Phrase**: Store your wallet recovery phrase securely offline
- ✅ **Private Keys**: Never commit `.sui/` directory or private keys to git
- ✅ **Package Immutability**: Once deployed, the contract cannot be modified
- ✅ **Ownership**: Only NFT owners can update status or burn their assets

## Support

For issues or questions:
- Check the [Sui Documentation](https://docs.sui.io)
- Visit [Sui Discord](https://discord.gg/sui)
- Review the [Move Book](https://move-book.com)

---

**Congratulations!** 🎉 You've successfully deployed your RWA tokenization contract to Sui Mainnet!
