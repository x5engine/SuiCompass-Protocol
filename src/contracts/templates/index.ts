/**
 * Contract Template Definitions
 * Pre-configured templates for common contract deployments
 */

import type { ContractTemplate } from '../../types/contract-templates'

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'staking-pool',
    name: 'Staking Pool',
    description: 'A liquid staking pool that allows users to stake SUI and receive liquid tokens',
    type: 'staking-pool',
    category: 'defi',
    icon: '💰',
    parameters: [
      {
        name: 'pool_name',
        type: 'string',
        required: true,
        description: 'Name of the staking pool',
        defaultValue: 'My Staking Pool',
      },
      {
        name: 'min_stake',
        type: 'number',
        required: true,
        description: 'Minimum stake amount in SUI',
        defaultValue: 10,
        validation: (value) => {
          if (typeof value !== 'number' || value <= 0) {
            return { valid: false, error: 'Minimum stake must be greater than 0' }
          }
          return { valid: true }
        },
      },
      {
        name: 'fee_percentage',
        type: 'number',
        required: false,
        description: 'Pool fee percentage (0-100)',
        defaultValue: 5,
        validation: (value) => {
          if (typeof value !== 'number' || value < 0 || value > 100) {
            return { valid: false, error: 'Fee must be between 0 and 100' }
          }
          return { valid: true }
        },
      },
    ],
    entryPoints: ['stake', 'unstake', 'claim_rewards', 'get_pool_info'],
    defaultValues: {
      pool_name: 'My Staking Pool',
      min_stake: 10,
      fee_percentage: 5,
    },
    estimatedGas: 5000000000, // 5 SUI
  },
  {
    id: 'lending-pool',
    name: 'Lending Pool',
    description: 'A lending pool for borrowing and lending SUI with interest rates',
    type: 'lending-pool',
    category: 'defi',
    icon: '🏦',
    parameters: [
      {
        name: 'pool_name',
        type: 'string',
        required: true,
        description: 'Name of the lending pool',
        defaultValue: 'My Lending Pool',
      },
      {
        name: 'interest_rate',
        type: 'number',
        required: true,
        description: 'Annual interest rate percentage',
        defaultValue: 10,
        validation: (value) => {
          if (typeof value !== 'number' || value < 0 || value > 100) {
            return { valid: false, error: 'Interest rate must be between 0 and 100' }
          }
          return { valid: true }
        },
      },
      {
        name: 'collateral_ratio',
        type: 'number',
        required: true,
        description: 'Required collateral ratio (e.g., 150 = 150%)',
        defaultValue: 150,
        validation: (value) => {
          if (typeof value !== 'number' || value < 100) {
            return { valid: false, error: 'Collateral ratio must be at least 100%' }
          }
          return { valid: true }
        },
      },
    ],
    entryPoints: ['deposit', 'withdraw', 'borrow', 'repay', 'liquidate'],
    defaultValues: {
      pool_name: 'My Lending Pool',
      interest_rate: 10,
      collateral_ratio: 150,
    },
    estimatedGas: 5000000000, // 5 SUI
  },
  {
    id: 'token-factory',
    name: 'Token Factory',
    description: 'Deploy a new fungible token (CEP-18 standard)',
    type: 'token-factory',
    category: 'token',
    icon: '🪙',
    parameters: [
      {
        name: 'token_name',
        type: 'string',
        required: true,
        description: 'Name of the token',
        defaultValue: 'My Token',
      },
      {
        name: 'token_symbol',
        type: 'string',
        required: true,
        description: 'Token symbol (e.g., MTK)',
        defaultValue: 'MTK',
        validation: (value) => {
          if (typeof value !== 'string' || value.length < 2 || value.length > 10) {
            return { valid: false, error: 'Symbol must be 2-10 characters' }
          }
          return { valid: true }
        },
      },
      {
        name: 'total_supply',
        type: 'number',
        required: true,
        description: 'Total supply of tokens',
        defaultValue: 1000000,
        validation: (value) => {
          if (typeof value !== 'number' || value <= 0) {
            return { valid: false, error: 'Total supply must be greater than 0' }
          }
          return { valid: true }
        },
      },
      {
        name: 'decimals',
        type: 'number',
        required: false,
        description: 'Number of decimal places',
        defaultValue: 9,
        validation: (value) => {
          if (typeof value !== 'number' || value < 0 || value > 18) {
            return { valid: false, error: 'Decimals must be between 0 and 18' }
          }
          return { valid: true }
        },
      },
    ],
    entryPoints: ['transfer', 'approve', 'mint', 'burn'],
    defaultValues: {
      token_name: 'My Token',
      token_symbol: 'MTK',
      total_supply: 1000000,
      decimals: 9,
    },
    estimatedGas: 3000000000, // 3 SUI
  },
  {
    id: 'nft-collection',
    name: 'NFT Collection',
    description: 'Deploy an NFT collection (CEP-78 standard)',
    type: 'nft-collection',
    category: 'nft',
    icon: '🖼️',
    parameters: [
      {
        name: 'collection_name',
        type: 'string',
        required: true,
        description: 'Name of the NFT collection',
        defaultValue: 'My NFT Collection',
      },
      {
        name: 'collection_symbol',
        type: 'string',
        required: true,
        description: 'Collection symbol',
        defaultValue: 'MNFT',
      },
      {
        name: 'max_supply',
        type: 'number',
        required: false,
        description: 'Maximum number of NFTs (0 = unlimited)',
        defaultValue: 0,
        validation: (value) => {
          if (typeof value !== 'number' || value < 0) {
            return { valid: false, error: 'Max supply must be 0 or greater' }
          }
          return { valid: true }
        },
      },
    ],
    entryPoints: ['mint', 'transfer', 'burn', 'approve'],
    defaultValues: {
      collection_name: 'My NFT Collection',
      collection_symbol: 'MNFT',
      max_supply: 0,
    },
    estimatedGas: 3000000000, // 3 SUI
  },
]

/**
 * Get template by ID
 */
export function getTemplate(templateId: string): ContractTemplate | undefined {
  return CONTRACT_TEMPLATES.find((t) => t.id === templateId)
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: ContractTemplate['category']): ContractTemplate[] {
  return CONTRACT_TEMPLATES.filter((t) => t.category === category)
}

/**
 * Validate template parameters
 */
export function validateTemplateParameters(
  template: ContractTemplate,
  parameters: Record<string, any>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  for (const param of template.parameters) {
    const value = parameters[param.name]

    // Check required
    if (param.required && (value === undefined || value === null || value === '')) {
      errors[param.name] = `${param.name} is required`
      continue
    }

    // Skip validation if value is not provided and not required
    if (!param.required && (value === undefined || value === null || value === '')) {
      continue
    }

    // Type validation
    if (param.type === 'number' && typeof value !== 'number') {
      errors[param.name] = `${param.name} must be a number`
      continue
    }

    if (param.type === 'bool' && typeof value !== 'boolean') {
      errors[param.name] = `${param.name} must be a boolean`
      continue
    }

    if (param.type === 'string' && typeof value !== 'string') {
      errors[param.name] = `${param.name} must be a string`
      continue
    }

    // Custom validation
    if (param.validation) {
      const validationResult = param.validation(value)
      if (!validationResult.valid) {
        errors[param.name] = validationResult.error || `${param.name} is invalid`
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

