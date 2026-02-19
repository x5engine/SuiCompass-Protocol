// src/components/games/ChessGame.tsx
import { useState, useEffect } from "react";
import GameSession from "../../lib/session";
import Board from "./chess/Board";
import Controls from "./chess/Controls";
import Header from "./chess/Header";
import { useDashboardStore } from "../../stores/dashboard-store";

export default function ChessGame() {
  const [game, setGame] = useState<GameSession | undefined>(undefined);
  const { setActiveTab } = useDashboardStore();

  useEffect(() => {
    setGame(new GameSession(true));
  }, []);

  if (!game) return null;

  return (
    <div className="flex flex-col items-center p-4 w-full relative">
      {/* Absolute Close Button as Failsafe */}
      <button 
        onClick={() => setActiveTab(null)}
        className="absolute top-0 right-0 m-2 z-50 text-slate-400 hover:text-white bg-slate-900/80 px-3 py-1 rounded-full text-sm border border-slate-700"
      >
        ✕ Exit
      </button>

      <Header game={game} />
      <Board game={game} />
      <Controls game={game} />
    </div>
  );
}