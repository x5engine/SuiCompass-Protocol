/**
 * Types for Auto-Stake Agent functionality
 */

export interface AutoStakeSettings {
  enabled: boolean
  threshold: number // Minimum SUI to stake (default: 10)
  interval: number // Polling interval in minutes (default: 5)
  validatorStrategy: 'best-apy' | 'preferred' | 'random'
  preferredValidators: string[] // List of validator public keys
  maxStakePerDay: number // Maximum SUI to stake per day (default: 1000)
  maxTotalStaked: number // Maximum total staked amount (default: 10000)
}

export interface AutoStakeState extends AutoStakeSettings {
  lastStakeTime: Date | null
  totalStakedToday: number
  lastCheckedBalance: bigint
  pendingStakeAmount: number | null // Amount ready to stake
  pendingValidator: string | null // Validator selected for pending stake
  status: 'idle' | 'monitoring' | 'ready' | 'executing' | 'error'
  error: string | null
}

export interface AutoStakeAction {
  id: string
  timestamp: Date
  type: 'stake' | 'unstake' | 'claim'
  amount: number
  validator: string | null
  status: 'pending' | 'approved' | 'executed' | 'failed'
  transactionHash: string | null
  error: string | null
}

