import { useState, useEffect, useRef } from 'react'
import { useWallet } from '../../blockchain/WalletProvider'
import { generateIntent } from '../../ai/embedapi-client'
import { executeLiquidStake, findBestValidator, getStakingInfo } from '../../blockchain/sui-operations'
import { suiClient } from '../../blockchain/sui-client'

import Dashboard from '../dashboard/Dashboard'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

export default function ChatInterface() {
  const { publicKey, isConnected, connect, signAndExecute } = useWallet()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

  // Auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const addMessage = (role: Message['role'], content: string) => {
    setMessages(prev => [...prev, { role, content, timestamp: new Date() }])
  }

  const handleConnect = async () => {
    try {
      connect(); // Triggers dApp Kit modal
      // We can't await connect() here because it's void in our adapter roughly,
      // but standard dApp kit keeps state. Status will update via hook.
    } catch (error) {
      console.error(error);
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return
    if (!isConnected || !publicKey) {
      addMessage('system', 'Please connect your wallet first')
      return
    }

    const userMessage = input.trim()
    addMessage('user', userMessage)
    setInput('')
    setLoading(true)

    try {
      // Step 1: Generate intent via EmbedAPI
      const intentResult = await generateIntent(userMessage)

      if (!intentResult.success) {
        addMessage('assistant', `Error: ${intentResult.error}`)
        return
      }

      // Step 2: Check risk score (placeholder)
      if (intentResult.riskScore && intentResult.riskScore > 0.8) {
        addMessage('assistant', `⚠️ High risk transaction detected. Blocked.`)
        return
      }

      // Step 3: Execute based on intent
      if (intentResult.intent === 'stake') {
        const amountVal = intentResult.entities?.amount;
        // amountVal is in MIST (bigint) from embedapi-client
        // Default to 1 SUI if undefined
        const amountMists = amountVal ? amountVal : BigInt(1_000_000_000);
        const amountSUI = (Number(amountMists) / 1e9).toFixed(2);

        addMessage('assistant', `Preparing to stake ${amountSUI} SUI...`)

        let validator = intentResult.entities?.validator
        if (!validator) {
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
          addMessage('assistant', `View on Explorer: https://suiscan.xyz/testnet/tx/${result.digest}`)
        } catch (err: any) {
          addMessage('assistant', `❌ Transaction failed: ${err.message}`)
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
      } else {
        addMessage('assistant', `I understand you want to "${intentResult.intent}", but I can only handle Staking and Portfolio queries right now.`)
      }

    } catch (error) {
      console.error('Error processing intent:', error)
      addMessage('assistant', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
                <h1 className="text-xl font-bold text-slate-100 tracking-tight">SuiCompass</h1>
                <p className="text-xs text-slate-400">AI-Powered DeFi Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={() => setShowDashboard(!showDashboard)}
                className="text-slate-300 hover:text-white"
              >
                {showDashboard ? 'Back to Chat' : 'Dashboard'}
              </button>

              {isConnected ? (
                <div className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300 text-sm font-mono border border-slate-700">
                  {publicKey?.slice(0, 6)}...{publicKey?.slice(-4)}
                </div>
              ) : (
                /* We rely on WalletProvider internal modal or this button triggering it */
                <button
                  onClick={handleConnect}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-xl font-semibold text-sm"
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
                  <div className="text-6xl mb-6">👋</div>
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
                    {msg.content.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
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
                  className="flex-1 bg-slate-800 border-none rounded-xl px-4 py-3 text-slate-100 focus:ring-2 focus:ring-cyan-500/50 outline-none"
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-semibold disabled:opacity-50 transition-colors"
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
