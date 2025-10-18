import { useEffect, useRef } from 'react';
import { GAME_CONFIG } from '../constants/gameConfig';

/**
 * Custom hook to manage automatic game saving
 *
 * Sets up an interval that periodically saves the game state.
 * Properly cleans up the interval on unmount to prevent memory leaks.
 *
 * @param onSave - Callback function to execute the save
 * @param enabled - Whether auto-save should be running
 */
export function useAutoSave(onSave: () => void, enabled: boolean = true) {
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Start the auto-save interval
    intervalRef.current = window.setInterval(() => {
      onSave();
    }, GAME_CONFIG.ENGINE.AUTO_SAVE_INTERVAL_MS);

    // Cleanup function - critical to prevent memory leaks
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [onSave, enabled]);
}
