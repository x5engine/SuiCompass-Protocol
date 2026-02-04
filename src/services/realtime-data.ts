/**
 * Real-time Data Service
 * Polls Sui Data Service for live updates
 */

import { suiDataService } from './sui-data-service'

export interface RealtimeDataConfig {
  accountHash?: string // wallet address
  validatorPublicKey?: string
  contractPackageHash?: string
  interval?: number // Polling interval in milliseconds (default: 5000)
  enabled?: boolean
}

export interface RealtimeDataCallbacks {
  onBalanceUpdate?: (balance: any) => void
  onValidatorUpdate?: (validator: any) => void
  onContractUpdate?: (contract: any) => void
  onTransferUpdate?: (transfers: any[]) => void
  onError?: (error: Error) => void
}

export class RealtimeDataService {
  private config: RealtimeDataConfig
  private callbacks: RealtimeDataCallbacks
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false
  private lastBalance: any = null
  private lastValidator: any = null

  private lastTransferDigest: string | null = null

  constructor(config: RealtimeDataConfig, callbacks: RealtimeDataCallbacks) {
    this.config = {
      interval: 5000, // Default 5 seconds
      enabled: true,
      ...config,
    }
    this.callbacks = callbacks
  }

  /**
   * Start real-time data polling
   */
  start() {
    if (this.isRunning) {
      return
    }

    if (!this.config.enabled) {
      return
    }

    this.isRunning = true
    this.poll()
    this.intervalId = setInterval(() => {
      this.poll()
    }, this.config.interval)
  }

  /**
   * Stop real-time data polling
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RealtimeDataConfig>) {
    this.config = { ...this.config, ...config }

    // Restart if running
    if (this.isRunning) {
      this.stop()
      this.start()
    }
  }

  /**
   * Poll for updates
   */
  private async poll() {
    try {
      if (this.config.accountHash) {
        await this.pollAccountBalance()
        await this.pollAccountTransfers()
      }

      if (this.config.validatorPublicKey) {
        await this.pollValidator()
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error')
      this.callbacks.onError?.(err)
    }
  }

  /**
   * Poll account balance
   */
  private async pollAccountBalance() {
    if (!this.config.accountHash) return

    try {
      const balance = await suiDataService.getAccountBalance(this.config.accountHash)

      if (JSON.stringify(balance) !== JSON.stringify(this.lastBalance)) {
        this.lastBalance = balance
        this.callbacks.onBalanceUpdate?.(balance)
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Poll account transfers
   */
  private async pollAccountTransfers() {
    if (!this.config.accountHash) return

    try {
      const transfers = await suiDataService.getAccountTransactions(this.config.accountHash, 5)

      if (transfers && transfers.length > 0) {
        const latestTransfer = transfers[0]
        const latestDigest = latestTransfer.digest

        if (latestDigest && latestDigest !== this.lastTransferDigest) {
          this.lastTransferDigest = latestDigest
          this.callbacks.onTransferUpdate?.(transfers)
        }
      }
    } catch (error) {
      throw error
    }
  }

  private async pollValidator() {
    if (!this.config.validatorPublicKey) return

    try {
      const validator = await suiDataService.getValidator(this.config.validatorPublicKey)

      if (JSON.stringify(validator) !== JSON.stringify(this.lastValidator)) {
        this.lastValidator = validator
        this.callbacks.onValidatorUpdate?.(validator)
      }
    } catch (error) {
      throw error
    }
  }



  getStatus() {
    return {
      isRunning: this.isRunning,
      config: this.config,
    }
  }
}

export function createRealtimeDataService(
  config: RealtimeDataConfig,
  callbacks: RealtimeDataCallbacks
): RealtimeDataService {
  return new RealtimeDataService(config, callbacks)
}
