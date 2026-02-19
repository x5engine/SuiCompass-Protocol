import { CONTRACTS } from '../lib/constants';

export interface ContractCapability {
  id: string;
  name: string;
  description: string;
  module: string;
  functions: string[];
  prompts: string[];
}

export const SUI_CONTRACTS: ContractCapability[] = [
  {
    id: 'portfolio',
    name: 'AI Robo-Advisor',
    description: 'Autonomous portfolio management where you retain custody but delegate trading authority.',
    module: 'portfolio',
    functions: ['create_portfolio', 'deposit', 'withdraw', 'execute_strategy'],
    prompts: [
      "Create a managed portfolio",
      "Deposit 100 SUI into my robo-advisor",
      "Rebalance my portfolio for max yield"
    ]
  },
  {
    id: 'index_fund',
    name: 'Decentralized ETF',
    description: 'One-click exposure to a diversified basket of Sui ecosystem assets.',
    module: 'index_fund',
    functions: ['mint_shares', 'redeem_shares'],
    prompts: [
      "Buy the Sui Ecosystem Index",
      "Invest 500 SUI in the DeFi ETF",
      "Redeem my index fund shares"
    ]
  },
  {
    id: 'flash_loan',
    name: 'Flash Loan Arbitrage',
    description: 'Execute zero-capital arbitrage trades across DEXs in a single transaction.',
    module: 'flash_loan',
    functions: ['execute_arbitrage'],
    prompts: [
      "Scan for arbitrage opportunities",
      "Execute a flash loan trade",
      "Check arbitrage profitability"
    ]
  },
  {
    id: 'prediction_market',
    name: 'Prediction Market',
    description: 'Bet on real-world outcomes resolved by trusted oracles.',
    module: 'prediction_market',
    functions: ['place_bet', 'claim_winnings'],
    prompts: [
      "Bet YES on SUI hitting $5",
      "What are the odds for the hackathon winner?",
      "Claim my prediction market winnings"
    ]
  },
  {
    id: 'social_trading',
    name: 'Copy Trading Vault',
    description: 'Automatically mirror the trades of top-performing on-chain investors.',
    module: 'social_trading',
    functions: ['deposit', 'withdraw'],
    prompts: [
      "Copy the top-performing trader",
      "Deposit into the 'Whale Watcher' vault",
      "Withdraw from copy trading"
    ]
  },
  {
    id: 'stream_pay',
    name: 'Stream Payments',
    description: 'Real-time token vesting and payroll streaming.',
    module: 'stream_pay',
    functions: ['create_stream', 'claim'],
    prompts: [
      "Stream 1000 SUI to Alice over 30 days",
      "Claim my vested salary",
      "Cancel the payment stream"
    ]
  },
  {
    id: 'derivatives',
    name: 'Options & Derivatives',
    description: 'Hedge risk with decentralized Call/Put options on any asset.',
    module: 'derivatives',
    functions: ['create_option', 'exercise'],
    prompts: [
      "Buy a Call Option on SUI",
      "Hedge my RWA exposure",
      "Exercise my option contract"
    ]
  },
  {
    id: 'lossless_lottery',
    name: 'Gamified Staking',
    description: 'Win prizes from staking yield without risking your principal.',
    module: 'lossless_lottery',
    functions: ['deposit', 'withdraw_all'],
    prompts: [
      "Enter the lossless lottery",
      "Deposit 50 SUI for a chance to win",
      "Withdraw my lottery principal"
    ]
  },
  {
    id: 'bridge_adaptor',
    name: 'Cross-Chain Bridge',
    description: 'Seamlessly move assets to and from other chains.',
    module: 'bridge_adaptor',
    functions: ['bridge_asset'],
    prompts: [
      "Bridge 100 USDC to Solana",
      "Move my assets to Ethereum",
      "Check bridge status"
    ]
  },
  {
    id: 'reputation_id',
    name: 'On-Chain Identity',
    description: 'Build your DeFi credit score for undercollateralized loans.',
    module: 'reputation_id',
    functions: ['create_profile', 'get_score'],
    prompts: [
      "Check my DeFi credit score",
      "Create a reputation profile",
      "Who can attest to my reputation?"
    ]
  }
];

export const getSuggestedPrompts = (): string[] => {
  // Randomly select 4 prompts from the capabilities
  const allPrompts = SUI_CONTRACTS.flatMap(c => c.prompts);
  return allPrompts.sort(() => 0.5 - Math.random()).slice(0, 4);
};
