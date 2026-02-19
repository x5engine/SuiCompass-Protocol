import { Transaction } from '@mysten/sui/transactions';
import { CONTRACTS, SHARED_OBJECTS } from '../lib/constants';

// Helper to get the package ID
const PKG = CONTRACTS.RWA_REGISTRY; 

export class ContractInteractions {

    // --- 1. Portfolio (Robo-Advisor) ---
    static createPortfolio(): Transaction {
        const tx = new Transaction();
        tx.moveCall({
            target: `${PKG}::portfolio::create_portfolio`,
            arguments: [],
        });
        return tx;
    }

    static depositToPortfolio(portfolioId: string, amount: number): Transaction {
        const tx = new Transaction();
        const coin = tx.splitCoins(tx.gas, [tx.pure.u64(amount * 1e9)]); // SUI to MIST
        tx.moveCall({
            target: `${PKG}::portfolio::deposit`,
            arguments: [tx.object(portfolioId), coin],
        });
        return tx;
    }

    // --- 2. Index Fund (ETF) ---
    static buyIndexFund(amountSui: number, amountUsdc: number, usdcCoinId: string): Transaction {
        const tx = new Transaction();
        const suiCoin = tx.splitCoins(tx.gas, [tx.pure.u64(amountSui * 1e9)]);
        const usdcCoin = tx.object(usdcCoinId); 

        // Placeholders until Index Fund setup script is fully operational
        const vault = tx.object('0x0'); 
        const treasury = tx.object('0x0');

        tx.moveCall({
            target: `${PKG}::index_fund::mint_shares`,
            arguments: [vault, treasury, suiCoin, usdcCoin],
        });
        return tx;
    }

    // --- 3. Flash Loan ---
    static executeFlashArbitrage(amount: number): Transaction {
        const tx = new Transaction();
        // Placeholder until Flash Loan setup script is fully operational
        const lender = tx.object('0x0'); 
        
        tx.moveCall({
            target: `${PKG}::flash_loan::execute_arbitrage`,
            arguments: [lender, tx.pure.u64(amount * 1e9)],
        });
        return tx;
    }

    // --- 4. Prediction Market ---
    static placeBet(marketId: string, prediction: boolean, amount: number): Transaction {
        const tx = new Transaction();
        const coin = tx.splitCoins(tx.gas, [tx.pure.u64(amount * 1e9)]);
        
        tx.moveCall({
            target: `${PKG}::prediction_market::place_bet`,
            arguments: [
                tx.object(marketId),
                tx.pure.bool(prediction),
                coin
            ],
        });
        return tx;
    }

    // --- 5. Social Trading ---
    static copyTrader(vaultId: string, treasuryId: string, amount: number): Transaction {
        const tx = new Transaction();
        const coin = tx.splitCoins(tx.gas, [tx.pure.u64(amount * 1e9)]);
        
        tx.moveCall({
            target: `${PKG}::social_trading::deposit`,
            arguments: [tx.object(vaultId), tx.object(treasuryId), coin],
        });
        return tx;
    }

    // --- 6. Stream Pay ---
    static createStream(recipient: string, amount: number, durationMs: number): Transaction {
        const tx = new Transaction();
        const coin = tx.splitCoins(tx.gas, [tx.pure.u64(amount * 1e9)]);
        const clock = tx.sharedObjectRef({
            objectId: '0x6',
            initialSharedVersion: 1,
            mutable: false,
        });

        tx.moveCall({
            target: `${PKG}::stream_pay::create_stream`,
            arguments: [
                tx.pure.address(recipient),
                coin,
                tx.pure.u64(durationMs),
                clock
            ],
        });
        return tx;
    }

    // --- 8. Lossless Lottery ---
    static enterLottery(amount: number): Transaction {
        const tx = new Transaction();
        const coin = tx.splitCoins(tx.gas, [tx.pure.u64(amount * 1e9)]);
        
        tx.moveCall({
            target: `${PKG}::lossless_lottery::deposit`,
            arguments: [tx.object(SHARED_OBJECTS.LOSSLESS_POOL), coin],
        });
        return tx;
    }

    // --- 10. Bridge ---
    static bridgeAsset(amount: number, targetChain: string, targetAddr: string): Transaction {
        const tx = new Transaction();
        const coin = tx.splitCoins(tx.gas, [tx.pure.u64(amount * 1e9)]);
        
        tx.moveCall({
            target: `${PKG}::bridge_adaptor::bridge_asset`,
            typeArguments: ['0x2::sui::SUI'],
            arguments: [
                tx.object(SHARED_OBJECTS.BRIDGE_CONFIG),
                coin,
                tx.pure.string(targetChain),
                tx.pure.string(targetAddr)
            ],
        });
        return tx;
    }

    // --- 11. Reputation ID ---
    static createIdentity(): Transaction {
        const tx = new Transaction();
        tx.moveCall({
            target: `${PKG}::reputation_id::create_profile`,
            arguments: [],
        });
        return tx;
    }
}
