// src/lib/session.ts
import { Chess, Move } from "chess.js";
import { GameSessionTimer, GameSessionHistory, GameSessionStorage, GameSessionListeners } from "./types";

const initialTimer: GameSessionTimer = { white: 600, black: 600 };
const STARTING_POSITION = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default class GameSession {
  private chess: Chess;
  private listeners: GameSessionListeners;
  public timer: GameSessionTimer;
  private history: GameSessionHistory;
  private timeout?: NodeJS.Timeout;
  private currentIndex: number;

  constructor(loadFromStorage?: boolean) {
    let session: GameSessionStorage | undefined;
    
    if (typeof localStorage !== 'undefined' && loadFromStorage) {
        try {
            const stored = localStorage.getItem("gameSession");
            if (stored) session = JSON.parse(stored);
        } catch (e) {
            console.error("Failed to load session", e);
        }
    }

    this.chess = new Chess(session?.position || STARTING_POSITION);
    
    const storedTimer = session?.timer;
    if (storedTimer && storedTimer.white > 0 && storedTimer.black > 0) {
        this.timer = storedTimer;
    } else {
        this.timer = { ...initialTimer };
    }

    this.history = session?.history || [{ timer: { ...initialTimer }, position: this.chess.fen() }];
    this.currentIndex = session?.currentIndex || 0;
    this.listeners = { move: [], timer: [] };
    
    if (this.isGameOver()) {
        this.reset();
    } else {
        this.startTimer();
    }
  }
  
  private trigger<E extends keyof GameSessionListeners>(event: E, data: Parameters<GameSessionListeners[E][number]>[0]) {
    if (this.listeners[event]) {
        this.listeners[event].forEach((listener) => listener(data as any));
    }
  }

  private save() {
    if (typeof localStorage === 'undefined') return;
    const game: GameSessionStorage = {
      position: this.history[this.currentIndex].position,
      timer: this.timer,
      history: this.history,
      currentIndex: this.currentIndex,
    };
    localStorage.setItem("gameSession", JSON.stringify(game));
  }
  
  private startTimer() {
    this.killTimer();
    if (typeof window === 'undefined') return;
    
    this.timeout = setInterval(() => {
      if (!this.isGameOver()) {
        const turn = this.getOrientation();
        if (this.timer[turn] > 0) {
            this.timer[turn]--;
            this.trigger("timer", this.timer);
            this.save();
        }
      } else {
          this.killTimer();
      }
    }, 1000);
  }

  private killTimer() { if (this.timeout) clearInterval(this.timeout); }

  public onBoardChange(handler: (pos: string) => void) { this.listeners.move.push(handler); }
  public onTimerChange(handler: (timer: GameSessionTimer) => void) { this.listeners.timer.push(handler); }

  public getPosition(): string { return this.chess.fen(); }
  
  public isGameOver(): boolean { 
      return this.timer.white === 0 || this.timer.black === 0 || this.chess.isGameOver(); 
  }
  
  public getOrientation(): 'white' | 'black' { return this.chess.turn() === 'w' ? 'white' : 'black'; }
  
  public getWinner(): string | null {
      if (this.timer.white === 0) return 'Black';
      if (this.timer.black === 0) return 'White';
      if (this.chess.isCheckmate()) return this.chess.turn() === 'w' ? 'Black' : 'White';
      if (this.chess.isDraw()) return 'Draw';
      return null;
  }

  public move(move: { from: string; to: string; promotion?: string }): Move | null {
    try {
        if (this.isGameOver()) return null;

        let moved: Move | null = null;

        // Attempt 1: Try the move exactly as provided
        try {
            moved = this.chess.move(move);
        } catch (e) {
            // Ignore strict validation errors for now
        }

        // Attempt 2: If failed and no promotion was provided, try auto-promoting to Queen
        if (!moved && !move.promotion) {
             try { 
                 moved = this.chess.move({ ...move, promotion: 'q' }); 
             } catch (e) {}
        }

        if (!moved) return null;

        // Move was successful
        if (this.currentIndex < this.history.length - 1) {
          this.history = this.history.slice(0, this.currentIndex + 1);
        }
        
        this.history.push({ timer: this.timer, position: this.getPosition() });
        this.currentIndex++;
        
        this.trigger("move", this.getPosition());
        this.save();
        return moved;
    } catch (error) {
        console.error("Move error:", error);
        return null;
    }
  }

  public reset() {
    this.killTimer();
    this.chess = new Chess(STARTING_POSITION);
    this.timer = { ...initialTimer };
    this.history = [{ timer: { ...initialTimer }, position: this.getPosition() }];
    this.currentIndex = 0;
    this.trigger("move", this.getPosition());
    this.trigger("timer", this.timer);
    this.save();
    this.startTimer();
  }

  public undo() {
    if (this.currentIndex === 0) return;
    this.currentIndex--;
    const state = this.history[this.currentIndex];
    this.chess = new Chess(state.position);
    this.timer = state.timer;
    this.trigger("move", state.position);
    this.trigger("timer", this.timer);
    this.save();
  }

  public redo() {
    if (this.currentIndex >= this.history.length - 1) return;
    this.currentIndex++;
    const state = this.history[this.currentIndex];
    this.chess = new Chess(state.position);
    this.timer = state.timer;
    this.trigger("move", state.position);
    this.trigger("timer", this.timer);
    this.save();
  }
}