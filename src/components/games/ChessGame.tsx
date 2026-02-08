import { useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useGamificationStore } from '../../stores/gamification-store';
import { playSound } from '../../utils/sound-effects';

export default function ChessGame() {
  const [game, setGame] = useState(new Chess());
  const { awardPoints } = useGamificationStore();

  function makeRandomMove() {
    const possibleMoves = game.moves();
    if (game.isGameOver() || game.isDraw() || possibleMoves.length === 0) return;
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    const move = possibleMoves[randomIndex];
    setGame(g => {
      const update = new Chess(g.fen());
      update.move(move);
      return update;
    });
    playSound('hover');
  }

  function onDrop(sourceSquare: string, targetSquare: string) {
    const gameCopy = new Chess(game.fen());
    try {
      const move = gameCopy.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
      if (move === null) return false;
      setGame(gameCopy);
      playSound('click');
      setTimeout(makeRandomMove, 200);
      if (gameCopy.isCheckmate()) {
        awardPoints('earn', 500);
        alert("Checkmate! You win!");
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/50 rounded-3xl border border-slate-800">
      <h2 className="text-2xl font-bold text-white mb-4">Sui Chess</h2>
      <div className="w-full max-w-[400px] aspect-square">
        <Chessboard position={game.fen()} onPieceDrop={onDrop} />
      </div>
      <button onClick={() => setGame(new Chess())} className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700">
        Reset Game
      </button>
    </div>
  );
}