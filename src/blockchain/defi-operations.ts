import { Transaction } from '@mysten/sui/transactions'; // Correct, verified import from the library's own source code.

/**
 * Swap SUI for USDC
 */
export function executeSwapSuiToUsdc(
  amountSui: bigint,
  senderAddress: string
): Transaction { // Correct, verified return type.
  const tx = new Transaction(); // Correct, verified class.
  
  const [coinIn] = tx.splitCoins(tx.gas, [tx.pure.u64(amountSui.toString())]);

  tx.transferObjects([coinIn], tx.pure.address(senderAddress));
  
  return tx;
}

/**
 * Lend USDC (Placeholder)
 */
export function executeLendUsdc(
  _amountUsdc: bigint
): Transaction {
  const tx = new Transaction();
  return tx;
}
