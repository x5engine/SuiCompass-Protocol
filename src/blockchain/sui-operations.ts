import { SuiClient } from '@mysten/sui/client';
import suiClient from './sui-client';
import { Transaction } from '@mysten/sui/transactions';
import { USDC_COIN_TYPE } from './sui-client';

const SUI_LIQUID_STAKE_PACKAGE_ID = '0x...'; // Replace with actual package ID

/**
 * Find the validator with the highest APY
 */
export async function findBestValidator(): Promise<string> {
  const validators = await suiClient.getValidators();
  if (!validators || validators.length === 0) {
    throw new Error('No validators found');
  }
  const best = validators.reduce((prev, current) => (Number(prev.apy) > Number(current.apy)) ? prev : current);
  return best.suiAddress;
}

/**
 * Get staking info for an address
 */
export async function getStakingInfo(address: string) {
  const stakes = await suiClient.getStakes({ owner: address });
  let stakedAmount = BigInt(0);
  let pendingRewards = BigInt(0);
  stakes.forEach(s => {
    s.stakes.forEach(stake => {
      stakedAmount += BigInt(stake.principal);
      // Reward calculation is more complex, this is a placeholder
    });
  });
  return { stakedAmount, pendingRewards, stakes };
}

/**
 * Get SUI price (mocked)
 */
export async function getSuiPrice(): Promise<number> {
  return Promise.resolve(4.25); // Mock price
}

/**
 * Create a transaction to liquid stake SUI
 */
export async function executeLiquidStake(params: { amount: bigint; validatorPublicKey: string }): Promise<Transaction> {
  const tx = new Transaction();
  const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(params.amount.toString())]);
  tx.moveCall({
    target: `${SUI_LIQUID_STAKE_PACKAGE_ID}::liquid_stake::stake`,
    arguments: [tx.object('0x...'), coin, tx.pure.address(params.validatorPublicKey)], // Replace with actual pool ID
  });
  return tx;
}
