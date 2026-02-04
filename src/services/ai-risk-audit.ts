/**
 * AI Risk Audit Service
 * Analyzes invoices/bills for tokenization risk using EmbedAPI
 */

import { embedApiClient } from '../ai/embedapi-client'
import type { RWAMetadata, RiskAuditResult, RiskFactor } from '../types/rwa-audit'

export class AIRiskAuditService {
  /**
   * Audit an RWA document for tokenization risk
   */
  async auditRWA(metadata: RWAMetadata, documentText?: string): Promise<RiskAuditResult> {
    try {
      // Build audit prompt
      const auditPrompt = this.buildAuditPrompt(metadata, documentText)

      if (!embedApiClient) {
        throw new Error('EmbedAPI client not configured')
      }

      // Call EmbedAPI for risk analysis
      const response = await embedApiClient.generate({
        service: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        messages: [
          {
            role: 'user',
            content: auditPrompt,
          },
        ],
        temperature: 0.2, // Lower temperature for more consistent risk assessment
        maxTokens: 1000,
      })

      // Parse response - handle different response formats
      let responseText: string
      if ((response as any)?.data) {
        if (typeof (response as any).data === 'string') {
          responseText = (response as any).data
        } else {
          responseText = (response as any).data.text || JSON.stringify((response as any).data)
        }
      } else {
        responseText = (response as any)?.text || JSON.stringify(response)
      }

      // Parse response
      const auditData = this.parseAuditResponse(responseText)

      return {
        riskScore: auditData.riskScore,
        riskFactors: auditData.riskFactors,
        recommendations: auditData.recommendations,
        authenticityAssessment: auditData.authenticityAssessment,
        confidence: auditData.confidence || 75,
        auditTimestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error('AI Risk Audit Error:', error)
      
      // Return conservative default on error
      return {
        riskScore: 70, // High risk if audit fails
        riskFactors: [
          {
            type: 'document',
            severity: 'high',
            description: 'AI audit service unavailable',
            impact: 'Cannot verify document authenticity',
          },
        ],
        recommendations: [
          'Manual review recommended',
          'Verify document authenticity before tokenization',
        ],
        authenticityAssessment: 'suspicious',
        confidence: 0,
        auditTimestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Build audit prompt for EmbedAPI
   */
  private buildAuditPrompt(metadata: RWAMetadata, documentText?: string): string {
    return `You are a financial risk assessment AI. Analyze this real-world asset (RWA) for tokenization risk.

ASSET INFORMATION:
- Type: ${metadata.assetType}
- Issuer: ${metadata.issuer}
- Amount: ${metadata.amount} ${metadata.currency}
- Due Date: ${metadata.dueDate}
- Status: ${metadata.status}
${metadata.description ? `- Description: ${metadata.description}` : ''}

${documentText ? `\nDOCUMENT CONTENT:\n${documentText}\n` : ''}

ANALYSIS REQUIRED:
1. Calculate risk score (0-100, where 0 = very safe, 100 = very risky)
2. Identify risk factors (amount anomalies, issuer credibility, date validity, document authenticity, suspicious patterns)
3. Provide recommendations for risk mitigation
4. Assess document authenticity (authentic, suspicious, or fraudulent)
5. Provide confidence level (0-100) in your assessment

Consider:
- Amount reasonableness for asset type
- Issuer credibility and history
- Due date validity (not in past, reasonable timeframe)
- Document structure and consistency
- Common fraud patterns
- Regulatory compliance

Respond in JSON format:
{
  "riskScore": <number 0-100>,
  "riskFactors": [
    {
      "type": "amount" | "issuer" | "date" | "document" | "pattern" | "history",
      "severity": "low" | "medium" | "high" | "critical",
      "description": "<description>",
      "impact": "<impact explanation>"
    }
  ],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...],
  "authenticityAssessment": "authentic" | "suspicious" | "fraudulent",
  "confidence": <number 0-100>
}`
  }

  /**
   * Parse audit response from EmbedAPI
   */
  private parseAuditResponse(responseText: string): {
    riskScore: number
    riskFactors: RiskFactor[]
    recommendations: string[]
    authenticityAssessment: 'authentic' | 'suspicious' | 'fraudulent'
    confidence: number
  } {
    try {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          riskScore: Math.max(0, Math.min(100, parsed.riskScore || 50)),
          riskFactors: parsed.riskFactors || [],
          recommendations: parsed.recommendations || [],
          authenticityAssessment: parsed.authenticityAssessment || 'suspicious',
          confidence: Math.max(0, Math.min(100, parsed.confidence || 50)),
        }
      }

      // Fallback: try to parse entire response
      const parsed = JSON.parse(responseText)
      return {
        riskScore: Math.max(0, Math.min(100, parsed.riskScore || 50)),
        riskFactors: parsed.riskFactors || [],
        recommendations: parsed.recommendations || [],
        authenticityAssessment: parsed.authenticityAssessment || 'suspicious',
        confidence: Math.max(0, Math.min(100, parsed.confidence || 50)),
      }
    } catch (error) {
      console.error('Error parsing audit response:', error)
      
      // Return default conservative assessment
      return {
        riskScore: 60,
        riskFactors: [
          {
            type: 'document',
            severity: 'medium',
            description: 'Unable to parse audit response',
            impact: 'Manual review required',
          },
        ],
        recommendations: ['Manual review recommended'],
        authenticityAssessment: 'suspicious',
        confidence: 30,
      }
    }
  }

  /**
   * Get risk level from risk score
   */
  getRiskLevel(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (riskScore < 30) return 'low'
    if (riskScore < 50) return 'medium'
    if (riskScore < 75) return 'high'
    return 'critical'
  }

  /**
   * Check if tokenization should be allowed based on risk score
   */
  shouldAllowTokenization(riskScore: number, threshold: number = 70): boolean {
    return riskScore < threshold
  }
}

// Singleton instance
export const aiRiskAuditService = new AIRiskAuditService()

