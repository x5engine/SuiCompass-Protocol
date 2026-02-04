/**
 * Validator Performance Component
 * Shows validator metrics and APY using Sui Data Service
 */

import { useState, useEffect } from 'react'
import { suiDataService } from '../../services/sui-data-service'

interface ValidatorPerformanceProps {
  publicKey?: string
  showList?: boolean
}

export default function ValidatorPerformance({ publicKey, showList = false }: ValidatorPerformanceProps) {
  const [validators, setValidators] = useState<any[]>([])
  const [selectedValidator, setSelectedValidator] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (publicKey) {
      loadValidatorData(publicKey)
    } else if (showList) {
      loadValidators()
    }
  }, [publicKey, showList])

  const loadValidators = async () => {
    setLoading(true)
    try {
      const data = await suiDataService.getValidators()
      setValidators(data.validators)
    } catch (error) {
      console.error('Error loading validators:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadValidatorData = async (validatorKey: string) => {
    setLoading(true)
    try {
      const data = await suiDataService.getValidator(validatorKey)
      setSelectedValidator(data)
    } catch (error) {
      console.error('Error loading validator data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !validators.length && !selectedValidator) {
    return (
      <div className="p-6 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        Loading validators...
      </div>
    )
  }

  if (showList) {
    return (
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-100 mb-4">⭐ Sui Validators</h2>
        <div className="space-y-3">
          {validators.slice(0, 10).map((validator, idx) => (
            <div
              key={idx}
              className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 hover:border-cyan-500/50 transition-colors cursor-pointer"
              onClick={() => loadValidatorData(validator.public_key)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-200 mb-1">
                    #{idx + 1} {validator.name || 'Validator'}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {validator.public_key?.slice(0, 24)}...
                  </div>
                </div>
                <div className="text-right">
                  {/* APY is simplified/mocked in data service currently, standard is ~3-4% */}
                  <div className="text-lg font-bold text-cyan-400">
                    ~3.5% APY
                  </div>
                  <div className="text-xs text-slate-400">
                    {(Number(validator.stake) / 1e9).toFixed(0)} SUI staked
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (selectedValidator) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-100">Validator Details</h2>
          <button
            onClick={() => setSelectedValidator(null)}
            className="text-slate-400 hover:text-slate-200"
          >
            ← Back
          </button>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
          <div className="text-sm text-slate-400 mb-2">Address</div>
          <div className="text-sm text-slate-200 font-mono break-all">
            {selectedValidator.public_key}
          </div>
          <div className="mt-2 text-sm text-slate-400 mb-2">Name</div>
          <div className="text-lg text-slate-200">
            {selectedValidator.name}
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border border-cyan-500/20 rounded-xl p-4">
          <div className="text-sm text-slate-400 mb-1">Estimated APY</div>
          <div className="text-3xl font-bold text-cyan-400">
            ~3.5%
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 text-center text-slate-400">
      Select a validator to view details
    </div>
  )
}
