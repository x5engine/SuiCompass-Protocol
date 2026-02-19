import React from 'react';

export default function PlaceholderPage({ title, emoji }: { title: string, emoji: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
      <div className="text-9xl mb-8 animate-float">{emoji}</div>
      <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
      <p className="text-lg mb-8 max-w-md text-center">
        This "Top-Notch" feature is currently being integrated with the new 
        <span className="text-cyan-400 font-mono mx-2">suicompass</span> 
        package.
      </p>
      <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 font-mono text-sm text-emerald-400">
        Status: Contract Deployed 🟢
      </div>
    </div>
  );
}
