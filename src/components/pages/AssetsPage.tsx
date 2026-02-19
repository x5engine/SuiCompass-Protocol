import React from 'react';
import RWATokenization from '../dashboard/RWATokenization';

export default function AssetsPage() {
    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
            <header className="mb-8">
                <h1 className="text-4xl font-black text-white mb-2">RWA Studio</h1>
                <p className="text-slate-400">Tokenize invoices, real estate, and bonds with AI-powered risk auditing.</p>
            </header>

            {/* Reuse the existing robust component */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                <RWATokenization />
            </div>
        </div>
    );
}
