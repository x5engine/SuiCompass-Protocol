import EmbedAPIClientModule from '@embedapi/core'

const EmbedAPIClient = (EmbedAPIClientModule as any).default || EmbedAPIClientModule;

const embedApiKey = import.meta.env.VITE_EMBEDAPI_KEY || import.meta.env.VITE_EMBED_API_KEY;

if (!embedApiKey || embedApiKey === 'your_embedapi_key_here') {
  console.info('ℹ️ EmbedAPI: AI features disabled. Set VITE_EMBEDAPI_KEY in .env to enable.');
}

export const embedApiClient = embedApiKey && embedApiKey !== 'your_embedapi_key_here' && typeof EmbedAPIClient === 'function'
  ? new EmbedAPIClient(embedApiKey)
  : null;

console.log("EmbedAPI initialized:", !!embedApiClient);

// System-level instructions for the AI model
const SUI_AGENT_SYSTEM_PROMPT = `You are SuiCompass, an expert AI assistant for the Sui Blockchain. Your goal is to help users manage their DeFi portfolio, stake assets, and understand the ecosystem.

**Capabilities (Tools):**
1.  **stake**: Stake SUI tokens. Params: amount (in SUI), validator (optional).
2.  **unstake**: Unstake SUI. Params: amount (optional).
3.  **portfolio**: Check wallet balance and staking positions.
4.  **transfer**: Send tokens. Params: amount, recipient, token.
5.  **swap**: Swap tokens (e.g., SUI to USDC). Params: fromToken, toToken, amount.
6.  **earn**: Deposit assets into a lending protocol (e.g., Navi, Scallop). Params: token, amount, protocol (optional).

**Instructions:**
- If the user asks a question, answer it helpfully and concisely.
- Format your 'reply' using Markdown.
- If the user wants to perform an action, you MUST generate a structured JSON response to trigger the tool.
- You can combine a text response with an action (e.g., "Sure, I'll stake that for you.").
- If parameters are missing, ask the user for them in the "reply".
- **VERY IMPORTANT**: Always provide 3-4 "suggestions" for what the user might want to do next, based on the current context.

**Response Format (MUST be valid JSON):**
{
  "thought": "Brief reasoning.",
  "reply": "Natural language response.",
  "suggestions": [ { "text": "Short prompt text", "icon": "emoji", "type": "stake|swap|earn|info" } ],
  "action": { "type": "...", "parameters": { ... } }
}`;

export interface ParsedIntent {
  success: boolean
  reply?: string
  thought?: string
  suggestions?: Array<{ text: string, icon: string, type: string }>
  intent?: string
  entities?: any
  transactionData?: any
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
    const response = await embedApiClient.generate({
      service: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      messages: [
        { role: 'system', content: SUI_AGENT_SYSTEM_PROMPT },
        { role: 'user', content: userInput }
      ],
      temperature: 0.3,
      maxTokens: 1000,
    })

    let responseText = ((response as any)?.data?.text || (response as any)?.data || (response as any)?.text || JSON.stringify(response))
        .replace(/```json/g, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(responseText)

    return {
      success: true,
      reply: parsed.reply,
      thought: parsed.thought,
      suggestions: parsed.suggestions,
      intent: parsed.action?.type,
      entities: parsed.action?.parameters, // Keep it simple
      transactionData: parsed.action?.parameters || {},
    }
  } catch (error) {
    console.error('EmbedAPI Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
