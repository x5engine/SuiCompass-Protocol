import React, { useState, useEffect } from 'react'

interface CertificateWarningProps {
  onDismiss?: () => void
}

export const CertificateWarning: React.FC<CertificateWarningProps> = ({ onDismiss }) => {
  const [showWarning, setShowWarning] = useState(false)
  const [hasAccepted, setHasAccepted] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check if user has already accepted the certificate
    const accepted = localStorage.getItem('certificate-accepted')
    const dismissed = localStorage.getItem('certificate-dismissed')
    
    if (accepted === 'true') {
      setHasAccepted(true)
      setIsChecking(false)
      return
    }

    if (dismissed === 'true') {
      setIsChecking(false)
      return
    }

    // Check if we can reach the RPC endpoint with a real request
    const checkConnection = async () => {
      try {
        // Try a real request (not no-cors) to detect certificate errors
        const response = await fetch('https://46.224.114.187/health', {
          method: 'GET',
          // Don't use no-cors - we need to detect actual errors
        })
        
        if (response.ok) {
          // Connection works - certificate is accepted
          setHasAccepted(true)
          localStorage.setItem('certificate-accepted', 'true')
        } else {
          // Server responded but with error - not a cert issue
          setHasAccepted(true)
        }
      } catch (error: any) {
        // Connection failed - check if it's a certificate error
        const errorMsg = error?.message || String(error)
        if (errorMsg.includes('Failed to fetch') || 
            errorMsg.includes('NetworkError') ||
            errorMsg.includes('certificate') ||
            errorMsg.includes('ERR_CERT')) {
          // Likely certificate issue
          setShowWarning(true)
        } else {
          // Other error - don't show warning
          setHasAccepted(true)
        }
      } finally {
        setIsChecking(false)
      }
    }

    // Wait a bit before checking to avoid showing on initial load
    const timer = setTimeout(checkConnection, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleAccept = () => {
    // Open the health endpoint first (simpler, just JSON response)
    // This will trigger the browser's certificate acceptance dialog
    // User needs to accept cert, then can use the app
    const certUrl = 'https://46.224.114.187/health'
    window.open(certUrl, '_blank')
    
    // Show a message that they need to accept and refresh
    setTimeout(() => {
      alert('After accepting the certificate in the new tab, please refresh this page for the app to work.')
    }, 500)
  }

  if (hasAccepted || !showWarning || isChecking) {
    return null
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] max-w-lg w-full mx-4">
      <div className="bg-gradient-to-br from-amber-900/95 to-orange-900/95 border-2 border-amber-400/60 rounded-xl p-5 shadow-2xl backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="text-3xl flex-shrink-0">⚠️</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-amber-200 mb-2 text-lg">SSL Certificate Required</h3>
            <p className="text-sm text-amber-100/90 mb-4 leading-relaxed">
              This app uses a self-signed SSL certificate. Please accept it to continue.
            </p>
            <div className="flex flex-col gap-2 mb-4">
              <button
                onClick={handleAccept}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Accept Certificate
              </button>
              <button
                onClick={() => {
                  setShowWarning(false)
                  localStorage.setItem('certificate-dismissed', 'true')
                  if (onDismiss) onDismiss()
                }}
                className="text-amber-200/70 hover:text-amber-200 text-xs underline transition-colors"
              >
                Dismiss
              </button>
            </div>
            <div className="bg-amber-950/50 rounded-lg p-3 text-xs text-amber-200/80">
              <p className="font-semibold mb-1.5">Quick Steps:</p>
              <ol className="list-decimal list-inside space-y-1 ml-1">
                <li>Click "Accept Certificate" above</li>
                <li>In the new tab, click <strong>"Advanced"</strong></li>
                <li>Click <strong>"Proceed to 46.224.114.187"</strong></li>
                <li>Return here and refresh</li>
              </ol>
            </div>
          </div>
          <button
            onClick={() => {
              setShowWarning(false)
              localStorage.setItem('certificate-dismissed', 'true')
              if (onDismiss) onDismiss()
            }}
            className="text-amber-300/60 hover:text-amber-200 text-xl leading-none flex-shrink-0 transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}

