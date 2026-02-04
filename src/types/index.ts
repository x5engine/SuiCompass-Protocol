export interface ParsedIntent {
  success: boolean
  intent?: 'stake' | 'bridge' | 'transfer' | 'query'
  entities?: {
    amount?: bigint
    validator?: string
    recipient?: string
    sourceChain?: string
    destinationChain?: string
    token?: string
  }
  riskScore?: number
  transactionData?: any
  error?: string
}

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

export interface WalletState {
  publicKey: string | null
  isConnected: boolean
}

