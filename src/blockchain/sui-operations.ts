import { Transaction } from '@mysten/sui/transactions';
import { SUI_SYSTEM_STATE_OBJECT_ID } from '@mysten/sui/utils';
import { suiClient } from './sui-client';

/**
 * Execute native SUI staking (RequestAddStake)
 */
export async function executeLiquidStake(params: {
  amount: bigint; // in MIST
  validatorPublicKey: string;
}) {
  const tx = new Transaction();

  // Split coins to get the stake amount
  // We use [tx.gas] if we want to stake from gas object, or split from a specific coin.
  // Ideally, dApp kit manages coin selection.
  // Simplest pattern: split from gas
  const [stakeCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(params.amount)]);

  tx.moveCall({
    target: '0x3::sui_system::request_add_stake',
    arguments: [
      tx.object(SUI_SYSTEM_STATE_OBJECT_ID),
      stakeCoin,
      tx.pure.address(params.validatorPublicKey),
    ],
  });

  return tx;
}

/**
 * Unstake (WithdrawStake)
 */
export async function executeUnstake(
  stakedSuiId: string
) {
  const tx = new Transaction();

  tx.moveCall({
    target: '0x3::sui_system::request_withdraw_stake',
    arguments: [
      tx.object(SUI_SYSTEM_STATE_OBJECT_ID),
      tx.object(stakedSuiId),
    ],
  });

  return tx;
}

/**
 * Claim Rewards - Not explicit in Sui (auto-claimed on withdraw), 
 * but maybe we want to just restake?
 * For now, placeholder.
 */
export async function executeClaimRewards() {
  // Sui rewards are auto-compounded. 
  // Maybe this explains that or does a dummy tx.
  console.log("Sui rewards are auto-compounded!");
  return null;
}

export async function findBestValidator() {
  const validators = await suiClient.getActiveValidators();
  // Return random or first
  return validators[0]?.public_key || '';
}

export async function getStakingInfo(address: string) {
  // Get active stakes
  const stakes = await suiClient.client.getStakes({ owner: address });
  let totalStaked = 0n;
  let estimatedRewards = 0n;

  stakes.forEach(s => {
    s.stakes.forEach(stake => {
      totalStaked += BigInt(stake.principal);
      estimatedRewards += BigInt((stake as any).estimatedReward || 0);
    });
  });

  return {
    stakedAmount: totalStaked,
    pendingRewards: estimatedRewards,
    validator: stakes[0]?.validatorAddress || null // Return first validator or null
  };
}
