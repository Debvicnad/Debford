"use client";

import { useState, useEffect, useCallback } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;       // ms remaining
  isExpired: boolean;
}

export function useCountdown(endsAt: string | Date): TimeLeft {
  const calc = useCallback((): TimeLeft => {
    const total = new Date(endsAt).getTime() - Date.now();
    if (total <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, isExpired: true };
    }
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours   = Math.floor((total / 1000 / 60 / 60) % 24);
    const days    = Math.floor(total / 1000 / 60 / 60 / 24);
    return { days, hours, minutes, seconds, total, isExpired: false };
  }, [endsAt]);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calc);

  useEffect(() => {
    const tick = () => setTimeLeft(calc());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [calc]);

  return timeLeft;
}
