/**
 * Auto-Stake Agent Toggle Component
 * Top-right toggle for enabling/disabling auto-stake agent
 */

import { useState } from 'react'
import { useAutoStakeStore } from '../../stores/auto-stake-store'
import { useGamificationStore } from '../../stores/gamification-store'
import { useWallet } from '../../blockchain/WalletProvider'
import { useAutoStakeAgent } from '../../hooks/useAutoStakeAgent'
import AutoStakeSettings from './AutoStakeSettings'
import { showNotification } from '../ui/Notification'
import Tooltip from '../ui/Tooltip'
import { playSound } from '../../utils/sound-effects'
import confetti from 'canvas-confetti'

export default function AutoStakeToggle() {
  const { isConnected, publicKey } = useWallet()
  const { enabled, status, pendingStakeAmount, pendingValidator, updateSettings, setStatus } = useAutoStakeStore()
  const { executePendingStake } = useAutoStakeAgent()
  const { awardPoints } = useGamificationStore()
  const [showSettings, setShowSettings] = useState(false)

  // Don't show if wallet not connected
  if (!isConnected || !publicKey) return null

  const handleToggle = () => {
    const newEnabled = !enabled
    updateSettings({ enabled: newEnabled })

    if (newEnabled) {
      playSound('success')
      confetti({ particleCount: 30, spread: 50, origin: { x: 0.9, y: 0.1 } })
      setStatus('monitoring')
      showNotification({
        type: 'success',
        title: '🤖 Agent Activated',
        message: 'I am now watching your metrics.',
        sound: 'epic'
      })
      awardPoints('earn', 50) // Award points for enabling agent
    } else {
      playSound('click')
      setStatus('idle')
      showNotification({
        type: 'info',
        title: 'Agent Sleeping',
        message: 'Monitoring paused.',
      })
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'monitoring':
        return 'bg-green-500/20 border-green-500/50'
      case 'ready':
        return 'bg-cyan-500/20 border-cyan-500/50 animate-pulse'
      case 'executing':
        return 'bg-yellow-500/20 border-yellow-500/50'
      case 'error':
        return 'bg-red-500/20 border-red-500/50'
      default:
        return 'bg-slate-800/50 border-slate-700/50'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'monitoring':
        return 'Monitoring'
      case 'ready':
        return `Ready: ${pendingStakeAmount?.toFixed(2)} CSPR`
      case 'executing':
        return 'Executing...'
      case 'error':
        return 'Error'
      default:
        return 'Idle'
    }
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center gap-2">
          {/* Status indicator */}
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${getStatusColor()} text-slate-200`}>
            {getStatusText()}
          </div>

          {/* Toggle button */}
          <Tooltip
            content={
              enabled
                ? 'Click to disable automatic staking'
                : 'Click to enable automatic staking'
            }
            position="bottom"
          >
            <button
              onClick={handleToggle}
              className={[
                'w-14 h-14 rounded-full flex items-center justify-center text-2xl',
                'border-2 transition-all duration-300 hover:scale-110 active:scale-95',
                enabled
                  ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-pulse-slow'
                  : 'bg-slate-800 border-slate-600 grayscale opacity-80 hover:opacity-100 hover:grayscale-0',
              ].join(' ')}
              aria-label={enabled ? 'Disable Auto-Stake Agent' : 'Enable Auto-Stake Agent'}
            >
              {enabled ? '🤖' : '💀'}
            </button>
          </Tooltip>

          {/* Pending stake action button */}
          {status === 'ready' && pendingStakeAmount && pendingValidator && (
            <Tooltip content="Click to execute pending stake" position="bottom">
              <button
                onClick={executePendingStake}
                className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 rounded-lg text-white text-xs font-semibold transition-all shadow-lg shadow-cyan-500/20 animate-pulse"
              >
                Stake {pendingStakeAmount.toFixed(2)} CSPR
              </button>
            </Tooltip>
          )}

          {/* Settings button */}
          <Tooltip content="Agent Settings" position="bottom">
            <button
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-slate-200"
              aria-label="Open Auto-Stake Settings"
            >
              ⚙️
            </button>
          </Tooltip>
        </div>
      </div>

      <AutoStakeSettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  )
}

