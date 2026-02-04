/**
 * Transfer History Component
 * Shows transaction history using Sui Data Service
 */

import { useState, useEffect } from 'react'
import { useWallet } from '../../blockchain/WalletProvider'
import { suiDataService } from '../../services/sui-data-service'
import RealtimeIndicator from '../common/RealtimeIndicator'

export default function TransferHistory() {
  const { publicKey, isConnected } = useWallet()
  const [transfers, setTransfers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isConnected || !publicKey) return

    const loadTransfers = async () => {
      setLoading(true)
      try {
        const data = await suiDataService.getAccountTransactions(publicKey)
        setTransfers(data || [])
      } catch (error) {
        console.error('Error loading transfers:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTransfers()
  }, [isConnected, publicKey])

  if (!isConnected || !publicKey) {
    return (
      <div className="p-6 text-center text-slate-400">
        Connect your wallet to view transfer history
      </div>
    )
  }

  if (loading && !transfers.length) {
    return (
      <div className="p-6 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        Loading transfers...
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-100">📜 Transaction History</h2>
        <RealtimeIndicator isActive={true} />
      </div>

      {transfers.length === 0 ? (
        <div className="text-center text-slate-400 py-8">
          No transfers found
        </div>
      ) : (
        <div className="space-y-2">
          {transfers.map((tx: any, idx: number) => (
            <div
              key={idx}
              className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 hover:border-cyan-500/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-200 mb-1">
                    Transaction
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {tx.digest?.slice(0, 16)}...
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">
                    {tx.timestampMs ? new Date(Number(tx.timestampMs)).toLocaleDateString() : ''}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
