/**
 * Comprehensive Portfolio View using Sui Data Service
 * Shows account balance, stakes, and objects
 */

import { useState, useEffect } from 'react'
import { useWallet } from '../../blockchain/WalletProvider'
import { suiDataService } from '../../services/sui-data-service'
import RealtimeIndicator from '../common/RealtimeIndicator'

export default function PortfolioView() {
  const { publicKey, isConnected } = useWallet()
  const [portfolio, setPortfolio] = useState<any>(null)
  const [suiRate, setSuiRate] = useState<any>(null)
  const [balance, setBalance] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isConnected || !publicKey) return

    const loadData = async () => {
      setIsLoading(true)
      try {
        // Load Portfolio (Balance + Stakes)
        const port = await suiDataService.getPortfolio(publicKey)
        setPortfolio(port)
        setBalance(port.balance)

        // Load SUI Rate
        const rate = await suiDataService.getSuiRate('usd')
        setSuiRate(rate)
      } catch (err) {
        console.error('Error loading portfolio:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [isConnected, publicKey])

  if (!isConnected || !publicKey) {
    return (
      <div className="p-6 text-center text-slate-400">
        Connect your wallet to view portfolio
      </div>
    )
  }

  if (isLoading && !portfolio) {
    return (
      <div className="p-6 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        Loading portfolio...
      </div>
    )
  }

  const balanceSUI = balance
  const balanceUSD = suiRate?.rate ? balanceSUI * suiRate.rate : null

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-100">💰 Portfolio Overview</h2>
          <RealtimeIndicator isActive={true} />
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border border-cyan-500/20 rounded-xl p-6 mb-4">
          <div className="text-sm text-slate-400 mb-2">Available Balance</div>
          <div className="text-3xl font-bold text-cyan-400 mb-1">
            {balanceSUI.toFixed(4)} SUI
          </div>
          {balanceUSD && (
            <div className="text-lg text-slate-300">
              ${balanceUSD.toFixed(2)} USD
            </div>
          )}
        </div>

        {/* Delegations / Stakes */}
        {portfolio?.active_stakes && portfolio.active_stakes.length > 0 && (
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 mb-4">
            <div className="text-sm font-semibold text-slate-300 mb-3">Active Stakes</div>
            <div className="space-y-2">
              {portfolio.active_stakes.map((stakeObj: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-slate-900/50 rounded-lg">
                  <div>
                    <div className="text-xs text-slate-400">Validator</div>
                    <div className="text-sm text-slate-200 font-mono">
                      {stakeObj.validatorAddress?.slice(0, 20)}...
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-cyan-400">
                      {stakeObj.stakes.map((s: any) => Number(s.principal) / 1e9).reduce((a: number, b: number) => a + b, 0).toFixed(2)} SUI
                    </div>
                    {/* Rewards are simpler in SUI (usually compounded or tracked differently) */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
