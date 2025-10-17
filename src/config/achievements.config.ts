/**
 * Achievements Configuration
 * Defines all game achievements and their IDs
 */

import { MilestoneAchievement, PurchaseAchievement } from '@engine/Achievement';
import { RESOURCES } from './resources.config';
import { PRODUCERS } from './producers.config';

// Achievement ID constants
export const ACHIEVEMENTS = {
  // Milestone achievements
  FIRST_ORE: 'firstOre',
  THOUSAND_ORE: 'thousandOre',
  MILLION_ORE: 'millionOre',

  // Purchase achievements
  TEN_MINERS: 'tenMiners',
  HUNDRED_MINERS: 'hundredMiners',
} as const;

export type AchievementId = typeof ACHIEVEMENTS[keyof typeof ACHIEVEMENTS];

// Achievement factory function
export const createAchievements = () => {
  return {
    // Milestone achievements
    [ACHIEVEMENTS.FIRST_ORE]: new MilestoneAchievement(ACHIEVEMENTS.FIRST_ORE, {
      name: 'First Strike',
      description: 'Reach 100 ore',
      icon: '🎯',
      resourceId: RESOURCES.ORE,
      targetAmount: 100,
      reward: {
        type: 'multiplier',
        target: 'all',
        value: 1.1,
      },
    }),

    [ACHIEVEMENTS.THOUSAND_ORE]: new MilestoneAchievement(ACHIEVEMENTS.THOUSAND_ORE, {
      name: 'Getting Started',
      description: 'Reach 1,000 ore',
      icon: '📊',
      resourceId: RESOURCES.ORE,
      targetAmount: 1000,
      reward: {
        type: 'multiplier',
        target: 'all',
        value: 1.1,
      },
    }),

    [ACHIEVEMENTS.MILLION_ORE]: new MilestoneAchievement(ACHIEVEMENTS.MILLION_ORE, {
      name: 'Millionaire',
      description: 'Reach 1 million ore',
      icon: '💰',
      resourceId: RESOURCES.ORE,
      targetAmount: 1000000,
      reward: {
        type: 'multiplier',
        target: 'all',
        value: 1.25,
      },
    }),

    // Purchase achievements
    [ACHIEVEMENTS.TEN_MINERS]: new PurchaseAchievement(ACHIEVEMENTS.TEN_MINERS, {
      name: 'Small Crew',
      description: 'Own 10 miners',
      icon: '👷',
      targetId: PRODUCERS.MINER,
      targetLevel: 10,
      reward: {
        type: 'multiplier',
        target: 'all',
        value: 1.05,
      },
    }),

    [ACHIEVEMENTS.HUNDRED_MINERS]: new PurchaseAchievement(ACHIEVEMENTS.HUNDRED_MINERS, {
      name: 'Mining Army',
      description: 'Own 100 miners',
      icon: '👷‍♂️',
      targetId: PRODUCERS.MINER,
      targetLevel: 100,
      reward: {
        type: 'multiplier',
        target: 'all',
        value: 1.15,
      },
    }),
  };
};
