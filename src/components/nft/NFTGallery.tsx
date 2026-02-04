/**
 * NFT Gallery Component
 * Browse NFTs using Sui Data Service
 */

import { useState, useEffect } from 'react'
import { useWallet } from '../../blockchain/WalletProvider'
import { suiDataService } from '../../services/sui-data-service'

export default function NFTGallery() {
  const { publicKey, isConnected } = useWallet()
  const [nfts, setNfts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isConnected || !publicKey) return

    const loadNFTs = async () => {
      setLoading(true)
      try {
        // Simplified: Fetch portfolio objects
        await suiDataService.getPortfolio(publicKey)
        // Filter for displayable objects (simplified logic)
        // For now, empty array as getPortfolio doesn't return NFTs yet
        setNfts([])
      } catch (error) {
        console.error('Error loading NFTs:', error)
      } finally {
        setLoading(false)
      }
    }

    loadNFTs()
  }, [isConnected, publicKey])

  if (!isConnected || !publicKey) {
    return (
      <div className="p-6 text-center text-slate-400">
        Connect your wallet to view NFTs
      </div>
    )
  }

  if (loading && !nfts.length) {
    return (
      <div className="p-6 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        Loading NFTs...
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold text-slate-100 mb-4">🖼️ NFT Gallery</h2>

      {nfts.length === 0 ? (
        <div className="text-center text-slate-400 py-8">
          No NFTs found
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nfts.map((nft: any, idx: number) => (
            <div
              key={idx}
              className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 hover:border-cyan-500/50 transition-colors"
            >
              <div className="text-sm font-semibold text-slate-200 mb-1">
                Object
              </div>
              <div className="text-xs text-slate-400">
                {nft.digest?.slice(0, 12)}...
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
