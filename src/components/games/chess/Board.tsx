// src/components/games/chess/Board.tsx
import { useLayoutEffect, useState, useRef, useCallback } from "react";
import { Chessboard } from "react-chessboard";
import type { Square } from "react-chessboard/dist/chessboard/types";
import GameSession from "../../../lib/session";
import { useInitialEffect } from "../../../lib/utils";

type Props = { game: GameSession };

function Board({ game }: Props) {
  // THE DEFINITIVE FIX: Use a ref to ensure we always have the latest game instance
  // and prevent stale closures during the move animation.
  const gameRef = useRef(game);
  const [position, setPosition] = useState<string>(game.getPosition());
  const [chessboardSize, setChessboardSize] = useState<number | undefined>(undefined);

  // Synchronize the ref if the prop changes (though it shouldn't in this app)
  useLayoutEffect(() => {
    gameRef.current = game;
  }, [game]);

  // Listen for updates from the game session (AI moves, undo/redo)
  useInitialEffect(() => {
    game.onBoardChange((pos: string) => {
        setPosition(pos);
    });
  });

  useLayoutEffect(() => {
    function handleResize() {
      const display = document.getElementById("board-container");
      if (display) setChessboardSize(Math.min(720, display.offsetWidth - 20));
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Use useCallback to ensure the function reference is stable
  const onDrop = useCallback((from: Square, to: Square): boolean => {
    const currentGame = gameRef.current;
    
    if (currentGame.isGameOver()) return false;
    
    // Attempt the move
    const moveResult = currentGame.move({ from, to, promotion: 'q' });
    
    if (moveResult) {
        // We return true immediately to tell react-chessboard the move is valid.
        // The GameSession's listener will trigger setPosition, but we also 
        // update it here to be absolutely sure.
        const newPos = currentGame.getPosition();
        
        // Wrap in a tiny timeout to allow the library to finish its internal 
        // drop logic before we trigger a React re-render.
        setTimeout(() => {
            setPosition(newPos);
        }, 30);
        
        return true;
    }
    
    return false;
  }, []);

  return (
    <div id="board-container" className="w-full flex justify-center">
      <div className="w-full max-w-[600px] aspect-square">
        <Chessboard
          id="SuiChessBoard"
          boardWidth={chessboardSize}
          position={position}
          onPieceDrop={onDrop}
          animationDuration={200}
          customBoardStyle={{ 
              borderRadius: "8px", 
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)" 
          }}
        />
      </div>
    </div>
  );
}

export default Board;