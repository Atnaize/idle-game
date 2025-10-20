/**
 * Achievements Configuration
 * Defines all game achievements and their IDs
 */

import {
  Achievement,
  MilestoneConditionStrategy,
  PurchaseConditionStrategy,
  BigNumber,
} from '@core/engine';
import { RESOURCES } from '@features/resources/config/resources.config';
import { PRODUCERS } from '@features/producers/config/producers.config';

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
    [ACHIEVEMENTS.FIRST_ORE]: new Achievement(
      ACHIEVEMENTS.FIRST_ORE,
      {
        name: 'First Strike',
        description: 'Reach 100 ore',
        icon: '🎯',
        reward: {
          type: 'multiplier',
          target: 'all',
          value: 1.1,
        },
      },
      new MilestoneConditionStrategy(RESOURCES.ORE, BigNumber.from(100))
    ),

    [ACHIEVEMENTS.THOUSAND_ORE]: new Achievement(
      ACHIEVEMENTS.THOUSAND_ORE,
      {
        name: 'Getting Started',
        description: 'Reach 1,000 ore',
        icon: '📊',
        reward: {
          type: 'multiplier',
          target: 'all',
          value: 1.1,
        },
      },
      new MilestoneConditionStrategy(RESOURCES.ORE, BigNumber.from(1000))
    ),

    [ACHIEVEMENTS.MILLION_ORE]: new Achievement(
      ACHIEVEMENTS.MILLION_ORE,
      {
        name: 'Millionaire',
        description: 'Reach 1 million ore',
        icon: '💰',
        reward: {
          type: 'multiplier',
          target: 'all',
          value: 1.25,
        },
      },
      new MilestoneConditionStrategy(RESOURCES.ORE, BigNumber.from(1000000))
    ),

    // Purchase achievements
    [ACHIEVEMENTS.TEN_MINERS]: new Achievement(
      ACHIEVEMENTS.TEN_MINERS,
      {
        name: 'Small Crew',
        description: 'Own 10 miners',
        icon: '👷',
        reward: {
          type: 'multiplier',
          target: 'all',
          value: 1.05,
        },
      },
      new PurchaseConditionStrategy(PRODUCERS.MINER, 10)
    ),

    [ACHIEVEMENTS.HUNDRED_MINERS]: new Achievement(
      ACHIEVEMENTS.HUNDRED_MINERS,
      {
        name: 'Mining Army',
        description: 'Own 100 miners',
        icon: '👷‍♂️',
        reward: {
          type: 'multiplier',
          target: 'all',
          value: 1.15,
        },
      },
      new PurchaseConditionStrategy(PRODUCERS.MINER, 100)
    ),
  };
};
