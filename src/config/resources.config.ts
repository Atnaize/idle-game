/**
 * Resources Configuration
 * Defines all game resources and their IDs
 */

import { Ore } from '@engine/resources';

// Resource ID constants
export const RESOURCES = {
  ORE: 'ore',
} as const;

export type ResourceId = typeof RESOURCES[keyof typeof RESOURCES];

// Resource factory function
export const createResources = () => {
  return {
    [RESOURCES.ORE]: new Ore(RESOURCES.ORE, {
      name: 'Ore',
      description: 'Basic mining resource',
      icon: '⛏️',
      amount: 0,
      color: '#8b7355',
      unlocked: true,
      visible: true,
      quality: 'common',
    }),
  };
};
