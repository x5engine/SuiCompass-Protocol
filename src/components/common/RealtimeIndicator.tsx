/**
 * Real-time Data Status Indicator
 * Shows whether real-time updates are active
 */

interface RealtimeIndicatorProps {
  isActive: boolean
  className?: string
}

export default function RealtimeIndicator({ isActive, className = '' }: RealtimeIndicatorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
      <span className="text-xs text-slate-400">
        {isActive ? 'Live' : 'Offline'}
      </span>
    </div>
  )
}

