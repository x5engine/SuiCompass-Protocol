/**
 * Sui RWA Contract Integration Service
 * Handles interaction with the rwa_registry Move module
 */

import { Transaction } from '@mysten/sui/transactions';

// Contract address (will be set after deployment)
const RWA_PACKAGE_ID = process.env.VITE_RWA_PACKAGE_ID || '0x0';

export interface RWAMintParams {
    assetType: 'real_estate' | 'invoice' | 'bond';
    name: string;
    location: string;
    valuation: number; // in USD, will be scaled by 1e6
    documentationUri: string;
}

export class SuiRWAService {
    /**
     * Mint a new RWA token
     */
    static mintRWA(params: RWAMintParams): Transaction {
        const tx = new Transaction();

        const valuationScaled = Math.floor(params.valuation * 1_000_000);

        const functionName = params.assetType === 'real_estate'
            ? 'mint_real_estate'
            : params.assetType === 'invoice'
                ? 'mint_invoice'
                : 'mint_bond';

        tx.moveCall({
            target: `${RWA_PACKAGE_ID}::rwa_registry::${functionName}`,
            arguments: [
                tx.pure.vector('u8', Array.from(new TextEncoder().encode(params.name))),
                tx.pure.vector('u8', Array.from(new TextEncoder().encode(params.location))),
                tx.pure.u64(valuationScaled),
                tx.pure.vector('u8', Array.from(new TextEncoder().encode(params.documentationUri))),
            ],
        });

        return tx;
    }

    /**
     * Transfer RWA token to another address
     */
    static transferRWA(tokenId: string, recipient: string): Transaction {
        const tx = new Transaction();

        tx.moveCall({
            target: `${RWA_PACKAGE_ID}::rwa_registry::transfer_rwa`,
            arguments: [
                tx.object(tokenId),
                tx.pure.address(recipient),
            ],
        });

        return tx;
    }
}
