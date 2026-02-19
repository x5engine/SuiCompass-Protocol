// src/lib/types.ts
export type GameSessionTimer = {
  white: number;
  black: number;
};

export type GameSessionHistory = {
  timer: GameSessionTimer;
  position: string;
}[];

export type GameSessionStorage = {
  history: GameSessionHistory;
  position: string;
  timer: GameSessionTimer;
  currentIndex: number;
};

export type GameSessionListeners = {
  move: ((position: string) => void)[];
  timer: ((timer: GameSessionTimer) => void)[];
};