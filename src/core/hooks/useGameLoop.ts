import { useEffect, useRef } from 'react';
import { GAME_CONFIG } from '../constants/gameConfig';

/**
 * Custom hook to manage the game UI update loop
 *
 * This hook sets up an interval that forces React to re-render
 * at a controlled frequency, syncing with game state changes.
 *
 * Properly cleans up the interval on unmount to prevent memory leaks.
 *
 * @param onTick - Callback function to execute on each tick
 * @param enabled - Whether the loop should be running
 */
export function useGameLoop(onTick: () => void, enabled: boolean = true) {
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Start the interval
    intervalRef.current = window.setInterval(() => {
      onTick();
    }, GAME_CONFIG.UI.TICK_UPDATE_INTERVAL_MS);

    // Cleanup function - critical to prevent memory leaks
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [onTick, enabled]);
}
