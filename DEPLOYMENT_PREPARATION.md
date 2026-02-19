# Contract Deployment Preparation

This document provides a summary of the analysis of the smart contracts and the deployment process.

## 1. Overview

The project contains two Move contracts related to Real-World Assets (RWAs):

-   `sui_rwa/sources/rwa_nft.move`: A simple RWA NFT contract.
-   `contracts/sources/rwa_registry.move`: A more structured RWA registry contract.

The deployment script `scripts/deploy-rwa.ts` is configured to deploy the `sui_rwa` package, which contains the `rwa_nft.move` contract. The `rwa_registry.move` contract is not currently part of any deployment script found in the repository.

## 2. Contract Analysis: `rwa_nft.move`

-   **Module**: `sui_rwa`
-   **Contract**: `rwa_nft`

### Functionality

This contract defines a Non-Fungible Token (`RWANFT`) that represents a Real-World Asset. It provides basic functionalities to mint, update the status of, and burn the RWA NFT.

### Struct `RWANFT`

The `RWANFT` struct contains the following fields:

-   `id`: The unique ID of the NFT.
-   `name`: The name of the asset.
-   `description`: A description of the asset.
-   `url`: An IPFS URL to the asset's metadata or document.
-   `amount`: The value of the asset.
-   `currency`: The currency of the asset's value (e.g., "USD", "SUI").
-   `due_date`: The due date of the asset.
-   `issuer`: The issuer of the asset.
-   `status`: The status of the asset (e.g., "Pending", "Paid", "Overdue", "Cancelled").

### Public Functions

-   `mint`: Mints a new `RWANFT`.
-   `update_status`: Updates the status of an existing `RWANFT`.
-   `burn`: Burns (destroys) an `RWANFT`.

## 3. Deployment Process

The deployment process is handled by the `scripts/deploy-rwa.ts` script. Here are the steps to deploy the contract:

1.  **Navigate to the project root directory.**
2.  **Set the network**: The deployment script uses the `VITE_SUI_NETWORK` environment variable to determine the network. You can set it to `mainnet`, `testnet`, or `devnet`. If not set, it defaults to `mainnet`.
    ```bash
    export VITE_SUI_NETWORK=testnet
    ```
3.  **Run the deployment script**:
    ```bash
    npx ts-node scripts/deploy-rwa.ts
    ```
    The script will perform the following actions:
    -   Build the Move package located at `sui_rwa`.
    -   Perform a dry run of the deployment to estimate the cost.
    -   Print the command to be executed for the actual deployment.
4.  **Execute the deployment command**: Copy and run the command printed in the previous step to deploy the contract.
    ```bash
    cd sui_rwa && sui client publish --gas-budget 100000000 --skip-dependency-verification
    ```

## 4. Deployed Address

The deployed address of the contract package will be displayed in the output of the `sui client publish` command. After a successful deployment, the output will contain the package ID, which is the address of your deployed contract.

You can then use this package ID to interact with the contract.

## 5. Further Notes

-   The `contracts/sources/rwa_registry.move` contract is not deployed by the `scripts/deploy-rwa.ts` script. It might be an older or newer version of the contract, or it might be intended for a different purpose. Further investigation is needed if you intend to use this contract.
-   The account used for deployment is the one configured in your local Sui CLI. You can check the active address by running `sui client active-address`.
-   Make sure you have enough SUI in your account to cover the gas fees for the deployment.

## 6. Mainnet Deployment

For mainnet deployment, you need to ensure your Sui client is correctly configured.

### Pre-flight Checks

1.  **Check Active Environment**: Verify your current environment is pointing to mainnet.
    ```bash
    sui client active-env
    ```
    If it's not `mainnet`, switch to it. If you don't have a `mainnet` environment, create one:
    ```bash
    # Add mainnet environment if it doesn't exist
    sui client new-env --alias mainnet --rpc https://fullnode.mainnet.sui.io:443
    
    # Switch to mainnet
    sui client switch --env mainnet
    ```

2.  **Check Active Address**: Confirm you are using the correct wallet for deployment.
    ```bash
    sui client active-address
    ```
    To see all available addresses, use `sui client addresses`.

### One-Liner Deployment Command

The following command combines building the Move package and publishing it to the network in one line. Run this from the root of the project:

```bash
cd sui_rwa && sui move build && sui client publish --gas-budget 100000000 --skip-dependency-verification && cd ..
```

This command will:
1.  Navigate into the `sui_rwa` directory.
2.  Build the Move contract.
3.  Publish the contract to the currently active network (which should be mainnet).
4.  Navigate back to the project root directory.

The package ID (your contract's address) will be in the output of the `sui client publish` command.
