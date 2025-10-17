/**
 * Configuration Index
 * Single export point for all game configuration
 *
 * Usage:
 * import { RESOURCES, PRODUCERS, UPGRADES, createResources } from '@/config';
 */

// Export all ID constants and types
export * from './resources.config';
export * from './producers.config';
export * from './upgrades.config';
export * from './achievements.config';
export * from './clickPower.config';
export * from './prestige.config';
export * from './tabs.config';

// Re-export factory functions for convenience
export {
  createResources,
} from './resources.config';

export {
  createProducers,
} from './producers.config';

export {
  createUpgrades,
} from './upgrades.config';

export {
  createAchievements,
} from './achievements.config';

export {
  createClickPower,
  createClickUpgrades,
} from './clickPower.config';

export {
  createPrestige,
} from './prestige.config';
