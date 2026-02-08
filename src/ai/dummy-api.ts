import { ParsedIntent } from './embedapi-client';

export async function generateDummyIntent(userInput: string): Promise<ParsedIntent> {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

  const lowerInput = userInput.toLowerCase();
  
  let intent: string | undefined = undefined;
  let reply = "I'm not sure what you mean. Could you try rephrasing?";
  let suggestions = [
      { text: "Stake 10 SUI", icon: "💰", type: "stake" },
      { text: "Swap SUI for USDC", icon: "🔄", type: "swap" }
  ];
  let transactionData = {};
  let entities: any = {};

  if (lowerInput.includes('stake')) {
      intent = 'stake';
      reply = "I can help you stake SUI. I've prepared a transaction for you.";
      entities = { amount: BigInt(1000000000), validator: 'maxYield' }; // 1 SUI
      suggestions = [{ text: "Check Portfolio", icon: "📊", type: "portfolio" }];
  } else if (lowerInput.includes('swap')) {
      intent = 'swap';
      reply = "Swapping SUI for USDC sounds like a plan. Please sign the transaction.";
      entities = { amount: BigInt(1000000000) }; // 1 SUI
      suggestions = [{ text: "Stake USDC", icon: "💰", type: "stake" }];
  } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      reply = "Hello! I am SuiCompass, your DeFi assistant. How can I help you today?";
      suggestions = [
          { text: "Stake SUI", icon: "💰", type: "stake" },
          { text: "Swap Tokens", icon: "🔄", type: "swap" },
          { text: "Check Balance", icon: "💰", type: "balance" }
      ];
  } else if (lowerInput.includes('balance') || lowerInput.includes('portfolio')) {
      intent = 'portfolio';
      reply = "Here is your current portfolio overview.";
  }

  return {
      success: true,
      reply,
      thought: "Using dummy responder for testing.",
      suggestions,
      intent,
      entities,
      transactionData
  };
}
