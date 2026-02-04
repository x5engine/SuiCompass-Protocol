import { useEffect, useState } from 'react'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
  duration?: number
  sound?: 'success' | 'error' | 'info' | 'warning' | 'epic'
}

interface NotificationProps {
  notification: Notification
  onClose: (id: string) => void
}

// Sound effects using Web Audio API
const playSound = (type: Notification['sound'] = 'info') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // Different sound patterns for different types
    const sounds: Record<string, number[]> = {
      success: [523.25, 659.25, 783.99], // C, E, G (C major chord)
      error: [220, 196, 174.61], // Lower, descending
      info: [440, 523.25], // A, C
      warning: [440, 493.88, 523.25], // A, B, C
      epic: [523.25, 659.25, 783.99, 1046.50, 1318.51], // Epic ascending chord
    }
    
    const frequencies = sounds[type] || sounds.info
    const duration = 0.15
    const gainValue = 0.3
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = freq
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(gainValue, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration + index * 0.05)
      
      oscillator.start(audioContext.currentTime + index * 0.05)
      oscillator.stop(audioContext.currentTime + duration + index * 0.05)
    })
  } catch (error) {
    console.warn('Could not play sound:', error)
  }
}

export function NotificationToast({ notification, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Play sound on mount
    if (notification.sound) {
      playSound(notification.sound)
    }
    
    // Animate in
    setTimeout(() => setIsVisible(true), 10)
    
    // Auto-dismiss
    const duration = notification.duration || 4000
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => onClose(notification.id), 300)
    }, duration)
    
    return () => clearTimeout(timer)
  }, [notification, onClose])

  const typeStyles = {
    success: {
      bg: 'bg-gradient-to-r from-emerald-500/20 to-green-500/20',
      border: 'border-emerald-500/50',
      icon: '✅',
      glow: 'shadow-lg shadow-emerald-500/30',
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500/20 to-rose-500/20',
      border: 'border-red-500/50',
      icon: '❌',
      glow: 'shadow-lg shadow-red-500/30',
    },
    info: {
      bg: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20',
      border: 'border-cyan-500/50',
      icon: 'ℹ️',
      glow: 'shadow-lg shadow-cyan-500/30',
    },
    warning: {
      bg: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20',
      border: 'border-amber-500/50',
      icon: '⚠️',
      glow: 'shadow-lg shadow-amber-500/30',
    },
  }

  const style = typeStyles[notification.type]

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 min-w-[320px] max-w-md
        transform transition-all duration-300 ease-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${style.bg} ${style.border} ${style.glow}
        backdrop-blur-xl border rounded-2xl p-4
        cursor-pointer hover:scale-105 active:scale-95
      `}
      onClick={() => {
        setIsExiting(true)
        setTimeout(() => onClose(notification.id), 300)
      }}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0 animate-bounce">{style.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-100 text-sm mb-1">
            {notification.title}
          </div>
          {notification.message && (
            <div className="text-xs text-slate-300 leading-relaxed">
              {notification.message}
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsExiting(true)
            setTimeout(() => onClose(notification.id), 300)
          }}
          className="text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0"
        >
          ✕
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="mt-3 h-1 bg-slate-700/50 rounded-full overflow-hidden">
        <div
          className={`h-full ${style.bg.replace('/20', '')} transition-all`}
          style={{
            width: isExiting ? '0%' : '100%',
            transitionDuration: `${notification.duration || 4000}ms`,
            transitionTimingFunction: 'linear',
          }}
        />
      </div>
    </div>
  )
}

// Notification Provider/Manager
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(7)
    setNotifications((prev) => [...prev, { ...notification, id }])
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  // Expose addNotification globally
  useEffect(() => {
    ;(window as any).showNotification = addNotification
    return () => {
      delete (window as any).showNotification
    }
  }, [])

  return (
    <>
      {children}
      <div className="fixed top-0 right-0 z-50 pointer-events-none">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            className="pointer-events-auto"
            style={{ marginTop: `${index * 90}px` }}
          >
            <NotificationToast
              notification={notification}
              onClose={removeNotification}
            />
          </div>
        ))}
      </div>
    </>
  )
}

// Helper function to show notifications
export const showNotification = (notification: Omit<Notification, 'id'>) => {
  if (typeof window !== 'undefined' && (window as any).showNotification) {
    ;(window as any).showNotification(notification)
  } else {
    console.warn('Notification system not initialized')
  }
}

