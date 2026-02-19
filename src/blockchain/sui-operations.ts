import { Transaction } from '@mysten/sui/transactions';
import suiClient from './sui-client';

export async function findBestValidator(): Promise<string> {
  const validators = await suiClient.getValidatorsApy();
  if (!validators.apys || validators.apys.length === 0) {
    throw new Error('No validators found');
  }
  const best = validators.apys.reduce((prev: any, current: any) => (Number(prev.apy) > Number(current.apy)) ? prev : current);
  return best.address;
}

export function executeLiquidStake(params: { amount: bigint; validatorPublicKey: string }): Transaction {
    const tx = new Transaction();
    // Logic for liquid stake
    return tx;
}

// ... other functions
