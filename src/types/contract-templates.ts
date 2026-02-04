/**
 * Types for Contract Template System
 */

export type ContractTemplateType = 'staking-pool' | 'lending-pool' | 'token-factory' | 'nft-collection' | 'custom'

export interface TemplateParameter {
  name: string
  type: 'string' | 'number' | 'bool' | 'key' | 'address'
  required: boolean
  description: string
  defaultValue?: any
  validation?: (value: any) => { valid: boolean; error?: string }
}

export interface ContractTemplate {
  id: string
  name: string
  description: string
  type: ContractTemplateType
  wasmPath?: string // Path to WASM file (if available locally)
  wasmUrl?: string // URL to WASM file
  parameters: TemplateParameter[]
  entryPoints: string[]
  defaultValues: Record<string, any>
  estimatedGas?: number // Estimated gas cost in MIST
  category: 'defi' | 'nft' | 'token' | 'utility' | 'custom'
  icon?: string
}

export interface DeploymentRequest {
  templateId: string
  parameters: Record<string, any>
  paymentAmount?: number // SUI amount for deployment
  chainName?: string
}

export interface DeploymentResult {
  success: boolean
  contractHash?: string
  contractPackageHash?: string
  transactionHash?: string
  deployHash?: string
  error?: string
  estimatedGas?: number
  actualGas?: number
}

export interface DeploymentStatus {
  deployHash: string
  status: 'pending' | 'processing' | 'success' | 'failed'
  contractHash?: string
  error?: string
  blockHeight?: number
  timestamp?: Date
}

