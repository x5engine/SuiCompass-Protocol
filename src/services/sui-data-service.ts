import { suiClient, SuiNetworkClient } from '../blockchain/sui-client';


export class SuiDataService {
    private client: SuiNetworkClient;

    constructor() {
        this.client = suiClient;
    }

    /**
     * Get account balance in MIST and SUI
     */
    async getAccountBalance(address: string) {
        const balanceMists = await this.client.getAccountBalance(address);
        return {
            mists: balanceMists,
            sui: Number(balanceMists) / 1e9,
        };
    }

    /**
     * Get all active validators
     */
    async getValidators() {
        const validators = await this.client.getActiveValidators();
        return {
            validators,
            count: validators.length,
        };
    }

    /**
     * Get specific validator details
     */
    async getValidator(address: string) {
        return this.client.getValidatorInfo(address);
    }

    /**
     * Get recent transactions for an account
     */
    async getAccountTransactions(address: string, limit: number = 10) {
        try {
            const txs = await this.client.client.queryTransactionBlocks({
                filter: { FromAddress: address },
                options: {
                    showEffects: true,
                    showInput: true,
                    showBalanceChanges: true,
                },
                limit,
                order: 'descending',
            });
            return txs.data;
        } catch (error) {
            console.error('Error fetching transactions:', error);
            return [];
        }
    }

    /**
     * Get SUI Price (Mock/Public API)
     * TODO: Connect to Pyth or CoinGecko
     */
    async getSuiRate(currency: string = 'usd') {
        // Mock response for now
        return {
            rate: 1.50, // Mock price
            currency,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Get SUI Supply
     */
    async getSuiSupply() {
        try {
            const supply = await this.client.client.getTotalSupply({ coinType: '0x2::sui::SUI' });
            return {
                total: Number(supply.value) / 1e9,
            };
        } catch (error) {
            console.error('Error getting supply:', error);
            return { total: 10000000000 };
        }
    }

    /**
     * Resolve SuiNS Name
     */
    async resolveSuiName(name: string): Promise<string | null> {
        try {
            const address = await this.client.client.resolveNameServiceAddress({
                name,
            });
            return address;
        } catch (error) {
            // Name not found
            return null;
        }
    }

    /**
     * Get Portfolio (Balance + Staked)
     */
    async getPortfolio(address: string) {
        const balance = await this.getAccountBalance(address);
        const staked = await this.client.client.getStakes({ owner: address });

        // Calculate total staked
        let totalStakedMists = 0n;
        staked.forEach(s => {
            s.stakes.forEach(stake => {
                totalStakedMists += BigInt(stake.principal);
            });
        });

        return {
            balance: balance.sui,
            staked: Number(totalStakedMists) / 1e9,
            active_stakes: staked,
        };
    }
}

export const suiDataService = new SuiDataService();
