/**
 * Agent Activity Dashboard Tab
 * Shows auto-stake agent status, history, and statistics
 */

import { useAutoStakeStore } from '../../stores/auto-stake-store'
import { useAutoStakeAgent } from '../../hooks/useAutoStakeAgent'
import { formatDistanceToNow } from 'date-fns'

export default function AgentActivity() {
  const {
    enabled,
    status,
    threshold,
    interval,
    validatorStrategy,
    maxStakePerDay,
    totalStakedToday,
    lastStakeTime,
    pendingStakeAmount,
    pendingValidator,
    actions,
    updateSettings,
    resetDailyStats,
  } = useAutoStakeStore()

  const { executePendingStake } = useAutoStakeAgent()

  const getStatusColor = () => {
    switch (status) {
      case 'monitoring':
        return 'bg-green-500/20 text-green-300 border-green-500/50'
      case 'ready':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
      case 'executing':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
      case 'error':
        return 'bg-red-500/20 text-red-300 border-red-500/50'
      default:
        return 'bg-slate-800/50 text-slate-300 border-slate-700/50'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'monitoring':
        return '👀'
      case 'ready':
        return '✅'
      case 'executing':
        return '⚙️'
      case 'error':
        return '❌'
      default:
        return '💤'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-100">Auto-Stake Agent</h2>
        <button
          onClick={() => updateSettings({ enabled: !enabled })}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            enabled
              ? 'bg-red-500/20 text-red-300 border border-red-500/50 hover:bg-red-500/30'
              : 'bg-green-500/20 text-green-300 border border-green-500/50 hover:bg-green-500/30'
          }`}
        >
          {enabled ? 'Disable Agent' : 'Enable Agent'}
        </button>
      </div>

      {/* Status Card */}
      <div className={`border rounded-xl p-6 ${getStatusColor()}`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{getStatusIcon()}</span>
          <div>
            <div className="text-lg font-semibold">Status: {status.toUpperCase()}</div>
            <div className="text-sm opacity-80">
              {enabled ? 'Agent is active' : 'Agent is disabled'}
            </div>
          </div>
        </div>

        {pendingStakeAmount && pendingValidator && (
          <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-cyan-500/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-1">Ready to Stake</div>
                <div className="text-xl font-bold text-cyan-300">
                  {pendingStakeAmount.toFixed(2)} CSPR
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Validator: {pendingValidator.slice(0, 20)}...
                </div>
              </div>
              <button
                onClick={executePendingStake}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 rounded-lg text-white font-semibold transition-all"
              >
                Execute Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="text-sm text-slate-400 mb-1">Staked Today</div>
          <div className="text-2xl font-bold text-slate-100">
            {totalStakedToday.toFixed(2)} CSPR
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Max: {maxStakePerDay} CSPR/day
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="text-sm text-slate-400 mb-1">Last Stake</div>
          <div className="text-2xl font-bold text-slate-100">
            {lastStakeTime
              ? formatDistanceToNow(lastStakeTime, { addSuffix: true })
              : 'Never'}
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="text-sm text-slate-400 mb-1">Check Interval</div>
          <div className="text-2xl font-bold text-slate-100">{interval} min</div>
          <div className="text-xs text-slate-500 mt-1">
            Threshold: {threshold} CSPR
          </div>
        </div>
      </div>

      {/* Settings Summary */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <div className="text-sm font-semibold text-slate-300 mb-3">Current Settings</div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-slate-400">Strategy:</span>{' '}
            <span className="text-slate-200">
              {validatorStrategy === 'best-apy'
                ? 'Best APY'
                : validatorStrategy === 'preferred'
                ? 'Preferred'
                : 'Random'}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Threshold:</span>{' '}
            <span className="text-slate-200">{threshold} CSPR</span>
          </div>
        </div>
      </div>

      {/* Action History */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-slate-300">Recent Actions</div>
          {actions.length > 0 && (
            <button
              onClick={resetDailyStats}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Reset Stats
            </button>
          )}
        </div>

        {actions.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <div className="text-4xl mb-2">📭</div>
            <div>No actions yet</div>
            <div className="text-xs mt-1">Agent actions will appear here</div>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {actions.map((action) => (
              <div
                key={action.id}
                className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/30"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {action.type === 'stake' ? '💰' : action.type === 'unstake' ? '📤' : '🎁'}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-slate-200">
                        {action.type === 'stake'
                          ? `Staked ${action.amount.toFixed(2)} CSPR`
                          : action.type === 'unstake'
                          ? `Unstaked ${action.amount.toFixed(2)} CSPR`
                          : `Claimed rewards`}
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatDistanceToNow(action.timestamp, { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-xs px-2 py-1 rounded ${
                      action.status === 'executed'
                        ? 'bg-green-500/20 text-green-300'
                        : action.status === 'failed'
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}
                  >
                    {action.status}
                  </div>
                  {action.transactionHash && (
                    <a
                      href={`https://testnet.cspr.live/transaction/${action.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-400 hover:text-cyan-300 mt-1 block"
                    >
                      View TX
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

