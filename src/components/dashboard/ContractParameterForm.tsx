/**
 * Contract Parameter Form Component
 * Dynamically generates form fields from template parameters
 */

import { useState, useEffect } from 'react'
import type { ContractTemplate, TemplateParameter } from '../../types/contract-templates'

interface ContractParameterFormProps {
  template: ContractTemplate
  initialValues?: Record<string, any>
  onChange: (values: Record<string, any>) => void
  onValidate?: (errors: Record<string, string>) => void
}

export default function ContractParameterForm({
  template,
  initialValues,
  onChange,
  onValidate,
}: ContractParameterFormProps) {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const defaults: Record<string, any> = {}
    template.parameters.forEach((param) => {
      defaults[param.name] = initialValues?.[param.name] ?? param.defaultValue ?? ''
    })
    return defaults
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    onChange(values)
  }, [values, onChange])

  useEffect(() => {
    if (onValidate) {
      onValidate(errors)
    }
  }, [errors, onValidate])

  const handleChange = (param: TemplateParameter, value: any) => {
    const newValues = { ...values, [param.name]: value }
    setValues(newValues)

    // Validate
    const newErrors = { ...errors }
    if (param.validation) {
      const validationResult = param.validation(value)
      if (!validationResult.valid) {
        newErrors[param.name] = validationResult.error || 'Invalid value'
      } else {
        delete newErrors[param.name]
      }
    }
    setErrors(newErrors)
  }

  const renderInput = (param: TemplateParameter) => {
    const value = values[param.name] ?? ''
    const error = errors[param.name]

    switch (param.type) {
      case 'bool':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleChange(param, e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
            />
            <span className="text-sm text-slate-300">{param.description}</span>
          </label>
        )

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(param, parseFloat(e.target.value) || 0)}
            placeholder={param.defaultValue?.toString()}
            step={param.name.includes('percentage') || param.name.includes('ratio') ? '0.1' : '1'}
            className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-slate-100 focus:outline-none focus:ring-2 ${
              error ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-cyan-500'
            }`}
          />
        )

      case 'key':
      case 'address':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(param, e.target.value)}
            placeholder={param.defaultValue?.toString() || 'Enter public key or address'}
            className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 ${
              error ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-cyan-500'
            }`}
          />
        )

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(param, e.target.value)}
            placeholder={param.defaultValue?.toString()}
            className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-slate-100 focus:outline-none focus:ring-2 ${
              error ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-cyan-500'
            }`}
          />
        )
    }
  }

  return (
    <div className="space-y-4">
      {template.parameters.map((param) => (
        <div key={param.name}>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {param.name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            {param.required && <span className="text-red-400 ml-1">*</span>}
          </label>
          {renderInput(param)}
          {errors[param.name] && (
            <div className="text-xs text-red-400 mt-1">{errors[param.name]}</div>
          )}
          {!errors[param.name] && param.description && (
            <div className="text-xs text-slate-500 mt-1">{param.description}</div>
          )}
        </div>
      ))}
    </div>
  )
}

