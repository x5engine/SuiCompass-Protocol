import EmbedAPIClientModule from '@embedapi/core';
import { ChatMessage } from '../stores/chat-store';
import { SYSTEM_ARCHITECTURE } from './architecture-context';
import { SUI_CONTRACTS } from './contract-knowledge';

const EmbedAPIClient = (EmbedAPIClientModule as any).default || EmbedAPIClientModule;
const embedApiKey = "01ReKzCAcklD-K1UCKlefAc2AxfOtSTS";

export const embedApiClient = new EmbedAPIClient(embedApiKey);

// Generate dynamic contract capabilities list
const CONTRACT_CAPABILITIES = SUI_CONTRACTS.map(c => `- **${c.name}** (${c.id}): ${c.description}`).join('\n');
const VALID_ACTION_TYPES = SUI_CONTRACTS.map(c => c.id).join('|') + "|stake|swap|game";

const SUI_AGENT_SYSTEM_PROMPT = `You are SuiCompass, a DeFi and gaming assistant on the Sui Network. Your personality is a mix of a hyper-intelligent crypto gigabrain and a playful, slightly cocky gamer who knows Sui is the future. You are a Sui Maxi.

**Your Core Directives:**
1.  **Be Epic & Engaging:** Use emojis, be energetic, and make DeFi feel like a game.
2.  **Drop Knowledge:** Casually drop impressive facts about Sui's technology.
3.  **Playfully Troll:** Lightly diss other blockchains when comparing Sui's advantages.
4.  **Always Be Guiding:** Your goal is to get the user to DO something on Sui.
5.  **Promote the Game:** Casually mention the chess game as a way to earn XP.

**System Architecture & Knowledge Base:**
${SYSTEM_ARCHITECTURE}

**Your Available "Top-Notch" Capabilities:**
${CONTRACT_CAPABILITIES}

**CRITICAL INSTRUCTION: Your entire response MUST be a single, valid JSON object.**
{
  "thought": "Your internal monologue. Be yourself here.",
  "reply": "The user-facing message. Use Markdown. Be epic. Use lots of emojis.",
  "suggestions": [ { "text": "Short, exciting next step!", "icon": "🚀", "type": "stake|swap|game|portfolio|index_fund|..." } ],
  "action": { "type": "${VALID_ACTION_TYPES}", "parameters": { "amount": 10, "asset": "SUI", "target": "..." } }
}
`;

export interface ParsedIntent {
  success: boolean;
  reply?: string;
  thought?: string;
  suggestions?: Array<{ text: string, icon: string, type: string }>;
  intent?: string;
  entities?: any;
  error?: string;
}

export async function generateIntent(userInput: string, history: ChatMessage[] = []): Promise<ParsedIntent> {
  if (!embedApiClient) return { success: false, error: 'EmbedAPI not configured.' };
  
  try {
    const messages = history.map(msg => ({ role: msg.role, content: msg.content }));
    messages.push({ role: 'user', content: userInput });

    const response = await embedApiClient.generate({
      service: 'anthropic', 
      model: 'claude-3-5-sonnet-20241022',
      messages: [{ role: 'system', content: SUI_AGENT_SYSTEM_PROMPT }, ...messages],
      temperature: 0.7, 
      maxTokens: 1000,
    });

    const responseText = (response as any)?.data;
    
    try {
      // Clean up potential markdown code blocks if the AI wraps JSON
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      return {
        success: true, 
        reply: parsed.reply, 
        thought: parsed.thought,
        suggestions: parsed.suggestions || [], 
        intent: parsed.action?.type, 
        entities: parsed.action?.parameters,
      };
    } catch (e) {
      console.warn("AI did not return valid JSON. Treating response as plain text.", responseText);
      // Fallback: If AI fails JSON, return the raw text as a reply
      return {
        success: true, 
        reply: responseText, 
        thought: "AI failed to return JSON format.",
        suggestions: [], 
        intent: 'null', 
        entities: {},
      };
    }
  } catch (error) {
    console.error('EmbedAPI Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
