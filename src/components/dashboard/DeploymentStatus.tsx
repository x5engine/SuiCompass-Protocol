/**
 * Deployment Status Component
 * Shows deployment progress and results
 */

import { useEffect, useState } from 'react'
import { contractDeploymentService } from '../../services/contract-deployment'
import type { DeploymentResult } from '../../types/contract-templates'

interface DeploymentStatusProps {
  deploymentResult: DeploymentResult
  onComplete?: () => void
}

export default function DeploymentStatus({ deploymentResult, onComplete }: DeploymentStatusProps) {
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending')
  const [contractHash, setContractHash] = useState<string | undefined>()

  useEffect(() => {
    if (deploymentResult.success && deploymentResult.deployHash) {
      // Poll for deployment status
      const checkStatus = async () => {
        const result = await contractDeploymentService.checkDeploymentStatus(
          deploymentResult.deployHash!
        )

        setStatus(result.status)
        if (result.contractHash) {
          setContractHash(result.contractHash)
          if (onComplete) onComplete()
        } else if (result.status === 'failed') {
          if (onComplete) onComplete()
        }
      }

      // Check immediately
      checkStatus()

      // Then poll every 5 seconds
      const interval = setInterval(checkStatus, 5000)

      return () => clearInterval(interval)
    } else if (!deploymentResult.success) {
      setStatus('failed')
    }
  }, [deploymentResult, onComplete])

  if (deploymentResult.success && deploymentResult.transactionHash) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          {status === 'pending' && (
            <>
              <div className="animate-spin text-cyan-400">⏳</div>
              <div className="text-lg font-semibold text-slate-200">Deployment Pending</div>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="text-green-400 text-2xl">✅</div>
              <div className="text-lg font-semibold text-green-300">Deployment Successful</div>
            </>
          )}
          {status === 'failed' && (
            <>
              <div className="text-red-400 text-2xl">❌</div>
              <div className="text-lg font-semibold text-red-300">Deployment Failed</div>
            </>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-sm text-slate-400 mb-1">Transaction Hash</div>
            <div className="flex items-center gap-2">
              <code className="text-cyan-400 font-mono text-sm">
                {deploymentResult.transactionHash}
              </code>
              <a
                href={`https://testnet.cspr.live/transaction/${deploymentResult.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300"
              >
                View →
              </a>
            </div>
          </div>

          {contractHash && (
            <div>
              <div className="text-sm text-slate-400 mb-1">Contract Hash</div>
              <code className="text-cyan-400 font-mono text-sm">{contractHash}</code>
            </div>
          )}

          {deploymentResult.estimatedGas && (
            <div>
              <div className="text-sm text-slate-400 mb-1">Estimated Gas</div>
              <div className="text-slate-200">
                {(deploymentResult.estimatedGas / 1e9).toFixed(4)} CSPR
              </div>
            </div>
          )}

          {status === 'pending' && (
            <div className="text-sm text-slate-400 mt-4">
              Waiting for block inclusion... This may take 30-60 seconds.
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!deploymentResult.success) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-red-400 text-2xl">❌</div>
          <div className="text-lg font-semibold text-red-300">Deployment Failed</div>
        </div>
        <div className="text-slate-200">{deploymentResult.error}</div>
      </div>
    )
  }

  return null
}

