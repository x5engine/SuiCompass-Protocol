/**
 * Risk Audit Results Component
 * Displays AI risk audit results for RWA tokenization
 */

import type { RiskAuditResult } from '../../types/rwa-audit'
import { aiRiskAuditService } from '../../services/ai-risk-audit'

interface RiskAuditResultsProps {
  auditResult: RiskAuditResult
  onProceed?: () => void
  onCancel?: () => void
  riskThreshold?: number
}

export default function RiskAuditResults({
  auditResult,
  onProceed,
  onCancel,
  riskThreshold = 70,
}: RiskAuditResultsProps) {
  const riskLevel = aiRiskAuditService.getRiskLevel(auditResult.riskScore)
  const shouldProceed = aiRiskAuditService.shouldAllowTokenization(auditResult.riskScore, riskThreshold)

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-500/20 text-green-300 border-green-500/50'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/50'
      case 'critical':
        return 'bg-red-500/20 text-red-300 border-red-500/50'
    }
  }

  const getAuthenticityColor = () => {
    switch (auditResult.authenticityAssessment) {
      case 'authentic':
        return 'text-green-400'
      case 'suspicious':
        return 'text-yellow-400'
      case 'fraudulent':
        return 'text-red-400'
    }
  }

  return (
    <div className="space-y-4">
      {/* Risk Score Card */}
      <div className={`border rounded-xl p-6 ${getRiskColor()}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-slate-400 mb-1">Risk Assessment</div>
            <div className="text-3xl font-bold">{auditResult.riskScore}/100</div>
            <div className="text-sm mt-1">Level: {riskLevel.toUpperCase()}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400 mb-1">Authenticity</div>
            <div className={`text-lg font-semibold ${getAuthenticityColor()}`}>
              {auditResult.authenticityAssessment.toUpperCase()}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Confidence: {auditResult.confidence}%
            </div>
          </div>
        </div>

        {!shouldProceed && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <div className="text-sm font-medium text-red-300">
              ⚠️ Tokenization Blocked
            </div>
            <div className="text-xs text-red-200 mt-1">
              Risk score exceeds safety threshold ({riskThreshold})
            </div>
          </div>
        )}
      </div>

      {/* Risk Factors */}
      {auditResult.riskFactors.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="text-sm font-semibold text-slate-300 mb-3">Risk Factors</div>
          <div className="space-y-2">
            {auditResult.riskFactors.map((factor, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  factor.severity === 'critical'
                    ? 'bg-red-500/10 border-red-500/30'
                    : factor.severity === 'high'
                    ? 'bg-orange-500/10 border-orange-500/30'
                    : factor.severity === 'medium'
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-slate-700/50 border-slate-600/30'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="text-sm font-medium text-slate-200 capitalize">
                    {factor.type.replace('_', ' ')}
                  </div>
                  <div
                    className={`text-xs px-2 py-0.5 rounded ${
                      factor.severity === 'critical'
                        ? 'bg-red-500/20 text-red-300'
                        : factor.severity === 'high'
                        ? 'bg-orange-500/20 text-orange-300'
                        : factor.severity === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-slate-600 text-slate-300'
                    }`}
                  >
                    {factor.severity}
                  </div>
                </div>
                <div className="text-xs text-slate-400">{factor.description}</div>
                <div className="text-xs text-slate-500 mt-1">Impact: {factor.impact}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {auditResult.recommendations.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="text-sm font-semibold text-slate-300 mb-3">Recommendations</div>
          <ul className="space-y-2">
            {auditResult.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 transition-colors"
          >
            Cancel
          </button>
        )}
        {onProceed && shouldProceed && (
          <button
            onClick={onProceed}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 rounded-lg text-white font-semibold transition-all"
          >
            Proceed with Tokenization
          </button>
        )}
        {!shouldProceed && (
          <div className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-400 text-center">
            Tokenization Blocked
          </div>
        )}
      </div>
    </div>
  )
}

