export const CASPER_NETWORK = import.meta.env.VITE_CASPER_NETWORK || 'sui'

export const SUI_TO_MOTES = BigInt(1000000000) // 1 SUI = 1,000,000,000 MIST

export const DEFAULT_PAYMENT = BigInt(100000000) // 0.1 SUI

export const RPC_URLS = {
  'sui-test': import.meta.env.DEV ? '/api/rpc' : 'https://node.testnet.sui.network/rpc', // Use proxy in dev, direct in prod
  'sui': 'https://node.mainnet.sui.network/rpc', // Official mainnet node
}

