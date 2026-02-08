/**
 * Auto-Stake Agent Service
 * Monitors balance and automatically prepares stake transactions
 */

import suiClient from '../blockchain/sui-client'
import { findBestValidator } from '../blockchain/sui-operations'
import { useAutoStakeStore } from '../stores/auto-stake-store'
import { showNotification } from '../components/ui/Notification'

class AutoStakeAgent {
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false
  private publicKey: string | null = null

  /**
   * Start monitoring balance
   */
  start(publicKey: string) {
    if (this.isRunning) {
      console.warn('Auto-stake agent already running')
      return
    }

    this.publicKey = publicKey
    this.isRunning = true
    const store = useAutoStakeStore.getState()

    if (!store.enabled) {
      console.log('Auto-stake agent disabled, not starting')
      return
    }

    console.log('🤖 Auto-stake agent started')
    store.setStatus('monitoring')

    // Check immediately
    this.checkAndStake()

    // Then check at intervals
    const intervalMs = store.interval * 60 * 1000
    this.intervalId = setInterval(() => {
      this.checkAndStake()
    }, intervalMs)
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    const store = useAutoStakeStore.getState()
    store.setStatus('idle')
    console.log('🤖 Auto-stake agent stopped')
  }

  /**
   * Check balance and prepare stake if conditions met
   */
  private async checkAndStake() {
    const store = useAutoStakeStore.getState()
    const { publicKey } = this

    if (!publicKey || !store.enabled) {
      this.stop()
      return
    }

    try {
      store.setStatus('monitoring')

      // Check balance
      const balanceData = await suiClient.getBalance({ owner: publicKey });
      const balanceSUI = Number(balanceData.totalBalance) / 1e9;

      store.setLastCheckedBalance(balanceData.totalBalance);

      // Check if balance exceeds threshold
      if (balanceSUI < store.threshold) {
        console.log(`💰 Balance ${balanceSUI.toFixed(2)} SUI below threshold ${store.threshold} SUI`)
        store.clearPendingStake()
        return
      }

      // Check daily limit (Simplified logic)
      if (store.totalStakedToday >= store.maxStakePerDay) {
        store.setError('Daily staking limit reached')
        return
      }

      // Calculate available amount to stake
      const availableToStake = Math.min(
        balanceSUI - store.threshold,
        store.maxStakePerDay - store.totalStakedToday
      )

      if (availableToStake < 1.0) { // Min 1 SUI to stake typically
        return;
      }

      // Find validator
      let validator = await findBestValidator()

      // Set pending stake
      store.setPendingStake(availableToStake, validator)

      // Show notification
      showNotification({
        type: 'info',
        title: 'Auto-Stake Ready',
        message: `Ready to stake ${availableToStake.toFixed(2)} SUI. Click to execute.`,
        duration: 10000,
      })

    } catch (error) {
      console.error('Error in auto-stake check:', error)
      store.setError(error instanceof Error ? error.message : 'Unknown error')
      store.setStatus('error')
    }
  }

  /**
   * Execute the pending stake transaction (helper, usually called by UI hook)
   */
  async executeStake(_amount: number, _validator: string) {
    // In the new flow, this is handled by useAutoStakeAgent which has access to wallet signer
    // This method is kept for compatibility if needed, but logic is moved to hook
    throw new Error("Use useAutoStakeAgent hook to execute stake");
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      publicKey: this.publicKey,
    }
  }
}

// Singleton instance
export const autoStakeAgent = new AutoStakeAgent()
