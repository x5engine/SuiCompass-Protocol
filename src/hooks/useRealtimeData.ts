/**
 * React hook for real-time data updates
 */

import { useEffect, useRef, useState } from 'react'
import { createRealtimeDataService, RealtimeDataConfig, RealtimeDataCallbacks } from '../services/realtime-data'

export interface UseRealtimeDataOptions extends RealtimeDataConfig {
  onBalanceUpdate?: (balance: any) => void
  onValidatorUpdate?: (validator: any) => void
  onContractUpdate?: (contract: any) => void
  onTransferUpdate?: (transfers: any[]) => void
  onError?: (error: Error) => void
}

export function useRealtimeData(options: UseRealtimeDataOptions) {
  const [isActive, setIsActive] = useState(false)
  const serviceRef = useRef<ReturnType<typeof createRealtimeDataService> | null>(null)

  useEffect(() => {
    // Don't start if disabled or no config
    if (!options.enabled || (!options.accountHash && !options.validatorPublicKey && !options.contractPackageHash)) {
      return
    }

    // Create service
    const callbacks: RealtimeDataCallbacks = {
      onBalanceUpdate: (balance) => {
        options.onBalanceUpdate?.(balance)
      },
      onValidatorUpdate: (validator) => {
        options.onValidatorUpdate?.(validator)
      },
      onContractUpdate: (contract) => {
        options.onContractUpdate?.(contract)
      },
      onTransferUpdate: (transfers) => {
        options.onTransferUpdate?.(transfers)
      },
      onError: (error) => {
        options.onError?.(error)
      },
    }

    const config: RealtimeDataConfig = {
      accountHash: options.accountHash,
      validatorPublicKey: options.validatorPublicKey,
      contractPackageHash: options.contractPackageHash,
      interval: options.interval,
      enabled: options.enabled,
    }

    const service = createRealtimeDataService(config, callbacks)
    serviceRef.current = service

    // Start service
    service.start()
    setIsActive(true)

    // Cleanup on unmount
    return () => {
      service.stop()
      setIsActive(false)
    }
  }, [
    options.accountHash,
    options.validatorPublicKey,
    options.contractPackageHash,
    options.interval,
    options.enabled,
  ])

  return {
    isActive,
    start: () => {
      serviceRef.current?.start()
      setIsActive(true)
    },
    stop: () => {
      serviceRef.current?.stop()
      setIsActive(false)
    },
    updateConfig: (config: Partial<RealtimeDataConfig>) => {
      serviceRef.current?.updateConfig(config)
    },
  }
}

