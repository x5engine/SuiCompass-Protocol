import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

export class SuiNetworkClient {
    public client: SuiClient;

    constructor(network: string = 'mainnet') {
        // Map to valid Sui networks or use custom URL
        const rpcUrl = import.meta.env.VITE_SUI_RPC_URL || getFullnodeUrl(network as any);

        console.log(`🔗 Connecting to Sui ${network} at ${rpcUrl}`);
        this.client = new SuiClient({ url: rpcUrl });
    }

    /**
     * Get account balance in MIST (Sui's smallest unit).
     * 1 SUI = 1,000,000,000 MIST.
     */
    async getAccountBalance(address: string): Promise<bigint> {
        try {
            const balance = await this.client.getBalance({
                owner: address,
            });
            return BigInt(balance.totalBalance);
        } catch (error) {
            console.error('❌ Error getting balance:', error);
            return BigInt(0);
        }
    }

    /**
     * Get all active validators from the Sui System State.
     */
    async getActiveValidators() {
        try {
            const state = await this.client.getLatestSuiSystemState();
            return state.activeValidators.map((v) => ({
                public_key: v.suiAddress,
                name: v.name,
                stake: v.votingPower, // or stakingPoolSuiBalance
                apy: (Number(v.nextEpochStake) / 1e9).toFixed(2) + "%", // Simplified placeholder
                commission: v.commissionRate,
            }));
        } catch (error) {
            console.error('❌ Error getting validators:', error);
            return [];
        }
    }

    /**
     * Get specific validator info.
     */
    async getValidatorInfo(address: string) {
        try {
            const validators = await this.getActiveValidators();
            return validators.find(v => v.public_key === address) || null;
        } catch (error) {
            console.error('❌ Error getting validator info:', error);
            return null;
        }
    }

    /**
     * Get transaction details.
     */
    async getTransaction(digest: string) {
        try {
            return await this.client.getTransactionBlock({
                digest,
                options: {
                    showEffects: true,
                    showInput: true,
                    showEvents: true,
                    showBalanceChanges: true,
                },
            });
        } catch (error) {
            console.error('❌ Error getting transaction:', error);
            throw error;
        }
    }
}

// Export singleton
export const suiClient = new SuiNetworkClient(
    (import.meta.env.VITE_SUI_NETWORK as string) || 'mainnet'
);
