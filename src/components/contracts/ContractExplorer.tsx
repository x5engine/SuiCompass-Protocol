/**
 * Contract Package Explorer
 * Browse and explore contract packages using Sui Data Service
 * Currently displays standard packages or user's packages
 */

import { useState, useEffect } from 'react'
import { useWallet } from '../../blockchain/WalletProvider'
import { suiDataService } from '../../services/sui-data-service'

export default function ContractExplorer() {
  const { publicKey, isConnected } = useWallet()
  const [contracts, setContracts] = useState<any[]>([])

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isConnected || !publicKey) return

    const loadContracts = async () => {
      setLoading(true)
      try {
        // For Sui, we fetch owned objects that are packages or upgrades
        // Simplified: getting objects
        await suiDataService.getPortfolio(publicKey)
        // Filter or map to 'contracts' mock
        // In real Sui app, we'd query for Move packages
        setContracts([]) // Placeholder until package query implemented
      } catch (error) {
        console.error('Error loading contracts:', error)
      } finally {
        setLoading(false)
      }
    }

    loadContracts()
  }, [isConnected, publicKey])

  if (!isConnected || !publicKey) {
    return (
      <div className="p-6 text-center text-slate-400">
        Connect your wallet to view contract packages
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        Loading contracts...
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold text-slate-100 mb-4">📦 Sui Packages</h2>

      {contracts.length === 0 ? (
        <div className="text-center text-slate-400 py-8">
          No packages found
        </div>
      ) : (
        <div className="space-y-2">
          {/* Contracts list would go here */}
        </div>
      )}
    </div>
  )
}
