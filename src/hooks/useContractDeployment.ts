/**
 * React hook for Contract Deployment
 */

import { useState, useCallback } from 'react'
import { useWallet } from '../blockchain/WalletProvider'
import { contractDeploymentService } from '../services/contract-deployment'
import { showNotification } from '../components/ui/Notification'
import type { DeploymentRequest, DeploymentResult } from '../types/contract-templates'

export function useContractDeployment() {
  const { publicKey, signAndExecute } = useWallet()
  const [loading, setLoading] = useState(false)
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null)

  const deployContract = useCallback(
    async (request: DeploymentRequest) => {
      if (!publicKey || !signAndExecute) {
        showNotification({
          type: 'error',
          title: 'Wallet Required',
          message: 'Please connect your wallet to deploy contracts',
        })
        return null
      }

      setLoading(true)
      setDeploymentResult(null)

      try {
        const result = await contractDeploymentService.deployContract(
          request,
          publicKey,
          signAndExecute
        )

        setDeploymentResult(result)

        if (result.success) {
          showNotification({
            type: 'success',
            title: 'Contract Deployed',
            message: `Transaction: ${result.transactionHash?.slice(0, 16)}...`,
            duration: 5000,
          })
        } else {
          showNotification({
            type: 'error',
            title: 'Deployment Failed',
            message: result.error || 'Unknown error',
          })
        }

        return result
      } catch (error) {
        console.error('Deployment error:', error)
        const errorResult: DeploymentResult = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
        setDeploymentResult(errorResult)

        showNotification({
          type: 'error',
          title: 'Deployment Error',
          message: error instanceof Error ? error.message : 'Unknown error',
        })

        return errorResult
      } finally {
        setLoading(false)
      }
    },
    [publicKey, signAndExecute]
  )

  const checkStatus = useCallback(async (deployHash: string) => {
    return await contractDeploymentService.checkDeploymentStatus(deployHash)
  }, [])

  return {
    deployContract,
    checkStatus,
    loading,
    deploymentResult,
  }
}
