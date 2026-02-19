export const SUI_DECIMALS = 9
export const MIST_PER_SUI = BigInt(1000000000)

// Network Configuration
export const NETWORK = import.meta.env.VITE_SUI_NETWORK || 'testnet'

// Token Constants
export const TOKENS = {
  SUI: {
    symbol: 'SUI',
    name: 'Sui',
    decimals: 9,
    coingeckoId: 'sui',
    type: '0x2::sui::SUI'
  },
  USDC: {
    symbol: 'USDC',
    name: 'USDC',
    decimals: 6,
    coingeckoId: 'usd-coin',
    // Mainnet Wormhole USDC. For Testnet, we usually use a faucet coin or similar.
    // This is a placeholder for Testnet - user might need to mint devnet tokens.
    type: NETWORK === 'mainnet' 
      ? '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN' 
      : '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN' // TODO: Update for Testnet
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    coingeckoId: 'tether',
    type: '0xc060006111016b8a020ad5b338349841437d1d2b::coin::COIN'
  }
}

// Contract Constants (Placeholders for now)
export const CONTRACTS = {
  STAKING_POOL: '0x...', 
  LENDING_POOL: '0x...',
  RWA_REGISTRY: '0x9cab3a40743b2ee7d6aedb268135fda191d94b14c90a9201d5a713c085b216c4'
}

// Shared Object IDs (Created post-deployment)
export const SHARED_OBJECTS = {
  LOSSLESS_POOL: '0x9e4b33a7ea21d6908d0ac29672690410af37affe9b94da75d74fbabe30690988',
  BRIDGE_CONFIG: '0xbbfd2c5e5bd134b5b4c79af93aa9fc6fac23db52f26d377bcb7e461ab3cf1b2a'
}

export const EXPLORER_URL = NETWORK === 'mainnet' 
  ? 'https://suiscan.xyz/mainnet' 
  : 'https://suiscan.xyz/testnet'
