/**
 * Types for RWA (Real World Asset) Tokenization and AI Risk Audit
 */

export interface RWAMetadata {
  assetType: 'invoice' | 'bill' | 'receivable' | 'other'
  issuer: string // Account hash or public key
  amount: number // Amount in SUI or specified currency
  currency: string // Currency code (SUI, USD, etc.)
  dueDate: string // ISO date string
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  riskScore: number // 0-100, from AI audit
  documentHash: string // IPFS hash of the document
  description?: string
  createdAt: string // ISO date string
  tokenId?: string // CEP-78 token ID after minting
  contractHash?: string // Contract package hash
}

export interface RiskAuditResult {
  riskScore: number // 0-100
  riskFactors: RiskFactor[]
  recommendations: string[]
  authenticityAssessment: 'authentic' | 'suspicious' | 'fraudulent'
  confidence: number // 0-100
  auditTimestamp: string
}

export interface RiskFactor {
  type: 'amount' | 'issuer' | 'date' | 'document' | 'pattern' | 'history'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  impact: string
}

export interface TokenizationRequest {
  metadata: Omit<RWAMetadata, 'riskScore' | 'documentHash' | 'tokenId' | 'contractHash' | 'createdAt'>
  documentFile?: File
  documentUrl?: string
}

export interface TokenizationResult {
  success: boolean
  tokenId?: string
  contractHash?: string
  transactionHash?: string
  ipfsHash?: string
  error?: string
}

