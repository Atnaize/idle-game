/**
 * Game Configuration Constants
 *
 * Centralized configuration for all game systems.
 * All magic numbers and hardcoded values should be defined here.
 */

export const GAME_CONFIG = {
  /**
   * Game Engine Configuration
   */
  ENGINE: {
    /** Target frames per second for game logic updates */
    TARGET_FPS: 20,

    /** Interval between auto-saves (in milliseconds) */
    AUTO_SAVE_INTERVAL_MS: 30000, // 30 seconds

    /** Maximum time to calculate offline progress (in milliseconds) */
    OFFLINE_PROGRESS_LIMIT_MS: 3600000, // 1 hour
  },

  /**
   * UI Update Configuration
   */
  UI: {
    /** Interval between React UI updates (in milliseconds) */
    TICK_UPDATE_INTERVAL_MS: 500, // 2 updates per second (reduced from 100ms)

    /** Duration for click effect animations (in milliseconds) */
    CLICK_EFFECT_DURATION_MS: 1000,

    /** Toast notification default duration (in milliseconds) */
    TOAST_DURATION_MS: 3000,
  },

  /**
   * Save System Configuration
   */
  SAVE: {
    /** Current save format version for migrations */
    CURRENT_VERSION: '1.0.0',

    /** LocalStorage key for game save */
    STORAGE_KEY: 'idle-game-save',

    /** LocalStorage key for last save timestamp */
    LAST_SAVE_TIME_KEY: 'idle-game-last-save',

    /** Minimum time away (in seconds) before showing offline progress modal */
    MIN_OFFLINE_TIME_FOR_MODAL: 5,
  },

  /**
   * Performance Configuration
   */
  PERFORMANCE: {
    /** Maximum number of items in producer max affordable calculation */
    MAX_AFFORDABLE_CALC_LIMIT: 1000,
  },
} as const;

/**
 * Derived Constants
 * Calculated from base configuration
 */
export const DERIVED_CONFIG = {
  /** Milliseconds between engine ticks */
  ENGINE_TICK_MS: 1000 / GAME_CONFIG.ENGINE.TARGET_FPS,

  /** Ratio of UI updates to engine ticks */
  UI_TO_ENGINE_RATIO: GAME_CONFIG.UI.TICK_UPDATE_INTERVAL_MS / (1000 / GAME_CONFIG.ENGINE.TARGET_FPS),
} as const;
