export default function AuthLoader() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400">
      <div className="text-6xl mb-4 animate-bounce">🧭</div>
      <h2 className="text-xl font-semibold mb-2 text-slate-300">Connecting to SuiCompass Network...</h2>
      <p className="text-sm">Initializing secure session...</p>
      
      <div className="mt-8 w-32 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="w-full h-full bg-cyan-500 animate-[pulse_1.5s_ease-in-out_infinite]"></div>
      </div>
    </div>
  )
}
