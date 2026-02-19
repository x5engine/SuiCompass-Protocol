---

# Complex Contract Deployment (rwa_registry)

- **Package ID:** `0x3fbda5bad770f8a81d1d84741f1bc508a2f30275203c667ef1cc27fb88f750d2`
- **Module:** `rwa_registry`

## Interacting with rwa_registry

### 1. Minting Real Estate

```bash
sui client call \
  --package 0x3fbda5bad770f8a81d1d84741f1bc508a2f30275203c667ef1cc27fb88f750d2 \
  --module rwa_registry \
  --function mint_real_estate \
  --args "Luxury Villa" "Beverly Hills, CA" "5000000" "ipfs://Qm..." \
  --gas-budget 20000000
```

### 2. Minting Invoice

```bash
sui client call \
  --package 0x3fbda5bad770f8a81d1d84741f1bc508a2f30275203c667ef1cc27fb88f750d2 \
  --module rwa_registry \
  --function mint_invoice \
  --args "Invoice #99" "Tech Corp" "10000" "ipfs://Qm..." \
  --gas-budget 20000000
```
