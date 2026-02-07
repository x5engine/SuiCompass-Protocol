#!/usr/bin/env node

/**
 * SuiCompass CLI - Stake Command
 * Stake SUI tokens with a validator
 */

import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromB64 } from '@mysten/sui/utils';

const RPC_URL = process.env.SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443';

interface StakeOptions {
    amount: string;
    validator?: string;
    privateKey?: string;
}

export async function stakeCommand(options: StakeOptions) {
    try {
        const client = new SuiClient({ url: RPC_URL });

        // Parse amount (in SUI, convert to MIST)
        const amountMist = BigInt(Math.floor(parseFloat(options.amount) * 1_000_000_000));

        // Get validator address
        let validatorAddress = options.validator;
        if (!validatorAddress) {
            console.log('🔍 Finding best validator...');
            const validators = await client.getLatestSuiSystemState();
            // Pick validator with highest APY (simplified)
            validatorAddress = validators.activeValidators[0].suiAddress;
            console.log(`Selected validator: ${validatorAddress.slice(0, 10)}...`);
        }

        // Load keypair from private key
        if (!options.privateKey) {
            console.error('❌ Private key required. Use --private-key flag');
            process.exit(1);
        }

        const keypair = Ed25519Keypair.fromSecretKey(fromB64(options.privateKey));
        const address = keypair.getPublicKey().toSuiAddress();

        // Build transaction
        const tx = new Transaction();
        const [coin] = tx.splitCoins(tx.gas, [amountMist]);
        tx.moveCall({
            target: '0x3::sui_system::request_add_stake',
            arguments: [
                tx.object('0x5'),
                coin,
                tx.pure.address(validatorAddress),
            ],
        });

        // Execute
        console.log('📝 Signing and executing transaction...');
        const result = await client.signAndExecuteTransaction({
            signer: keypair,
            transaction: tx,
        });

        console.log('✅ Staking successful!');
        console.log(`Digest: ${result.digest}`);
        console.log(`Amount: ${options.amount} SUI`);
        console.log(`Validator: ${validatorAddress}`);
    } catch (error) {
        console.error('❌ Staking failed:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}
