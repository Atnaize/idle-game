/**
 * Tab Configuration
 * Defines all UI tabs
 */

// Tab ID constants
export const TABS = {
  PRODUCERS: 'producers',
  SKILLTREE: 'skilltree',
  ACHIEVEMENTS: 'achievements',
  PRESTIGE: 'prestige',
} as const;

export type TabId = typeof TABS[keyof typeof TABS];
