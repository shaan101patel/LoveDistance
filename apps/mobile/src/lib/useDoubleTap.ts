import { useCallback, useRef } from 'react';

const DEFAULT_DELAY_MS = 280;

/**
 * Returns a press handler that fires `onDoubleTap` when two presses occur within `delayMs`.
 */
export function useDoubleTap(onDoubleTap: () => void, delayMs = DEFAULT_DELAY_MS): () => void {
  const lastTapRef = useRef(0);
  return useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < delayMs) {
      lastTapRef.current = 0;
      onDoubleTap();
    } else {
      lastTapRef.current = now;
    }
  }, [onDoubleTap, delayMs]);
}
