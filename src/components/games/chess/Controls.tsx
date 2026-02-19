// src/components/games/chess/Controls.tsx
import React from "react";
import GameSession from "../../../lib/session";
import { useDashboardStore } from "../../../stores/dashboard-store";

type Props = { game: GameSession };

function Controls({ game }: Props): JSX.Element {
  const { setActiveTab } = useDashboardStore();

  return (
    <div className="flex justify-center gap-4 mt-4">
      <button 
        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white font-medium" 
        onClick={() => game.reset()}
      >
        Reset
      </button>
      <button 
        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white font-medium" 
        onClick={() => game.undo()}
      >
        {"<"}
      </button>
      <button 
        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white font-medium" 
        onClick={() => game.redo()}
      >
        {">"}
      </button>
      <button 
        className="px-4 py-2 bg-red-900/50 hover:bg-red-900/80 border border-red-800 rounded-lg transition-colors text-red-200 font-medium ml-4" 
        onClick={() => setActiveTab(null)}
      >
        Exit
      </button>
    </div>
  );
}

export default Controls;