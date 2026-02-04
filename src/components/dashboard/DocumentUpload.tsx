/**
 * Document Upload Component
 * Handles file uploads for RWA tokenization
 */

import { useState, useRef } from 'react'

interface DocumentUploadProps {
  onFileSelect: (file: File) => void
  onUrlInput?: (url: string) => void
  acceptedTypes?: string
  maxSizeMB?: number
}

export default function DocumentUpload({
  onFileSelect,
  onUrlInput,
  acceptedTypes = '.pdf,.png,.jpg,.jpeg,.txt',
  maxSizeMB = 10,
}: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      alert(`File size exceeds ${maxSizeMB}MB limit`)
      return
    }

    setSelectedFile(file)
    onFileSelect(file)
  }

  const handleUrlSubmit = () => {
    if (urlInput.trim() && onUrlInput) {
      onUrlInput(urlInput.trim())
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="space-y-4">
      {/* File Upload */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-colors
          ${dragActive ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 bg-slate-800/50'}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileInput}
          className="hidden"
        />

        {selectedFile ? (
          <div className="space-y-2">
            <div className="text-4xl mb-2">📄</div>
            <div className="font-medium text-slate-200">{selectedFile.name}</div>
            <div className="text-sm text-slate-400">{formatFileSize(selectedFile.size)}</div>
            <button
              onClick={() => {
                setSelectedFile(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl mb-2">📤</div>
            <div className="text-slate-300 mb-1">Drag & drop document here</div>
            <div className="text-sm text-slate-400 mb-4">or</div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 transition-colors"
            >
              Browse Files
            </button>
            <div className="text-xs text-slate-500 mt-2">
              Accepted: {acceptedTypes} (max {maxSizeMB}MB)
            </div>
          </div>
        )}
      </div>

      {/* URL Input (Optional) */}
      {onUrlInput && (
        <div className="border-t border-slate-700 pt-4">
          <div className="text-sm text-slate-400 mb-2">Or provide document URL:</div>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/document.pdf"
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim()}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg text-white font-semibold transition-colors"
            >
              Use URL
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

