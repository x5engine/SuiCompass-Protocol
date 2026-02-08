import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NetworkType = 'mainnet' | 'testnet' | 'devnet' | 'localnet'

interface NetworkState {
  network: NetworkType
  setNetwork: (network: NetworkType) => void
}

const isProd = import.meta.env.PROD

export const useNetworkStore = create<NetworkState>()(
  persist(
    (set) => ({
      // Default to Mainnet in Prod, Testnet in Dev
      network: isProd ? 'mainnet' : (import.meta.env.VITE_SUI_NETWORK as NetworkType || 'testnet'),
      
      setNetwork: (network) => {
        if (isProd && network !== 'mainnet') {
           console.warn("Cannot switch network in production");
           return;
        }
        set({ network });
        // In a real app, we might need to reload window or reset clients here
        // window.location.reload(); 
      }
    }),
    {
      name: 'sui-network-storage',
    }
  )
)
