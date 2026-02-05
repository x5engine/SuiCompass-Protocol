/**
 * Contract Deployer Dashboard Tab
 * Main component for deploying contracts from templates
 */

import { useState } from 'react'
import { useWallet } from '../../blockchain/WalletProvider'
import { useContractDeployment } from '../../hooks/useContractDeployment'
import { showNotification } from '../ui/Notification'
import ContractTemplateSelector from './ContractTemplateSelector'
import ContractParameterForm from './ContractParameterForm'
import DeploymentStatus from './DeploymentStatus'
import type { ContractTemplate, DeploymentRequest } from '../../types/contract-templates'

type Step = 'select' | 'configure' | 'deploy' | 'status'

export default function ContractDeployer() {
  const { isConnected, publicKey } = useWallet()
  const { deployContract, loading, deploymentResult } = useContractDeployment()
  const [step, setStep] = useState<Step>('select')
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null)
  const [parameters, setParameters] = useState<Record<string, any>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  if (!isConnected || !publicKey) {
    return (
      <div className="p-6 text-center text-slate-400">
        <div className="text-4xl mb-4">🔒</div>
        <div>Please connect your wallet to deploy contracts</div>
      </div>
    )
  }

  const handleTemplateSelect = (template: ContractTemplate) => {
    setSelectedTemplate(template)
    setParameters({})
    setFormErrors({})
    setStep('configure')
  }

  const handleParametersChange = (values: Record<string, any>) => {
    setParameters(values)
  }

  const handleFormValidate = (errors: Record<string, string>) => {
    setFormErrors(errors)
  }

  const handleDeploy = async () => {
    if (!selectedTemplate) return

    // Check for errors
    if (Object.keys(formErrors).length > 0) {
      showNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix form errors before deploying',
      })
      return
    }

    // Check required parameters
    const missingRequired = selectedTemplate.parameters.filter(
      (p) => p.required && (parameters[p.name] === undefined || parameters[p.name] === '')
    )

    if (missingRequired.length > 0) {
      showNotification({
        type: 'error',
        title: 'Missing Required Fields',
        message: `Please fill in: ${missingRequired.map((p) => p.name).join(', ')}`,
      })
      return
    }

    setStep('deploy')

    const request: DeploymentRequest = {
      templateId: selectedTemplate.id,
      parameters,
      chainName: 'sui-mainnet',
    }

    const result = await deployContract(request)

    if (result?.success) {
      setStep('status')
    } else {
      setStep('configure') // Go back to configure on error
    }
  }

  const handleReset = () => {
    setStep('select')
    setSelectedTemplate(null)
    setParameters({})
    setFormErrors({})
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-100">Deploy Smart Contract</h2>
        {step !== 'select' && (
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
        {['select', 'configure', 'deploy', 'status'].map((s, index) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === s
                  ? 'bg-cyan-500 text-white'
                  : ['select', 'configure', 'deploy', 'status'].indexOf(step) > index
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}
            >
              {index + 1}
            </div>
            {index < 3 && (
              <div
                className={`w-12 h-0.5 ${['select', 'configure', 'deploy', 'status'].indexOf(step) > index
                    ? 'bg-green-500'
                    : 'bg-slate-700'
                  }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Template */}
      {step === 'select' && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <div className="text-lg font-semibold text-slate-200 mb-4">1. Choose Contract Template</div>
          <ContractTemplateSelector
            selectedTemplateId={selectedTemplate?.id}
            onSelect={handleTemplateSelect}
          />
        </div>
      )}

      {/* Step 2: Configure Parameters */}
      {step === 'configure' && selectedTemplate && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-lg font-semibold text-slate-200">2. Configure Parameters</div>
              <div className="text-sm text-slate-400 mt-1">{selectedTemplate.name}</div>
            </div>
          </div>

          <ContractParameterForm
            template={selectedTemplate}
            initialValues={parameters}
            onChange={handleParametersChange}
            onValidate={handleFormValidate}
          />

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep('select')}
              className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleDeploy}
              disabled={loading || Object.keys(formErrors).length > 0}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg text-white font-semibold transition-all"
            >
              {loading ? 'Deploying...' : 'Deploy Contract'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Deploying */}
      {step === 'deploy' && loading && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
          <div className="animate-spin text-cyan-400 text-4xl mb-4">⏳</div>
          <div className="text-lg font-semibold text-slate-200">Deploying Contract...</div>
          <div className="text-sm text-slate-400 mt-2">
            Please sign the transaction in your wallet
          </div>
        </div>
      )}

      {/* Step 4: Deployment Status */}
      {step === 'status' && deploymentResult && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <div className="text-lg font-semibold text-slate-200 mb-4">3. Deployment Status</div>
          <DeploymentStatus
            deploymentResult={deploymentResult}
            onComplete={() => {
              // Deployment complete
            }}
          />
        </div>
      )}
    </div>
  )
}

