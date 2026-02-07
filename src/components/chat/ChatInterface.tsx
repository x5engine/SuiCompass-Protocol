import { useState, useEffect, useRef } from 'react'
import { useWallet } from '../../blockchain/WalletProvider'
import { generateIntent } from '../../ai/embedapi-client'
import { executeLiquidStake, findBestValidator, getStakingInfo } from '../../blockchain/sui-operations'
import { suiClient } from '../../blockchain/sui-client'

import Dashboard from '../dashboard/Dashboard'
import EpicLoader from '../common/EpicLoader' // Import the new loader

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string | JSX.Element // Allow JSX for custom components
  timestamp: Date
}

import { playSound } from '../../utils/sound-effects'
import confetti from 'canvas-confetti'

export default function ChatInterface() {
  const { publicKey, isConnected, connect, signAndExecute } = useWallet()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [balance, setBalance] = useState<string | null>(null)

  useEffect(() => {
    if (isConnected && publicKey) {
      playSound('success')
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } })

      // Fetch balance
      suiClient.getAccountBalance(publicKey).then(bal => {
        setBalance((Number(bal) / 1e9).toFixed(2))
      })
    }
  }, [isConnected, publicKey])

  // Auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const addMessage = (role: Message['role'], content: string | JSX.Element) => {
    setMessages(prev => [...prev, { role, content, timestamp: new Date() }])
  }

  const handleConnect = async () => {
    playSound('click'); // Sound on connect click
    try {
      connect(); // Triggers dApp Kit modal
      // We can't await connect() here because it's void in our adapter roughly,
      // but standard dApp kit keeps state. Status will update via hook.
    } catch (error) {
      console.error(error);
      playSound('error'); // Sound on connect error
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return
    playSound('click'); // Sound on send

    if (!isConnected || !publicKey) {
      addMessage('system', 'Please connect your wallet first')
      playSound('error');
      return
    }

    const userMessage = input.trim()
    addMessage('user', userMessage)
    setInput('')
    setLoading(true)
    
    // Note: We don't play a specific "processing" sound here to avoid annoyance,
    // relying on the visual EpicLoader instead.

    try {
      // Step 1: Generate intent via EmbedAPI
      const intentResult = await generateIntent(userMessage)

      if (!intentResult.success) {
        addMessage('assistant', `Error: ${intentResult.error}`)
        playSound('error');
        return
      }

      // Step 2: Check risk score (placeholder)
      if (intentResult.riskScore && intentResult.riskScore > 0.8) {
        addMessage('assistant', `⚠️ High risk transaction detected. Blocked.`)
        playSound('error');
        return
      }

      playSound('success'); // Sound on successful intent parsing

      // Step 3: Execute based on intent
      if (intentResult.intent === 'stake') {
        const amountVal = intentResult.entities?.amount;
        // amountVal is in MIST (bigint) from embedapi-client
        // Default to 1 SUI if undefined
        const amountMists = amountVal ? amountVal : BigInt(1_000_000_000);
        const amountSUI = (Number(amountMists) / 1e9).toFixed(2);

        addMessage('assistant', `Preparing to stake ${amountSUI} SUI...`)

        let validator = intentResult.entities?.validator
        // If validator is missing or 'maxYield', find the best one
        if (!validator || validator.toLowerCase() === 'maxyield') {
          addMessage('assistant', '🔍 Finding best validator...')
          validator = await findBestValidator()
        }

        addMessage('assistant', `Validator: ${validator.slice(0, 10)}...`)

        const tx = await executeLiquidStake({
          amount: amountMists,
          validatorPublicKey: validator
        })

        addMessage('assistant', '📝 Please sign the transaction in your wallet...')

        try {
          const result = await signAndExecute({ transactionBlock: tx })
          addMessage('assistant', `✅ Staking successful! Digest: ${result.digest}`)
          addMessage('assistant', `View on Explorer: https://suiscan.xyz/mainnet/tx/${result.digest}`)
          playSound('success'); // Additional success sound for transaction
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); // Celebration!
        } catch (err: any) {
          addMessage('assistant', `❌ Transaction failed: ${err.message}`)
          playSound('error');
        }

      } else if (intentResult.intent === 'unstake') {
        // Unstake logic requires knowing the StakedSui object ID.
        // This is complex via chat without context.
        // We'll just ask them to use Dashboard for now or list stakes.
        addMessage('assistant', 'For unstaking, please select the specific stake object from the Dashboard.')
        setShowDashboard(true)

      } else if (intentResult.intent === 'portfolio' || intentResult.intent === 'balance') {
        const balance = await suiClient.getAccountBalance(publicKey)
        const staking = await getStakingInfo(publicKey)

        addMessage('assistant', `📊 **Your Portfolio**\n\n` +
          `💰 Available: ${(Number(balance) / 1e9).toFixed(2)} SUI\n` +
          `🔒 Staked: ${(Number(staking.stakedAmount) / 1e9).toFixed(2)} SUI\n` +
          `🎁 Pending Rewards: ${(Number(staking.pendingRewards) / 1e9).toFixed(4)} SUI`)
      } else if (intentResult.intent === 'greeting') {
         addMessage('assistant', intentResult.transactionData?.message || "Hello! I'm SuiCompass. I can help you stake SUI, check your portfolio, or tokenize real-world assets. What would you like to do today?");
      } else {
        addMessage('assistant', `I understood your intent is "${intentResult.intent}", but I currently specialize in Staking, Portfolio management, and RWA Tokenization. Try asking me to "Stake 10 SUI" or "Check my balance".`)
      }

    } catch (error) {
      console.error('Error processing intent:', error)
      addMessage('assistant', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      playSound('error');
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      {/* Top Navbar */}
      <nav className="w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🧭</div>
              <div>
                <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
                  SuiCompass <span className="text-xs bg-cyan-900/50 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800">BETA</span>
                </h1>
                <p className="text-xs text-slate-400">AI-Powered DeFi Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={() => { setShowDashboard(!showDashboard); playSound('click'); }}
                className="text-slate-300 hover:text-white transition-colors"
                onMouseEnter={() => playSound('hover')}
              >
                {showDashboard ? 'Back to Chat' : 'Dashboard'}
              </button>

              {isConnected ? (
                <div className="flex items-center gap-3">
                  {balance && (
                    <div className="hidden md:flex flex-col items-end mr-2">
                      <span className="text-xs text-slate-400">Balance</span>
                      <span className="text-sm font-bold text-white font-mono">{balance} SUI</span>
                    </div>
                  )}
                  <div className="px-4 py-2 bg-slate-800/80 backdrop-blur rounded-lg text-slate-300 text-sm font-mono border border-slate-700 shadow-lg shadow-cyan-900/20">
                    <span className="mr-2 text-cyan-500">●</span>
                    {publicKey?.slice(0, 6)}...{publicKey?.slice(-4)}
                  </div>
                </div>
              ) : (
                /* We rely on WalletProvider internal modal or this button triggering it */
                <button
                  onClick={handleConnect}
                  onMouseEnter={() => playSound('hover')}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        {showDashboard ? (
          <div className="h-full overflow-y-auto">
            <div className="p-8">
              <Dashboard />
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-center text-slate-500 mt-20">
                  <div className="text-6xl mb-6 animate-bounce">👋</div>
                  <h2 className="text-2xl font-bold text-slate-300 mb-2">Hello! I'm SuiCompass.</h2>
                  <p>Ask me to check your balance, stake SUI, or view your portfolio.</p>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user'
                    ? 'bg-cyan-600/20 border border-cyan-500/30 text-slate-100'
                    : 'bg-slate-800 border border-slate-700 text-slate-200'
                    }`}>
                    {typeof msg.content === 'string' ? (
                      msg.content.split('\n').map((line, i) => (
                        <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                      ))
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              
              {/* Epic Loading Indicator */}
              {loading && (
                <div className="flex justify-start">
                   <div className="max-w-[80%] rounded-2xl p-4 bg-slate-800 border border-slate-700 text-slate-200">
                      <EpicLoader />
                   </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900/50">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me to stake SUI..."
                  className="flex-1 bg-slate-800 border-none rounded-xl px-4 py-3 text-slate-100 focus:ring-2 focus:ring-cyan-500/50 outline-none placeholder-slate-500"
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={loading}
                  onMouseEnter={() => !loading && playSound('hover')}
                  className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-semibold disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95"
                >
                  {loading ? 'Thinking...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
