/**
 * Auto-Stake Agent Settings Modal
 */

import { useState } from 'react'
import { useAutoStakeStore } from '../../stores/auto-stake-store'
import { showNotification } from '../ui/Notification'

interface AutoStakeSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export default function AutoStakeSettings({ isOpen, onClose }: AutoStakeSettingsProps) {
  const {
    threshold,
    interval,
    validatorStrategy,
    preferredValidators,
    maxStakePerDay,
    maxTotalStaked,
    updateSettings,
  } = useAutoStakeStore()

  const [localThreshold, setLocalThreshold] = useState(threshold.toString())
  const [localInterval, setLocalInterval] = useState(interval.toString())
  const [localStrategy, setLocalStrategy] = useState(validatorStrategy)
  const [localMaxPerDay, setLocalMaxPerDay] = useState(maxStakePerDay.toString())
  const [localMaxTotal, setLocalMaxTotal] = useState(maxTotalStaked.toString())
  const [localPreferred, setLocalPreferred] = useState(preferredValidators.join(', '))

  if (!isOpen) return null

  const handleSave = () => {
    const newThreshold = parseFloat(localThreshold)
    const newInterval = parseInt(localInterval)
    const newMaxPerDay = parseFloat(localMaxPerDay)
    const newMaxTotal = parseFloat(localMaxTotal)
    const newPreferred = localPreferred
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0)

    // Validation
    if (isNaN(newThreshold) || newThreshold < 1) {
      showNotification({
        type: 'error',
        title: 'Invalid Threshold',
        message: 'Threshold must be at least 1 CSPR',
      })
      return
    }

    if (isNaN(newInterval) || newInterval < 1 || newInterval > 60) {
      showNotification({
        type: 'error',
        title: 'Invalid Interval',
        message: 'Interval must be between 1 and 60 minutes',
      })
      return
    }

    if (isNaN(newMaxPerDay) || newMaxPerDay < newThreshold) {
      showNotification({
        type: 'error',
        title: 'Invalid Max Per Day',
        message: `Max per day must be at least ${newThreshold} CSPR`,
      })
      return
    }

    if (isNaN(newMaxTotal) || newMaxTotal < newMaxPerDay) {
      showNotification({
        type: 'error',
        title: 'Invalid Max Total',
        message: `Max total must be at least ${newMaxPerDay} CSPR`,
      })
      return
    }

    updateSettings({
      threshold: newThreshold,
      interval: newInterval,
      validatorStrategy: localStrategy,
      preferredValidators: newPreferred,
      maxStakePerDay: newMaxPerDay,
      maxTotalStaked: newMaxTotal,
    })

    showNotification({
      type: 'success',
      title: 'Settings Saved',
      message: 'Auto-stake agent settings have been updated',
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-100">Auto-Stake Agent Settings</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Threshold */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Minimum Balance to Stake (CSPR)
            </label>
            <input
              type="number"
              value={localThreshold}
              onChange={(e) => setLocalThreshold(e.target.value)}
              min="1"
              step="0.1"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Agent will only stake when balance exceeds this amount
            </p>
          </div>

          {/* Interval */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Check Interval (minutes)
            </label>
            <input
              type="number"
              value={localInterval}
              onChange={(e) => setLocalInterval(e.target.value)}
              min="1"
              max="60"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              How often to check for staking opportunities
            </p>
          </div>

          {/* Validator Strategy */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Validator Selection Strategy
            </label>
            <select
              value={localStrategy}
              onChange={(e) => setLocalStrategy(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="best-apy">Best APY (Automatic)</option>
              <option value="preferred">Preferred Validators</option>
              <option value="random">Random Selection</option>
            </select>
          </div>

          {/* Preferred Validators (if strategy is preferred) */}
          {localStrategy === 'preferred' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Preferred Validators (comma-separated public keys)
              </label>
              <textarea
                value={localPreferred}
                onChange={(e) => setLocalPreferred(e.target.value)}
                placeholder="01abc..., 02def..."
                rows={3}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-xs"
              />
            </div>
          )}

          {/* Max Per Day */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Max Stake Per Day (CSPR)
            </label>
            <input
              type="number"
              value={localMaxPerDay}
              onChange={(e) => setLocalMaxPerDay(e.target.value)}
              min={threshold}
              step="10"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <p className="text-xs text-slate-400 mt-1">Safety limit per day</p>
          </div>

          {/* Max Total */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Max Total Staked (CSPR)
            </label>
            <input
              type="number"
              value={localMaxTotal}
              onChange={(e) => setLocalMaxTotal(e.target.value)}
              min={maxStakePerDay}
              step="100"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <p className="text-xs text-slate-400 mt-1">Maximum total staked amount</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 rounded-lg text-white font-semibold transition-all"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}

