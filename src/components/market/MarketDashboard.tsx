/**
 * Market Data Dashboard
 * Shows SUI rates and supply
 */

import { useState, useEffect } from 'react'
import { suiDataService } from '../../services/sui-data-service'

export default function MarketDashboard() {
  const [suiRate, setSuiRate] = useState<any>(null)
  const [supply, setSupply] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [rate, supplyData] = await Promise.all([
          suiDataService.getSuiRate('usd'),
          suiDataService.getSuiSupply(),
        ])
        setSuiRate(rate)
        setSupply(supplyData)
      } catch (error) {
        console.error('Error loading market data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading && !suiRate) {
    return (
      <div className="p-6 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        Loading market data...
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-slate-100 mb-4">📈 Market Data</h2>

      {/* SUI Rate */}
      {suiRate && (
        <div className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border border-cyan-500/20 rounded-xl p-6">
          <div className="text-sm text-slate-400 mb-2">SUI Price</div>
          <div className="text-3xl font-bold text-cyan-400 mb-1">
            ${suiRate.rate ? Number(suiRate.rate).toFixed(4) : 'N/A'}
          </div>
        </div>
      )}

      {/* Supply Info */}
      {supply && (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-3">
          <div className="text-sm font-semibold text-slate-300 mb-2">SUI Supply</div>
          {supply.total && (
            <div className="flex justify-between">
              <span className="text-slate-400">Total Supply</span>
              <span className="text-slate-200 font-mono">
                {Number(supply.total).toLocaleString()} SUI
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
