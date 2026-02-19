// src/lib/stockfish-engine.ts

export class Engine {
  private worker: Worker;
  private bestMove: string | null = null;
  private evaluation: string | null = null;
  
  onBestMove: (move: string, evalStr: string) => void = () => {};

  constructor() {
    this.worker = new Worker('/stockfish.wasm.js');
    
    this.worker.onmessage = (e: MessageEvent) => {
      const message = e.data;
      
      if (message.startsWith('info depth')) {
        const match = message.match(/score (cp|mate) (-?\d+)/);
        if (match) {
          const score = parseInt(match[2], 10) / 100;
          this.evaluation = (match[1] === 'mate' ? `Mate in ${match[2]}` : `Eval: ${score.toFixed(2)}`);
        }
      }

      if (message.startsWith('bestmove')) {
        const move = message.split(' ')[1];
        this.bestMove = move;
        if (this.evaluation) {
          this.onBestMove(this.bestMove, this.evaluation);
        }
      }
    };
    
    this.worker.postMessage('uci');
    this.worker.postMessage('isready');
  }

  evaluatePosition(fen: string, depth: number = 15) {
    this.worker.postMessage(`position fen ${fen}`);
    this.worker.postMessage(`go depth ${depth}`);
  }

  terminate() {
    this.worker.terminate();
  }
}
