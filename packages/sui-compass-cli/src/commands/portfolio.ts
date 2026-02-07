#!/usr/bin/env node

/**
 * SuiCompass CLI - Portfolio Command
 * View wallet balance and staking positions
 */

import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromB64 } from '@mysten/sui/utils';

const RPC_URL = process.env.SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443';

interface PortfolioOptions {
    address?: string;
    privateKey?: string;
}

export async function portfolioCommand(options: PortfolioOptions) {
    try {
        const client = new SuiClient({ url: RPC_URL });

        // Get address
        let address = options.address;
        if (!address && options.privateKey) {
            const keypair = Ed25519Keypair.fromSecretKey(fromB64(options.privateKey));
            address = keypair.getPublicKey().toSuiAddress();
        }

        if (!address) {
            console.error('❌ Address or private key required');
            process.exit(1);
        }

        console.log(`\n📊 Portfolio for ${address.slice(0, 10)}...${address.slice(-6)}\n`);

        // Get balance
        const balance = await client.getBalance({ owner: address });
        const suiBalance = Number(balance.totalBalance) / 1_000_000_000;
        console.log(`💰 Available Balance: ${suiBalance.toFixed(4)} SUI`);

        // Get staking positions
        const stakes = await client.getStakes({ owner: address });

        if (stakes.length === 0) {
            console.log(`🔒 Staked: 0 SUI`);
            console.log(`🎁 Pending Rewards: 0 SUI`);
        } else {
            let totalStaked = 0;
            let totalRewards = 0;

            console.log(`\n🔒 Staking Positions:\n`);

            stakes.forEach((stake, i) => {
                const stakedAmount = Number(stake.stakes[0]?.principal || 0) / 1_000_000_000;
                const estimatedReward = Number(stake.stakes[0]?.estimatedReward || 0) / 1_000_000_000;

                totalStaked += stakedAmount;
                totalRewards += estimatedReward;

                console.log(`  ${i + 1}. Validator: ${stake.validatorAddress.slice(0, 10)}...`);
                console.log(`     Staked: ${stakedAmount.toFixed(4)} SUI`);
                console.log(`     Rewards: ${estimatedReward.toFixed(4)} SUI`);
                console.log('');
            });

            console.log(`Total Staked: ${totalStaked.toFixed(4)} SUI`);
            console.log(`Total Rewards: ${totalRewards.toFixed(4)} SUI`);
        }

        console.log(`\n💎 Total Value: ${(suiBalance + (stakes.length > 0 ? stakes.reduce((sum, s) => sum + Number(s.stakes[0]?.principal || 0), 0) / 1_000_000_000 : 0)).toFixed(4)} SUI\n`);

    } catch (error) {
        console.error('❌ Failed to fetch portfolio:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}
