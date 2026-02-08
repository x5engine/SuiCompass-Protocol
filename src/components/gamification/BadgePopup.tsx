import { useEffect, useState } from 'react'
import { useGamificationStore } from '../../stores/gamification-store'

export default function BadgePopup() {
  const { recentUnlock, clearRecentUnlock } = useGamificationStore()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (recentUnlock) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(clearRecentUnlock, 300) // Wait for fade out
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [recentUnlock, clearRecentUnlock])

  if (!recentUnlock && !visible) return null

  return (
    <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 transform ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'}`}>
      <div className="bg-slate-900/90 border border-yellow-500/50 p-6 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.3)] backdrop-blur-xl flex flex-col items-center text-center min-w-[300px]">
        <div className="text-sm font-bold text-yellow-500 uppercase tracking-widest mb-2 animate-pulse">Badge Unlocked!</div>
        <div className="text-5xl mb-3 animate-bounce">{recentUnlock?.icon}</div>
        <h3 className="text-xl font-bold text-white mb-1">{recentUnlock?.name}</h3>
        <p className="text-sm text-slate-400">{recentUnlock?.description}</p>
        
        <div className="mt-4 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-500 animate-[progress_4s_linear]"></div>
        </div>
      </div>
    </div>
  )
}
