/**
 * Contract Template Selector Component
 */

import type { ContractTemplate } from '../../types/contract-templates'
import { CONTRACT_TEMPLATES } from '../../contracts/templates'

interface ContractTemplateSelectorProps {
  selectedTemplateId?: string
  onSelect: (template: ContractTemplate) => void
}

export default function ContractTemplateSelector({
  selectedTemplateId,
  onSelect,
}: ContractTemplateSelectorProps) {
  const categories = ['defi', 'nft', 'token', 'utility', 'custom'] as const

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const templates = CONTRACT_TEMPLATES.filter((t) => t.category === category)
        if (templates.length === 0) return null

        return (
          <div key={category}>
            <div className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">
              {category}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onSelect(template)}
                  className={`
                    p-4 rounded-xl border text-left transition-all
                    ${
                      selectedTemplateId === template.id
                        ? 'bg-cyan-500/20 border-cyan-500/50 ring-2 ring-cyan-500/30'
                        : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{template.icon || '📦'}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-200 mb-1">{template.name}</div>
                      <div className="text-sm text-slate-400 mb-2">{template.description}</div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>{template.entryPoints.length} entry points</span>
                        {template.estimatedGas && (
                          <span>~{(template.estimatedGas / 1e9).toFixed(1)} CSPR</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

