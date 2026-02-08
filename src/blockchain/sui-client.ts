import { SuiClient } from '@mysten/sui/client';

const SUI_TESTNET_RPC = 'https://fullnode.testnet.sui.io:443';
const rpcUrl = import.meta.env.VITE_SUI_NETWORK === 'mainnet' ? 'https://sui-mainnet.blockvision.org' : SUI_TESTNET_RPC;

console.log(`🔗 Connecting to Sui ${import.meta.env.VITE_SUI_NETWORK || 'testnet'}`);

const suiClient = new SuiClient({ url: rpcUrl });

const USDC_COIN_TYPE = import.meta.env.VITE_SUI_NETWORK === 'mainnet'
    ? '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d2177a13c::coin::COIN'
    : '0xda311394c03b156a20516b0d9e80b27a3c3b08e2f0732e70e3a6a978f85f3922::coin::COIN';

export async function getUsdcBalance(owner: string): Promise<number> {
    try {
        const balanceObject = await suiClient.getBalance({ owner, coinType: USDC_COIN_TYPE });
        return Number(balanceObject.totalBalance) / 1_000_000;
    } catch (error) {
        console.error("Failed to fetch USDC balance:", error);
        return 0;
    }
}

export { USDC_COIN_TYPE };
export default suiClient;
