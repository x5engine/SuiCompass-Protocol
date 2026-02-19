/**
 * Sui RWA Contract Integration Service
 * Handles interaction with the rwa_registry Move module
 */

import { Transaction } from '@mysten/sui/transactions';
import { CONTRACTS } from '../lib/constants';

// Contract address from constants
const RWA_PACKAGE_ID = CONTRACTS.RWA_REGISTRY;

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

        // Ensure valuation is an integer (Move expects u64)
        const valuationScaled = BigInt(Math.floor(params.valuation * 1_000_000));

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
     * Update the status of an RWA NFT
     */
    static updateRWAStatus(tokenId: string, newStatus: number): Transaction {
        const tx = new Transaction();

        tx.moveCall({
            target: `${RWA_PACKAGE_ID}::rwa_registry::update_status`,
            arguments: [
                tx.object(tokenId),
                tx.pure.u8(newStatus),
            ],
        });

        return tx;
    }

    /**
     * Burn (destroy) the RWA NFT
     */
    static burnRWA(tokenId: string): Transaction {
        const tx = new Transaction();

        tx.moveCall({
            target: `${RWA_PACKAGE_ID}::rwa_registry::burn`,
            arguments: [
                tx.object(tokenId),
            ],
        });

        return tx;
    }
}
