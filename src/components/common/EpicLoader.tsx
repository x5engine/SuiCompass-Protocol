import { useEffect } from 'react';

export default function EpicLoader() {
  useEffect(() => {
    // Optional: Add a subtle hum sound on mount if desired, but might be too much.
    // For now, just visual.
  }, []);

  return (
    <div className="flex items-center gap-2 p-2">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-ping"></div>
        <div className="absolute inset-0 border-2 border-t-cyan-400 border-r-transparent border-b-cyan-600 border-l-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-2 bg-cyan-500/20 rounded-full animate-pulse"></div>
      </div>
      <span className="text-sm text-cyan-400 font-mono animate-pulse">Processing...</span>
    </div>
  );
}
