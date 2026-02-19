// src/lib/utils.ts
import { useEffect, useRef } from "react";

export function useInitialEffect(callback: () => void) {
  const isInitial = useRef(true);

  useEffect(() => {
    if (isInitial.current) {
      callback();
      isInitial.current = false;
    }
  }, [callback]);
}

export function secondsToTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}
