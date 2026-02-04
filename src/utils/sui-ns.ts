/**
 * SUI.name Resolution Utilities
 * Resolve SUI.name to address
 */

import { suiDataService } from '../services/sui-data-service'

/**
 * Resolve SUI.name to address
 */
export async function resolveSUIName(name: string): Promise<string | null> {
  try {
    return await suiDataService.resolveSuiName(name)
  } catch (error) {
    console.error('Error resolving SUI.name:', error)
    return null
  }
}

/**
 * Format account hash for display
 */
export async function formatAccountDisplay(address: string): Promise<string> {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
