import { useState, useEffect } from 'react'
import { showNotification } from '../ui/Notification'

interface TutorialStep {
  id: string
  title: string
  description: string
  target?: string // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right'
  action?: () => void
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: '👻 Welcome to CasperGhost!',
    description: 'Your AI-powered DeFi assistant for Casper Network. Let\'s get you started!',
  },
  {
    id: 'chat',
    title: '💬 Chat Interface',
    description: 'Type natural language commands here. Try "Stake 100 CSPR" or "Show my portfolio"',
    target: 'input[placeholder*="Ask me"]',
    position: 'top',
  },
  {
    id: 'suggestions',
    title: '✨ Quick Actions',
    description: 'Click these example prompts to get started quickly. They\'ll help you learn the commands!',
    target: 'button[class*="Stake 100 CSPR"], button:has-text("Stake 100")',
    position: 'top',
  },
  {
    id: 'portfolio',
    title: '📊 Portfolio Sidebar',
    description: 'View your staking balance, rewards, and available CSPR here. Updates in real-time!',
    target: 'aside[class*="border-r"]',
    position: 'left',
  },
  {
    id: 'wallet',
    title: '🔐 Wallet Status',
    description: 'Your connected wallet address is shown here. Click disconnect to switch wallets.',
    target: 'button[class*="Disconnect"], nav button:last-child',
    position: 'bottom',
  },
  {
    id: 'complete',
    title: '🎉 You\'re All Set!',
    description: 'Start chatting to manage your DeFi operations. The AI understands natural language!',
  },
]

interface OnboardingTutorialProps {
  isVisible: boolean
  onComplete: () => void
}

export default function OnboardingTutorial({ isVisible, onComplete }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [tutorialPosition, setTutorialPosition] = useState<React.CSSProperties>({
    position: 'fixed',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
  })
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    if (isVisible && currentStep === 0) {
      // Play epic sound for tutorial start
      showNotification({
        type: 'success',
        title: '🎉 Tutorial Started!',
        message: 'Let\'s explore CasperGhost together',
        sound: 'epic',
        duration: 3000,
      })
      setOverlayVisible(true)
    }
  }, [isVisible, currentStep])

  // Recalculate positions when step changes
  useEffect(() => {
    if (!isVisible) return

    const step = tutorialSteps[currentStep]
    let newHighlightStyle: React.CSSProperties = {}
    let newTutorialPosition: React.CSSProperties = {
      position: 'fixed',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
    }

    if (step.target) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        try {
          const element = document.querySelector(step.target!)
          if (element) {
            const rect = element.getBoundingClientRect()
            
            // Calculate highlight
            newHighlightStyle = {
              position: 'fixed',
              left: `${rect.left - 8}px`,
              top: `${rect.top - 8}px`,
              width: `${rect.width + 16}px`,
              height: `${rect.height + 16}px`,
              zIndex: 9998,
            }
            
            // Calculate tutorial card position
            const cardWidth = 320
            const cardHeight = 300
            const spacing = 16
            const viewportWidth = window.innerWidth
            const viewportHeight = window.innerHeight

            switch (step.position) {
              case 'top':
                newTutorialPosition = {
                  position: 'fixed',
                  left: `${Math.max(20, Math.min(rect.left + rect.width / 2, viewportWidth - cardWidth - 20))}px`,
                  top: `${Math.max(20, rect.top - cardHeight - spacing)}px`,
                  transform: 'translateX(-50%)',
                }
                break
              case 'bottom':
                newTutorialPosition = {
                  position: 'fixed',
                  left: `${Math.max(20, Math.min(rect.left + rect.width / 2, viewportWidth - cardWidth - 20))}px`,
                  top: `${Math.min(viewportHeight - cardHeight - 20, rect.bottom + spacing)}px`,
                  transform: 'translateX(-50%)',
                }
                break
              case 'left':
                newTutorialPosition = {
                  position: 'fixed',
                  left: `${Math.max(20, rect.left - cardWidth - spacing)}px`,
                  top: `${Math.max(20, Math.min(rect.top + rect.height / 2, viewportHeight - cardHeight - 20))}px`,
                  transform: 'translateY(-50%)',
                }
                break
              case 'right':
                newTutorialPosition = {
                  position: 'fixed',
                  left: `${Math.min(viewportWidth - cardWidth - 20, rect.right + spacing)}px`,
                  top: `${Math.max(20, Math.min(rect.top + rect.height / 2, viewportHeight - cardHeight - 20))}px`,
                  transform: 'translateY(-50%)',
                }
                break
              default:
                newTutorialPosition = {
                  position: 'fixed',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }
            }
          }
        } catch (e) {
          // Invalid selector, use center position
          newTutorialPosition = {
            position: 'fixed',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }
        }
        
        setHighlightStyle(newHighlightStyle)
        setTutorialPosition(newTutorialPosition)
      }, 100)
    } else {
      // No target, center the tutorial
      setHighlightStyle({})
      setTutorialPosition({
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      })
    }
  }, [currentStep, isVisible])

  if (!isVisible || currentStep >= tutorialSteps.length) {
    return null
  }

  const step = tutorialSteps[currentStep]
  const isLastStep = currentStep === tutorialSteps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      showNotification({
        type: 'success',
        title: '🎉 Tutorial Complete!',
        message: 'You\'re ready to use CasperGhost!',
        sound: 'epic',
        duration: 3000,
      })
      setOverlayVisible(false)
      setTimeout(() => {
        onComplete()
      }, 500)
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleSkip = () => {
    showNotification({
      type: 'info',
      title: 'Tutorial Skipped',
      message: 'You can always access help from the menu',
      duration: 2000,
    })
    setOverlayVisible(false)
    onComplete()
  }

  return (
    <>
      {/* Overlay */}
      {overlayVisible && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9997] transition-opacity duration-300"
          onClick={!isLastStep ? handleNext : undefined}
        />
      )}

      {/* Highlight Box */}
      {step.target && Object.keys(highlightStyle).length > 0 && (
        <div
          className="fixed rounded-xl border-4 border-cyan-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] pointer-events-none z-[9998] animate-pulse"
          style={highlightStyle}
        />
      )}

      {/* Tutorial Card */}
      <div
        className="fixed z-[9999] transition-all duration-300"
        style={tutorialPosition}
        key={currentStep} // Force re-render on step change
      >
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-500/50 rounded-2xl p-6 shadow-2xl min-w-[320px] max-w-md backdrop-blur-xl">
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider">
              Step {currentStep + 1} of {tutorialSteps.length}
            </div>
            <button
              onClick={handleSkip}
              className="text-slate-400 hover:text-slate-200 transition-colors text-sm"
            >
              Skip
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-4 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-teal-600 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <h3 className="text-xl font-bold text-slate-100 mb-2">{step.title}</h3>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">{step.description}</p>

          {/* Actions */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl transition-colors text-sm font-medium"
              >
                ← Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white rounded-xl transition-all font-semibold text-sm shadow-lg shadow-cyan-500/25 transform hover:scale-105 active:scale-95"
            >
              {isLastStep ? 'Get Started! 🚀' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

