import { useState, useEffect, useRef, useCallback } from 'react';

export function useIdleTimeout(delayMs = 3000) {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    setIsIdle(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsIdle(true), delayMs);
  }, [delayMs]);

  useEffect(() => {
    const events = ['mousemove', 'touchstart', 'keydown', 'pointerdown'];
    events.forEach((e) =>
      document.addEventListener(e, resetTimer, { passive: true }),
    );
    resetTimer();
    return () => {
      events.forEach((e) => document.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  return { isIdle, resetTimer };
}
