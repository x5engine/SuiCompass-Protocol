/**
 * Sui Name Resolution Component
 * Resolve SuiNS names to address
 */

import { useState } from 'react'
import { suiDataService } from '../../services/sui-data-service'

export default function CSPRNameResolver() {
  const [name, setName] = useState('')
  const [resolved, setResolved] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleResolve = async () => {
    if (!name.trim()) return

    setError(null)
    setResolved(null)
    setLoading(true)

    try {
      const address = await suiDataService.resolveSuiName(name.trim())
      if (address) {
        setResolved(address)
      } else {
        setError('Name not found')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resolve name')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold text-slate-100 mb-4">🔍 SuiNS Resolver</h2>

      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-2">Sui Name</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., alice.sui"
              className="flex-1 px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              onKeyPress={(e) => e.key === 'Enter' && handleResolve()}
            />
            <button
              onClick={handleResolve}
              disabled={loading || !name.trim()}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {loading ? 'Resolving...' : 'Resolve'}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        {resolved && (
          <div className="p-4 bg-slate-900/50 rounded-lg space-y-3">
            <div>
              <div className="text-sm text-slate-400 mb-1">Address</div>
              <div className="text-sm text-slate-200 font-mono break-all">
                {resolved}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-xs text-slate-500 mt-4">
        <p>💡 Tip: Enter a SuiNS name (e.g., "alice.sui") to resolve it to an address</p>
      </div>
    </div>
  )
}
