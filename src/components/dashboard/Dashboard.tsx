/**
 * Main Dashboard Component
 * Integrates all CSPR.cloud features in a tabbed interface
 */

import { useState } from 'react'
import PortfolioView from '../portfolio/PortfolioView'
import ValidatorPerformance from '../validators/ValidatorPerformance'
import MarketDashboard from '../market/MarketDashboard'
import TransferHistory from '../transfers/TransferHistory'
import ContractExplorer from '../contracts/ContractExplorer'
import NFTGallery from '../nft/NFTGallery'

import AgentActivity from './AgentActivity'
import RWATokenization from './RWATokenization'
import ContractDeployer from './ContractDeployer'

type Tab = 'portfolio' | 'validators' | 'market' | 'transfers' | 'contracts' | 'nfts' | 'agent' | 'rwa' | 'deploy'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'portfolio', label: 'Portfolio', icon: '💰' },
  { id: 'validators', label: 'Validators', icon: '⭐' },
  { id: 'market', label: 'Market', icon: '📈' },
  { id: 'transfers', label: 'Transfers', icon: '📜' },
  { id: 'contracts', label: 'Contracts', icon: '📦' },
  { id: 'nfts', label: 'NFTs', icon: '🖼️' },
  { id: 'agent', label: 'Agent', icon: '🤖' },
  { id: 'rwa', label: 'RWA', icon: '📄' },
  { id: 'deploy', label: 'Deploy', icon: '🚀' },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('portfolio')

  const renderContent = () => {
    switch (activeTab) {
      case 'portfolio':
        return <PortfolioView />
      case 'validators':
        return <ValidatorPerformance showList={true} />
      case 'market':
        return <MarketDashboard />
      case 'transfers':
        return <TransferHistory />
      case 'contracts':
        return <ContractExplorer />
      case 'nfts':
        return <NFTGallery />
      case 'agent':
        return <AgentActivity />
      case 'rwa':
        return <RWATokenization />
      case 'deploy':
        return <ContractDeployer />
      default:
        return <PortfolioView />
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="flex overflow-x-auto custom-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${activeTab === tab.id
                ? 'border-cyan-500 text-cyan-400 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700'
                }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {renderContent()}
      </div>
    </div>
  )
}

