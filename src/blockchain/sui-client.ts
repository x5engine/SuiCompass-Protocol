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
     * Get all active validators from the Sui System State with real APY.
     */
    async getActiveValidators() {
        try {
            const state = await this.client.getLatestSuiSystemState();
            const apys = await this.client.getValidatorsApy();

            // Create a map of APYs for O(1) lookup
            const apyMap = new Map(apys.apys.map(a => [a.address, a.apy]));

            return state.activeValidators.map((v) => {
                const apyVal = apyMap.get(v.suiAddress) || 0;
                return {
                    public_key: v.suiAddress,
                    name: v.name,
                    description: v.description,
                    imageUrl: v.imageUrl,
                    projectUrl: v.projectUrl,
                    stake: v.stakingPoolSuiBalance,
                    apy: (apyVal * 100).toFixed(2) + "%",
                    commission: (Number(v.commissionRate) / 100).toFixed(2) + "%",
                };
            });
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
