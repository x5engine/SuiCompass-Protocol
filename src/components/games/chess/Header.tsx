// src/components/games/chess/Header.tsx
import React, { useState } from "react";
import GameSession from "../../../lib/session";
import { GameSessionTimer } from "../../../lib/types";
import { secondsToTime, useInitialEffect } from "../../../lib/utils";
import { useNavigate } from "react-router-dom";
import { useDashboardStore } from "../../../stores/dashboard-store";

type Props = { game: GameSession };

function Header({ game }: Props) {
  const [winner, setWinner] = useState<string | null>(game.getWinner());
  const [time, setTime] = useState<GameSessionTimer>(game.timer);
  const { setActiveTab } = useDashboardStore();

  useInitialEffect(() => {
    game.onTimerChange((timer: GameSessionTimer) => setTime(timer));
    game.onBoardChange(() => setWinner(game.getWinner()));
  });

  const handleClose = () => {
      setActiveTab(null);
  };

  return (
    <div className="w-full flex flex-col gap-4 mb-4">
        <div className="flex justify-between items-center w-full px-2">
            <h1 className="text-2xl font-bold text-white">Sui Chess</h1>
            <button 
                onClick={handleClose}
                className="text-slate-400 hover:text-white px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm font-medium"
            >
                ✕ Close Game
            </button>
        </div>
        
        <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${game.getOrientation() === 'white' && !winner ? 'bg-white shadow-[0_0_10px_white]' : 'bg-slate-500'}`}></div>
                <div className="flex flex-col">
                    <span className="text-xs text-slate-400 uppercase font-bold">White</span>
                    <span className="font-mono text-lg text-white leading-none">{secondsToTime(time.white)}</span>
                </div>
            </div>
            
            <div className="text-sm font-bold text-slate-500">VS</div>

            <div className="flex items-center gap-3 text-right">
                <div className="flex flex-col">
                    <span className="text-xs text-slate-400 uppercase font-bold">Black</span>
                    <span className="font-mono text-lg text-white leading-none">{secondsToTime(time.black)}</span>
                </div>
                <div className={`w-3 h-3 rounded-full ${game.getOrientation() === 'black' && !winner ? 'bg-white shadow-[0_0_10px_white]' : 'bg-slate-500'}`}></div>
            </div>
        </div>

        {winner && (
            <div className="bg-cyan-500/20 border border-cyan-500/50 p-3 rounded-lg text-center text-cyan-200 animate-pulse font-bold">
                {winner === 'Draw' ? 'Game Over! It\'s a Draw.' : `Game Over! Winner: ${winner}`}
            </div>
        )}
    </div>
  );
}

export default Header;
