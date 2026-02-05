/**
 * RWA Tokenization Dashboard Tab
 * Main component for tokenizing real-world assets
 */

import { useState } from 'react'
import { useWallet } from '../../blockchain/WalletProvider'
import { rwaTokenizationService } from '../../services/rwa-tokenization'
import { showNotification } from '../ui/Notification'
import DocumentUpload from './DocumentUpload'
import RiskAuditResults from './RiskAuditResults'
import type { TokenizationRequest, RiskAuditResult, TokenizationResult } from '../../types/rwa-audit'

type Step = 'upload' | 'metadata' | 'audit' | 'tokenize' | 'success'

export default function RWATokenization() {
  const { publicKey, isConnected, signAndExecute } = useWallet()
  const [step, setStep] = useState<Step>('upload')
  const [loading, setLoading] = useState(false)
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [documentUrl, setDocumentUrl] = useState<string>('')
  const [metadata, setMetadata] = useState({
    assetType: 'invoice' as const,
    issuer: publicKey || '',
    amount: '',
    currency: 'CSPR',
    dueDate: '',
    description: '',
  })
  const [auditResult, setAuditResult] = useState<RiskAuditResult | null>(null)
  const [tokenizationResult, setTokenizationResult] = useState<TokenizationResult | null>(null)

  if (!isConnected || !publicKey) {
    return (
      <div className="p-6 text-center text-slate-400">
        <div className="text-4xl mb-4">🔒</div>
        <div>Please connect your wallet to tokenize assets</div>
      </div>
    )
  }

  const handleFileSelect = (file: File) => {
    setDocumentFile(file)
    setStep('metadata')
  }

  const handleUrlInput = (url: string) => {
    setDocumentUrl(url)
    setStep('metadata')
  }

  const handleMetadataSubmit = async () => {
    // Validate
    const request: TokenizationRequest = {
      metadata: {
        assetType: metadata.assetType,
        issuer: metadata.issuer || publicKey,
        amount: parseFloat(metadata.amount),
        currency: metadata.currency,
        dueDate: metadata.dueDate,
        status: 'pending',
        description: metadata.description,
      },
      documentFile: documentFile || undefined,
      documentUrl: documentUrl || undefined,
    }

    const validation = rwaTokenizationService.validateRequest(request)
    if (!validation.valid) {
      showNotification({
        type: 'error',
        title: 'Validation Error',
        message: validation.errors.join(', '),
      })
      return
    }

    setLoading(true)
    setStep('audit')

    try {
      // Run tokenization (includes AI audit)
      const result = await rwaTokenizationService.tokenizeRWA(request)

      setAuditResult(result.auditResult)
      setTokenizationResult(result.tokenizationResult)

      if (result.tokenizationResult?.success) {
        setStep('success')
        showNotification({
          type: 'success',
          title: 'Tokenization Ready',
          message: 'Asset has been prepared for tokenization. Proceed to deploy contract.',
        })
      } else {
        showNotification({
          type: 'error',
          title: 'Tokenization Blocked',
          message: result.tokenizationResult?.error || 'Tokenization failed',
        })
      }
    } catch (error) {
      console.error('Tokenization error:', error)
      showNotification({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProceedToTokenize = async () => {
    if (!tokenizationResult?.ipfsHash || !auditResult) return;

    // TODO: Replace with actual deployed package ID after mainnet deployment
    // Users can also input this or we fetch it from config
    const PACKAGE_ID = import.meta.env.VITE_RWA_PACKAGE_ID || '0x0';

    if (PACKAGE_ID === '0x0') {
      showNotification({
        type: 'error',
        title: 'Configuration Error',
        message: 'RWA Package ID not set. Please deploy contract first.',
      });
      return;
    }

    setLoading(true);
    try {
      const tx = await rwaTokenizationService.mintRWA(
        PACKAGE_ID,
        {
          ...metadata,
          amount: parseFloat(metadata.amount),
          documentHash: tokenizationResult.ipfsHash,
          riskScore: auditResult.riskScore,
          createdAt: new Date().toISOString(),
          status: 'pending'
        },
        tokenizationResult.ipfsHash
      );

      const result = await signAndExecute({ transactionBlock: tx });

      setStep('success');
      showNotification({
        type: 'success',
        title: 'RWA Minted!',
        message: `Asset tokenized successfully. Digest: ${result.digest}`,
      });

    } catch (error) {
      console.error("Minting failed", error);
      showNotification({
        type: 'error',
        title: 'Minting Failed',
        message: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setLoading(false);
    }
  }

  const handleReset = () => {
    setStep('upload')
    setDocumentFile(null)
    setDocumentUrl('')
    setMetadata({
      assetType: 'invoice',
      issuer: publicKey,
      amount: '',
      currency: 'CSPR',
      dueDate: '',
      description: '',
    })
    setAuditResult(null)
    setTokenizationResult(null)
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-100">Tokenize Real-World Asset</h2>
        {step !== 'upload' && (
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 transition-colors text-sm"
          >
            Start Over
          </button>
        )}
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {['upload', 'metadata', 'audit', 'tokenize', 'success'].map((s, index) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === s
                ? 'bg-cyan-500 text-white'
                : ['upload', 'metadata', 'audit', 'tokenize', 'success'].indexOf(step) > index
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-700 text-slate-400'
                }`}
            >
              {index + 1}
            </div>
            {index < 4 && (
              <div
                className={`w-12 h-0.5 ${['upload', 'metadata', 'audit', 'tokenize', 'success'].indexOf(step) > index
                  ? 'bg-green-500'
                  : 'bg-slate-700'
                  }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Upload Document */}
      {step === 'upload' && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <div className="text-lg font-semibold text-slate-200 mb-4">1. Upload Document</div>
          <DocumentUpload
            onFileSelect={handleFileSelect}
            onUrlInput={handleUrlInput}
            acceptedTypes=".pdf,.png,.jpg,.jpeg,.txt"
            maxSizeMB={10}
          />
        </div>
      )}

      {/* Step 2: Enter Metadata */}
      {step === 'metadata' && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <div className="text-lg font-semibold text-slate-200 mb-4">2. Asset Information</div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Asset Type</label>
              <select
                value={metadata.assetType}
                onChange={(e) =>
                  setMetadata({ ...metadata, assetType: e.target.value as any })
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="invoice">Invoice</option>
                <option value="bill">Bill</option>
                <option value="receivable">Receivable</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Issuer</label>
              <input
                type="text"
                value={metadata.issuer}
                onChange={(e) => setMetadata({ ...metadata, issuer: e.target.value })}
                placeholder={publicKey}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Amount</label>
                <input
                  type="number"
                  value={metadata.amount}
                  onChange={(e) => setMetadata({ ...metadata, amount: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Currency</label>
                <select
                  value={metadata.currency}
                  onChange={(e) => setMetadata({ ...metadata, currency: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="CSPR">CSPR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Due Date</label>
              <input
                type="date"
                value={metadata.dueDate}
                onChange={(e) => setMetadata({ ...metadata, dueDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={metadata.description}
                onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <button
              onClick={handleMetadataSubmit}
              disabled={loading || !metadata.amount || !metadata.dueDate}
              className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg text-white font-semibold transition-all"
            >
              {loading ? 'Processing...' : 'Run AI Risk Audit'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Audit Results */}
      {step === 'audit' && auditResult && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <div className="text-lg font-semibold text-slate-200 mb-4">3. AI Risk Audit Results</div>
          <RiskAuditResults
            auditResult={auditResult}
            onProceed={handleProceedToTokenize}
            onCancel={handleReset}
          />
        </div>
      )}

      {/* Step 4: Success */}
      {step === 'success' && tokenizationResult && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
          <div className="text-6xl mb-4">✅</div>
          <div className="text-2xl font-bold text-slate-100 mb-2">Tokenization Ready!</div>
          <div className="text-slate-400 mb-6">
            Asset metadata has been prepared and uploaded to IPFS
          </div>
          {tokenizationResult.ipfsHash && (
            <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
              <div className="text-sm text-slate-400 mb-1">IPFS Hash</div>
              <div className="text-cyan-400 font-mono text-sm break-all">
                {tokenizationResult.ipfsHash}
              </div>
              <a
                href={`https://gateway.pinata.cloud/ipfs/${tokenizationResult.ipfsHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 mt-2 inline-block"
              >
                View on IPFS →
              </a>
            </div>
          )}
          <div className="text-sm text-slate-500">
            Contract deployment will be available in the next phase
          </div>
        </div>
      )}
    </div>
  )
}

