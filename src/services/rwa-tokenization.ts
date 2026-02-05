/**
 * RWA Tokenization Service
 * Handles tokenization of real-world assets (invoices, bills, etc.)
 */

import { aiRiskAuditService } from './ai-risk-audit'
import { pinataService } from './ipfs-pinata'
import { Transaction } from '@mysten/sui/transactions';
import type { RWAMetadata, TokenizationRequest, TokenizationResult, RiskAuditResult } from '../types/rwa-audit'

export class RWATokenizationService {
  /**
   * Tokenize an RWA with AI risk audit
   */
  async tokenizeRWA(
    request: TokenizationRequest,
    riskThreshold: number = 70
  ): Promise<{
    auditResult: RiskAuditResult
    tokenizationResult: TokenizationResult | null
  }> {
    // Step 1: Upload document to IPFS if provided
    let documentHash: string | undefined
    let documentText: string | undefined

    if (request.documentFile) {
      const uploadResult = await pinataService.uploadFile(request.documentFile, {
        assetType: request.metadata.assetType,
        issuer: request.metadata.issuer,
        amount: request.metadata.amount.toString(),
      })

      if (!uploadResult.success || !uploadResult.ipfsHash) {
        return {
          auditResult: {
            riskScore: 100,
            riskFactors: [
              {
                type: 'document',
                severity: 'critical',
                description: 'Failed to upload document to IPFS',
                impact: 'Cannot proceed with tokenization',
              },
            ],
            recommendations: ['Check Pinata configuration and try again'],
            authenticityAssessment: 'fraudulent',
            confidence: 0,
            auditTimestamp: new Date().toISOString(),
          },
          tokenizationResult: {
            success: false,
            error: uploadResult.error || 'IPFS upload failed',
          },
        }
      }

      documentHash = uploadResult.ipfsHash

      // Try to extract text from document (for PDFs, images, etc.)
      // This is a placeholder - in production, you'd use OCR or PDF parsing
      documentText = await this.extractDocumentText(request.documentFile)
    } else if (request.documentUrl) {
      // If URL provided, we can fetch and analyze
      documentHash = request.documentUrl
    }

    // Step 2: Run AI risk audit
    const metadata: RWAMetadata = {
      ...request.metadata,
      documentHash: documentHash || '',
      createdAt: new Date().toISOString(),
      status: 'pending',
      riskScore: 0, // Will be set by audit
    }

    const auditResult = await aiRiskAuditService.auditRWA(metadata, documentText)

    // Update metadata with risk score
    metadata.riskScore = auditResult.riskScore

    // Step 3: Check if tokenization should proceed
    const shouldProceed = aiRiskAuditService.shouldAllowTokenization(
      auditResult.riskScore,
      riskThreshold
    )

    if (!shouldProceed) {
      return {
        auditResult,
        tokenizationResult: {
          success: false,
          error: `Risk score ${auditResult.riskScore} exceeds threshold ${riskThreshold}. Tokenization blocked for safety.`,
        },
      }
    }

    // Step 4: Upload metadata to IPFS
    const metadataUpload = await pinataService.uploadJSON(metadata, `rwa-metadata-${Date.now()}.json`)

    if (!metadataUpload.success || !metadataUpload.ipfsHash) {
      return {
        auditResult,
        tokenizationResult: {
          success: false,
          error: metadataUpload.error || 'Failed to upload metadata to IPFS',
        },
      }
    }

    // Step 5: Prepare tokenization result
    // Note: Actual contract deployment will be handled separately
    // This service prepares everything and returns the data needed for contract interaction
    return {
      auditResult,
      tokenizationResult: {
        success: true,
        ipfsHash: metadataUpload.ipfsHash,
        // tokenId and contractHash will be set after contract deployment
      },
    }
  }

  /**
   * Create transaction to mint RWA NFT
   */
  async mintRWA(
    packageId: string, // The on-chain package ID
    metadata: RWAMetadata,
    ipfsHash: string
  ): Promise<Transaction> {
    const tx = new Transaction();

    // Construct IPFS URL
    const url = `ipfs://${ipfsHash}`;

    tx.moveCall({
      target: `${packageId}::rwa_nft::mint`,
      arguments: [
        tx.pure.string(metadata.assetType + " - " + metadata.amount.toString()), // Name
        tx.pure.string(metadata.description || "RWA Tokenized Asset"), // Description
        tx.pure.string(url), // URL
        tx.pure.string(metadata.amount.toString()), // Amount
        tx.pure.string(metadata.currency), // Currency
        tx.pure.string(metadata.dueDate), // Due Date
        tx.pure.string(metadata.issuer), // Issuer
      ],
    });

    return tx;
  }

  /**
   * Extract text from document file (placeholder - implement OCR/PDF parsing)
   */
  private async extractDocumentText(file: File): Promise<string | undefined> {
    // Placeholder implementation
    // In production, you would:
    // 1. For PDFs: Use pdf.js or similar library
    // 2. For images: Use OCR (Tesseract.js, Google Vision API, etc.)
    // 3. For text files: Read directly

    if (file.type === 'text/plain') {
      return await file.text()
    }

    // For now, return undefined - AI will work with metadata only
    return undefined
  }

  /**
   * Validate tokenization request
   */
  validateRequest(request: TokenizationRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!request.metadata.issuer) {
      errors.push('Issuer is required')
    }

    if (!request.metadata.amount || request.metadata.amount <= 0) {
      errors.push('Amount must be greater than 0')
    }

    if (!request.metadata.currency) {
      errors.push('Currency is required')
    }

    if (!request.metadata.dueDate) {
      errors.push('Due date is required')
    } else {
      const dueDate = new Date(request.metadata.dueDate)
      if (isNaN(dueDate.getTime())) {
        errors.push('Invalid due date format')
      }
    }

    if (!request.documentFile && !request.documentUrl) {
      errors.push('Either document file or URL is required')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}

// Singleton instance
export const rwaTokenizationService = new RWATokenizationService()

