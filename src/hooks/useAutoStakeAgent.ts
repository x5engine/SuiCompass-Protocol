/**
 * React hook for Auto-Stake Agent
 */

import { useEffect, useCallback } from 'react'
import { useWallet } from '../blockchain/WalletProvider'
import { useAutoStakeStore } from '../stores/auto-stake-store'
import { autoStakeAgent } from '../services/auto-stake-agent'
import { showNotification } from '../components/ui/Notification'
import { executeLiquidStake } from '../blockchain/sui-operations'

export function useAutoStakeAgent() {
  const { publicKey, isConnected, signAndExecute } = useWallet()
  const { enabled, status, pendingStakeAmount, pendingValidator, recordStake, setStatus } = useAutoStakeStore()

  // Start/stop agent based on enabled state
  useEffect(() => {
    if (!isConnected || !publicKey) {
      autoStakeAgent.stop()
      return
    }

    if (enabled) {
      autoStakeAgent.start(publicKey)
    } else {
      autoStakeAgent.stop()
    }

    return () => {
      autoStakeAgent.stop()
    }
  }, [enabled, isConnected, publicKey])

  /**
   * Execute pending stake transaction
   */
  const executePendingStake = useCallback(async () => {
    if (!pendingStakeAmount || !pendingValidator || !publicKey) {
      return
    }

    try {
      setStatus('executing')

      const amountMists = BigInt(Math.floor(pendingStakeAmount * 1e9))

      // Build transaction
      const tx = await executeLiquidStake({
        amount: amountMists,
        validatorPublicKey: pendingValidator,
      })

      // Sign and execute transaction
      const result = await signAndExecute({ transactionBlock: tx })

      // Record success
      recordStake(pendingStakeAmount, pendingValidator, result.digest)

      showNotification({
        type: 'success',
        title: '✅ Auto-Stake Executed',
        message: `Staked ${pendingStakeAmount.toFixed(2)} SUI. Digest: ${result.digest.slice(0, 16)}...`,
        duration: 5000,
      })

      // Reset status
      setStatus('monitoring')
    } catch (error) {
      console.error('Error executing pending stake:', error)
      setStatus('error')

      showNotification({
        type: 'error',
        title: 'Auto-Stake Failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }, [pendingStakeAmount, pendingValidator, publicKey, signAndExecute, recordStake, setStatus])

  return {
    enabled,
    status,
    pendingStakeAmount,
    pendingValidator,
    executePendingStake,
  }
}
