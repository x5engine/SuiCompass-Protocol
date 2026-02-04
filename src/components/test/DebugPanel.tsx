/**
 * Test Panel Component
 * Allows testing Sui features using connected wallet
 */

import { useState } from 'react'
import { useWallet } from '../../blockchain/WalletProvider'
import { executeLiquidStake, findBestValidator } from '../../blockchain/sui-operations'
import { suiClient } from '../../blockchain/sui-client'
import { showNotification } from '../ui/Notification'

interface TestPanelProps {
  onClose?: () => void
}

export default function DebugPanel({ onClose }: TestPanelProps) {
  const { publicKey, isConnected, signAndExecute } = useWallet()
  const [loading, setLoading] = useState(false)

  // Only show content if connected, or show placeholder
  if (!isConnected || !publicKey) {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-80 bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-2xl">
        <div className="text-center py-4">
          <div className="text-4xl mb-2">🐛</div>
          <p className="text-sm text-slate-400">Connect wallet to debug</p>
        </div>
      </div>
    )
  }

  const signAndSend = async (tx: any, name: string) => {
    try {
      const result = await signAndExecute({ transactionBlock: tx })

      showNotification({
        type: 'success',
        title: `✅ ${name} Sent!`,
        message: `Digest: ${result.digest.slice(0, 16)}...`,
        sound: 'epic',
        duration: 5000,
      })

      return result.digest
    } catch (error: any) {
      console.error('Transaction failed:', error)
      showNotification({
        type: 'error',
        title: `${name} Failed`,
        message: error.message || 'Unknown error',
        sound: 'error',
      })
      throw error
    }
  }

  const testStake = async (amountSUI: number) => {
    setLoading(true)
    try {
      const validator = await findBestValidator()
      const amountMists = BigInt(amountSUI * 1e9)

      const tx = await executeLiquidStake({
        amount: amountMists,
        validatorPublicKey: validator,
      })

      await signAndSend(tx, 'Stake')
    } finally {
      setLoading(false)
    }
  }

  const testUnstake = async () => {
    setLoading(true)
    try {
      console.log("Unstake would require selecting a specific stake object ID.");
      showNotification({ type: 'info', title: 'Info', message: 'Unstaking requires a Stake Object ID. See Console.' });
    } finally {
      setLoading(false)
    }
  }

  const testGetBalance = async () => {
    if (!publicKey) return

    setLoading(true)
    try {
      const balance = await suiClient.getAccountBalance(publicKey)
      const balanceSUI = Number(balance) / 1e9

      showNotification({
        type: 'info',
        title: '💰 Balance',
        message: `${balanceSUI.toFixed(2)} SUI`,
        sound: 'success',
        duration: 5000,
      })
    } catch (error: any) {
      showNotification({
        type: 'error',
        title: 'Balance Query Failed',
        message: error.message || 'Unknown error',
        sound: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const testFindValidators = async () => {
    setLoading(true)
    try {
      const validators = await suiClient.getActiveValidators()
      showNotification({
        type: 'info',
        title: '🔍 Validators Found',
        message: `${validators.length} active validators`,
        sound: 'success',
        duration: 5000,
      })
      console.log('Validators:', validators)
    } catch (error: any) {
      showNotification({
        type: 'error',
        title: 'Validator Query Failed',
        message: error.message || 'Unknown error',
        sound: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-[#0d1117] border border-slate-700/50 rounded-xl p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200">🐛 Debug Panel</h3>
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-500">
            {publicKey ? `✅ ${publicKey.slice(0, 8)}...` : '⚠️ Not Connected'}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors text-lg leading-none w-5 h-5 flex items-center justify-center"
              title="Close"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Test Buttons */}
      <div className="space-y-2">
        <button
          onClick={testGetBalance}
          disabled={loading}
          className="w-full px-3 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors disabled:opacity-50"
        >
          💰 Get Balance
        </button>

        <button
          onClick={testFindValidators}
          disabled={loading}
          className="w-full px-3 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors disabled:opacity-50"
        >
          🔍 Find Validators
        </button>

        <button
          onClick={() => testStake(1)}
          disabled={loading || !publicKey}
          className="w-full px-3 py-2 text-xs bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          💰 Stake 1 SUI
        </button>

        <button
          onClick={() => testUnstake()}
          disabled={loading || !publicKey}
          className="w-full px-3 py-2 text-xs bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          📤 Unstake (Log)
        </button>
      </div>

      {loading && (
        <div className="mt-3 text-xs text-slate-400 text-center">⏳ Processing...</div>
      )}
    </div>
  )
}
