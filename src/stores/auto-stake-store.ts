/**
 * Auto-Stake Agent State Management
 * Uses Zustand for state management with localStorage persistence
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AutoStakeSettings, AutoStakeState, AutoStakeAction } from '../types/auto-stake'

interface AutoStakeStore extends AutoStakeState {
  actions: AutoStakeAction[]
  
  // Actions
  updateSettings: (settings: Partial<AutoStakeSettings>) => void
  setStatus: (status: AutoStakeState['status']) => void
  setError: (error: string | null) => void
  setPendingStake: (amount: number, validator: string) => void
  clearPendingStake: () => void
  recordStake: (amount: number, validator: string, transactionHash: string) => void
  resetDailyStats: () => void
  addAction: (action: Omit<AutoStakeAction, 'id' | 'timestamp'>) => void
  clearActions: () => void
  setLastCheckedBalance: (balance: bigint) => void
}

const defaultSettings: AutoStakeSettings = {
  enabled: false,
  threshold: 10, // 10 SUI minimum
  interval: 5, // 5 minutes
  validatorStrategy: 'best-apy',
  preferredValidators: [],
  maxStakePerDay: 1000, // 1000 SUI per day max
  maxTotalStaked: 10000, // 10000 SUI total max
}

export const useAutoStakeStore = create<AutoStakeStore>()(
  persist(
    (set, get) => ({
      ...defaultSettings,
      lastStakeTime: null,
      totalStakedToday: 0,
      lastCheckedBalance: BigInt(0),
      pendingStakeAmount: null,
      pendingValidator: null,
      status: 'idle',
      error: null,
      actions: [],

      updateSettings: (settings) => {
        set((state) => {
          const newSettings = { ...state, ...settings }
          // Reset daily stats if threshold or max limits changed
          if (settings.threshold !== undefined || settings.maxStakePerDay !== undefined) {
            return { ...newSettings, totalStakedToday: 0, lastStakeTime: null }
          }
          return newSettings
        })
      },

      setStatus: (status) => {
        set({ status, error: status === 'error' ? get().error : null })
      },

      setError: (error) => {
        set({ error, status: error ? 'error' : get().status })
      },

      setPendingStake: (amount, validator) => {
        set({
          pendingStakeAmount: amount,
          pendingValidator: validator,
          status: 'ready',
        })
      },

      clearPendingStake: () => {
        set({
          pendingStakeAmount: null,
          pendingValidator: null,
          status: get().enabled ? 'monitoring' : 'idle',
        })
      },

      recordStake: (amount, validator, transactionHash) => {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const lastStake = get().lastStakeTime
        const lastStakeDate = lastStake ? new Date(lastStake.getFullYear(), lastStake.getMonth(), lastStake.getDate()) : null

        set((state) => {
          // Reset daily counter if it's a new day
          const totalStakedToday = lastStakeDate && lastStakeDate.getTime() === today.getTime()
            ? state.totalStakedToday + amount
            : amount

          return {
            lastStakeTime: now,
            totalStakedToday,
            pendingStakeAmount: null,
            pendingValidator: null,
            status: state.enabled ? 'monitoring' : 'idle',
            actions: [
              {
                id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: now,
                type: 'stake',
                amount,
                validator,
                status: 'executed',
                transactionHash,
                error: null,
              },
              ...state.actions.slice(0, 49), // Keep last 50 actions
            ],
          }
        })
      },

      resetDailyStats: () => {
        set({
          totalStakedToday: 0,
          lastStakeTime: null,
        })
      },

      addAction: (action) => {
        set((state) => ({
          actions: [
            {
              ...action,
              id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: new Date(),
            },
            ...state.actions.slice(0, 49), // Keep last 50 actions
          ],
        }))
      },

      clearActions: () => {
        set({ actions: [] })
      },

      setLastCheckedBalance: (balance: bigint) => {
        set({ lastCheckedBalance: balance })
      },
    }),
    {
      name: 'suighost-auto-stake-storage',
      // Only persist settings, not runtime state
      partialize: (state) => ({
        enabled: state.enabled,
        threshold: state.threshold,
        interval: state.interval,
        validatorStrategy: state.validatorStrategy,
        preferredValidators: state.preferredValidators,
        maxStakePerDay: state.maxStakePerDay,
        maxTotalStaked: state.maxTotalStaked,
        actions: state.actions.slice(0, 20), // Persist last 20 actions
      }),
    }
  )
)

