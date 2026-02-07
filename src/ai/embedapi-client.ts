// Import EmbedAPIClient - it's exported directly as the default
import EmbedAPIClientModule from '@embedapi/core'

// The module exports the class directly - handle both default and named exports
const EmbedAPIClient = (EmbedAPIClientModule as any).default || EmbedAPIClientModule

// Check for API key with better error handling
// Support both VITE_EMBEDAPI_KEY and VITE_EMBED_API_KEY for compatibility
const embedApiKey = import.meta.env.VITE_EMBEDAPI_KEY || import.meta.env.VITE_EMBED_API_KEY

// Only warn once, and make it less intrusive
let hasWarned = false
if ((!embedApiKey || embedApiKey === 'your_embedapi_key_here') && !hasWarned) {
  hasWarned = true
  // Use console.info instead of console.warn for less intrusive message
  console.info('ℹ️ EmbedAPI: AI features disabled. Set VITE_EMBEDAPI_KEY in .env to enable.')
}

// Initialize EmbedAPI Client - this handles ALL AI operations
// Only initialize if we have a valid key
export const embedApiClient = embedApiKey && embedApiKey !== 'your_embedapi_key_here' && typeof EmbedAPIClient === 'function'
  ? new EmbedAPIClient(embedApiKey)
  : null

// Prompt template for Sui DeFi operations
const SUI_PROMPT_TEMPLATE = `You are a Sui Blockchain Specialist expert in DeFi operations.

Parse the user's intent and extract the following information in JSON format:
{
  "intent": "stake|unstake|claim|transfer|portfolio|balance|status|query|auto_stake|deploy_contract|tokenize_rwa|greeting",
  "amount": number (in SUI - convert to MIST: amount * 1000000000),
  "validator": "validator public key/address or 'maxYield' for auto-select",
  "recipient": "Sui address (0x...) (if transfer)",
  "token": "token symbol (SUI, USDC) or coin type",
  "riskScore": number (0-1, estimate transaction risk),
  "autoStakeAction": "enable|disable|status" (if intent is auto_stake),
  "contractTemplate": "staking-pool|lending-pool|token-factory|nft-collection" (if intent is deploy_contract),
  "contractParameters": object (if intent is deploy_contract),
  "rwaType": "invoice|bill|receivable|other" (if intent is tokenize_rwa),
  "rwaAmount": number (if intent is tokenize_rwa),
  "rwaCurrency": "SUI|USD|EUR" (if intent is tokenize_rwa),
  "message": "friendly greeting message" (if intent is greeting)
}

User input: {userInput}
Network: {network}
Current time: {timestamp}

Return only valid JSON, no additional text.`;

export interface ParsedIntent {
  success: boolean
  intent?: string
  entities?: {
    amount?: bigint
    validator?: string
    recipient?: string
    sourceChain?: string
    destinationChain?: string
    token?: string
  }
  riskScore?: number
  transactionData?: {
    autoStakeAction?: 'enable' | 'disable' | 'status'
    contractTemplate?: string
    contractParameters?: Record<string, any>
    rwaType?: 'invoice' | 'bill' | 'receivable' | 'other'
    rwaAmount?: number
    rwaCurrency?: string
    [key: string]: any
  }
  error?: string
}

// Generate intent from user input
export async function generateIntent(userInput: string): Promise<ParsedIntent> {
  if (!embedApiClient) {
    return {
      success: false,
      error: 'EmbedAPI is not configured. Please set VITE_EMBEDAPI_KEY in your .env file.',
    }
  }

  try {
    const prompt = SUI_PROMPT_TEMPLATE
      .replace('{userInput}', userInput)
      .replace('{network}', import.meta.env.VITE_SUI_NETWORK || 'testnet')
      .replace('{timestamp}', new Date().toISOString())

    // EmbedAPI expects messages array format
    const response = await embedApiClient.generate({
      service: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      maxTokens: 500,
    })

    // Parse the JSON response - response structure may vary
    // Handle different response formats:
    // 1. response.data (string JSON)
    // 2. response.data.text (string JSON)
    // 3. response.text (string JSON)
    let responseText: string
    if ((response as any)?.data) {
      // If data is a string, parse it; if it's an object with text, use text
      if (typeof (response as any).data === 'string') {
        responseText = (response as any).data
      } else {
        responseText = (response as any).data.text || JSON.stringify((response as any).data)
      }
    } else {
      responseText = (response as any)?.text || JSON.stringify(response)
    }

    // Parse the JSON string
    const parsed = JSON.parse(responseText)

    return {
      success: true,
      intent: parsed.intent,
      entities: {
        amount: parsed.amount ? BigInt(Math.floor(parsed.amount * 1000000000)) : undefined,
        validator: parsed.validator,
        recipient: parsed.recipient,
        sourceChain: parsed.sourceChain,
        destinationChain: parsed.destinationChain,
        token: parsed.token,
      },
      riskScore: parsed.riskScore || 0,
      transactionData: parsed,
    }
  } catch (error) {
    console.error('EmbedAPI Generate Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Stream responses for real-time feedback
export async function* streamIntent(userInput: string) {
  if (!embedApiClient) {
    yield {
      text: 'Error: EmbedAPI is not configured. Please set VITE_EMBEDAPI_KEY in your .env file.',
      done: true,
    }
    return
  }

  try {
    const prompt = SUI_PROMPT_TEMPLATE
      .replace('{userInput}', userInput)
      .replace('{network}', import.meta.env.VITE_SUI_NETWORK || 'testnet')
      .replace('{timestamp}', new Date().toISOString())

    const stream = await embedApiClient.stream({
      service: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
    })

    for await (const chunk of stream) {
      // Handle different chunk formats
      let text: string
      if ((chunk as any)?.data) {
        if (typeof (chunk as any).data === 'string') {
          text = (chunk as any).data
        } else {
          text = (chunk as any).data.text || (chunk as any).data || ''
        }
      } else {
        text = (chunk as any)?.text || (chunk as any)?.content || String(chunk)
      }

      yield {
        text,
        done: (chunk as any)?.done || false,
      }
    }
  } catch (error) {
    console.error('EmbedAPI Stream Error:', error)
    yield {
      text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      done: true,
    }
  }
}

// Generate transaction explanation
export async function generateExplanation(intent: any, transactionData: any): Promise<string> {
  if (!embedApiClient) {
    return 'EmbedAPI is not configured. Please set VITE_EMBEDAPI_KEY in your .env file.'
  }

  const prompt = `Explain this Sui transaction to the user in simple terms:
  
  Intent: ${intent}
  Transaction: ${JSON.stringify(transactionData)}
  
  Keep it brief and user-friendly.`

  const response = await embedApiClient.generate({
    service: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    maxTokens: 200,
  })

  // Handle different response formats
  if ((response as any)?.data) {
    if (typeof (response as any).data === 'string') {
      return (response as any).data
    } else {
      return (response as any).data.text || JSON.stringify((response as any).data)
    }
  }
  return (response as any)?.text || JSON.stringify(response)
}
