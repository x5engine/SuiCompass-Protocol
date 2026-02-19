import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQItem = ({ question, answer }: { question: string, answer: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-800 rounded-xl bg-slate-900/50 overflow-hidden mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-800/50 transition-colors"
      >
        <span className="font-semibold text-lg text-slate-100">{question}</span>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} text-cyan-400`}>
          ▼
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 text-slate-400 leading-relaxed border-t border-slate-800/50">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-12 pb-32">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
            User Guide & FAQ
          </h1>
          <p className="text-xl text-slate-400">
            Master the 11 Powers of SuiCompass.
          </p>
        </div>

        <div className="space-y-12">
          
          {/* SECTION 1: ESSENTIALS */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-cyan-400">🚀</span> The Essentials
            </h2>
            <FAQItem 
              question="What is SuiCompass?"
              answer="SuiCompass is your AI Copilot for the Sui Blockchain. Instead of clicking complex buttons, you just tell the AI what you want to do (e.g., 'Invest in the Index Fund'), and it builds the transaction for you."
            />
            <FAQItem 
              question="Do I give you my private keys?"
              answer={
                <div>
                  <p className="font-bold text-emerald-400 mb-2">NEVER.</p>
                  <p>SuiCompass is <strong>non-custodial</strong>. We propose transactions, but YOU must sign them with your own wallet (like Sui Wallet or Ethos). We can never touch your funds without your permission.</p>
                </div>
              }
            />
          </section>

          {/* SECTION 2: THE 11 POWERS */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-violet-400">⚡</span> The 11 Powers (Features)
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
                <div className="col-span-full mb-4 text-sm text-slate-500 uppercase tracking-widest font-bold">Invest & Trade</div>
                
                <FAQItem 
                  question="🧺 Decentralized Index Fund"
                  answer="Think of this like an ETF. Instead of buying 5 different coins individually, you buy 'SUIIDX'. It automatically gives you exposure to a basket of top Sui assets (SUI, USDC, CETUS) in one click."
                />
                <FAQItem 
                  question="🤖 AI Robo-Advisor (Portfolio)"
                  answer="You deposit funds into a smart vault. Our AI monitors the market 24/7 and rebalances your portfolio to maximize yield. Crucially, the AI has 'Trade-Only' rights—it cannot withdraw your money."
                />
                <FAQItem 
                  question="⚡ Flash Loan Arbitrage"
                  answer="This is a pro-tool made easy. It lets you borrow millions of dollars for 1 second to execute a profitable trade (Arbitrage) and repay the loan instantly. If the trade isn't profitable, the transaction cancels itself. Zero risk to your capital."
                />
                <FAQItem 
                  question="👥 Copy Trading"
                  answer="Don't know what to trade? Deposit into a 'Social Vault' managed by a top-performing trader. When they make a profit, you make a profit (minus a small performance fee)."
                />
                <FAQItem 
                  question="📉 Derivatives (Options)"
                  answer="Protect your assets from price crashes. You can buy 'Put Options' on your RWA NFTs or SUI tokens, acting as insurance against volatility."
                />

                <div className="col-span-full my-4 text-sm text-slate-500 uppercase tracking-widest font-bold">Earn & Play</div>

                <FAQItem 
                  question="🎰 Lossless Lottery"
                  answer="A savings account with a twist. You deposit SUI, which earns staking interest. Every week, all the interest from everyone goes to ONE lucky winner. You can always withdraw your full deposit. You literally cannot lose."
                />
                <FAQItem 
                  question="🔮 Prediction Market"
                  answer="Bet on real-world outcomes (e.g., 'Will SUI hit $5?'). If you're right, you win a share of the losing side's pot. Verified by decentralized oracles."
                />

                <div className="col-span-full my-4 text-sm text-slate-500 uppercase tracking-widest font-bold">Utility & Real World</div>

                <FAQItem 
                  question="🏠 RWA Registry"
                  answer="Bring real-world assets on-chain. You can turn an Invoice, a Real Estate deed, or a Bond into a digital NFT. This allows you to use them as collateral for loans or sell them instantly globally."
                />
                <FAQItem 
                  question="⏳ Stream Payments"
                  answer="Stop paying salaries monthly. Pay them every second. You lock funds, and the recipient can withdraw their 'vested' amount whenever they want. Perfect for payroll or subscriptions."
                />
                <FAQItem 
                  question="🌉 Cross-Chain Bridge"
                  answer="Move your assets to and from other blockchains (like Solana or Ethereum) seamlessly. The AI handles the complex routing for you."
                />
                <FAQItem 
                  question="🆔 Reputation ID"
                  answer="Your on-chain credit score. The more you interact, pay back loans, and hold assets, the higher your score. A high score can unlock cheaper loans in the future."
                />
            </div>
          </section>

          {/* SECTION 3: TROUBLESHOOTING */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-amber-400">🛠️</span> Troubleshooting
            </h2>
            <FAQItem 
              question="Why did my transaction fail?"
              answer="Common reasons include: Not enough SUI for gas fees, Slippage (price changed too fast), or User Rejection (you cancelled the wallet popup). Check the error message in the notification."
            />
            <FAQItem 
              question="Is this mainnet?"
              answer="Yes! The contracts are deployed on Sui Mainnet. However, always exercise caution as this is new technology."
            />
          </section>
        </div>
      </div>
    </div>
  );
}
