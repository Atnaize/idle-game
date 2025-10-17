/**
 * Upgrades Configuration
 * Defines all game upgrades and their IDs
 */

import { Upgrade } from '@engine/Producer';
import type { GameContext } from '@/types/core';
import { PRODUCERS } from './producers.config';

// Upgrade ID constants
export const UPGRADES = {
  // Miner upgrades
  MINER_BOOST_1: 'minerBoost1',
  MINER_BOOST_2: 'minerBoost2',

  // Global upgrades
  GLOBAL_PRODUCTION_1: 'globalProduction1',
  GLOBAL_PRODUCTION_2: 'globalProduction2',

  // Drill upgrades
  DRILL_EFFICIENCY_1: 'drillEfficiency1',
  DRILL_SPEED_1: 'drillSpeed1',
  DRILL_DEPTH_1: 'drillDepth1',

  // Prestige upgrades
  PRESTIGE_BONUS_1: 'prestigeBonus1',
} as const;

export type UpgradeId = typeof UPGRADES[keyof typeof UPGRADES];

// Upgrade factory function
export const createUpgrades = () => {
  return {
    // Miner upgrades
    [UPGRADES.MINER_BOOST_1]: new Upgrade(UPGRADES.MINER_BOOST_1, {
      name: 'Better Pickaxes',
      description: 'Doubles miner production',
      icon: '⚒️',
      baseCost: { ore: 50 },
      costMultiplier: 1,
      maxLevel: 1,
      effectType: 'multiplier',
      effectValue: 2,
      target: { type: 'producer', id: PRODUCERS.MINER },
      unlocked: true,
      visible: true,
    }),

    [UPGRADES.MINER_BOOST_2]: new Upgrade(UPGRADES.MINER_BOOST_2, {
      name: 'Mining Helmets',
      description: 'Doubles miner production again',
      icon: '🪖',
      baseCost: { ore: 250 },
      costMultiplier: 1,
      maxLevel: 1,
      effectType: 'multiplier',
      effectValue: 2,
      target: { type: 'producer', id: PRODUCERS.MINER },
      unlocked: false,
      visible: true,
      unlockCondition: (ctx: GameContext) => {
        const upgrade = ctx.upgrades[UPGRADES.MINER_BOOST_1];
        return upgrade && upgrade.purchased;
      },
    }),

    // Global upgrades
    [UPGRADES.GLOBAL_PRODUCTION_1]: new Upgrade(UPGRADES.GLOBAL_PRODUCTION_1, {
      name: 'Efficiency Training',
      description: 'All producers 2x more efficient',
      icon: '📚',
      baseCost: { ore: 5000 },
      costMultiplier: 3,
      maxLevel: 10,
      effectType: 'multiplier',
      effectValue: 2,
      target: { type: 'all_producers' },
      unlocked: false,
      visible: true,
      unlockCondition: (ctx: GameContext) => {
        const excavator = ctx.producers[PRODUCERS.EXCAVATOR];
        return excavator && excavator.level >= 10;
      },
    }),

    [UPGRADES.GLOBAL_PRODUCTION_2]: new Upgrade(UPGRADES.GLOBAL_PRODUCTION_2, {
      name: 'Advanced Automation',
      description: 'All producers 2x more efficient',
      icon: '🤖',
      baseCost: { ore: 50000 },
      costMultiplier: 5,
      maxLevel: 5,
      effectType: 'multiplier',
      effectValue: 2,
      target: { type: 'all_producers' },
      unlocked: false,
      visible: true,
      unlockCondition: (ctx: GameContext) => {
        const drill = ctx.producers[PRODUCERS.DRILL];
        return drill && drill.level >= 10;
      },
    }),

    // Drill upgrades
    [UPGRADES.DRILL_EFFICIENCY_1]: new Upgrade(UPGRADES.DRILL_EFFICIENCY_1, {
      name: 'Drill Bits',
      description: 'Doubles drill production',
      icon: '🔩',
      baseCost: { ore: 5000 },
      costMultiplier: 1,
      maxLevel: 1,
      effectType: 'multiplier',
      effectValue: 2,
      target: { type: 'producer', id: PRODUCERS.DRILL },
      unlocked: false,
      visible: true,
      unlockCondition: (ctx: GameContext) => {
        const drill = ctx.producers[PRODUCERS.DRILL];
        return drill && drill.level >= 1;
      },
    }),

    [UPGRADES.DRILL_SPEED_1]: new Upgrade(UPGRADES.DRILL_SPEED_1, {
      name: 'Hydraulic Systems',
      description: 'Doubles all drill production',
      icon: '💧',
      baseCost: { ore: 25000 },
      costMultiplier: 1,
      maxLevel: 1,
      effectType: 'multiplier',
      effectValue: 2,
      target: { type: 'category', category: 'drill' },
      unlocked: false,
      visible: true,
      unlockCondition: (ctx: GameContext) => {
        const upgrade = ctx.upgrades[UPGRADES.DRILL_EFFICIENCY_1];
        return upgrade && upgrade.purchased;
      },
    }),

    [UPGRADES.DRILL_DEPTH_1]: new Upgrade(UPGRADES.DRILL_DEPTH_1, {
      name: 'Deep Mining',
      description: 'Unlocks deeper ore veins',
      icon: '⬇️',
      baseCost: { ore: 100000 },
      costMultiplier: 1,
      maxLevel: 1,
      effectType: 'multiplier',
      effectValue: 2,
      target: { type: 'category', category: 'drill' },
      unlocked: false,
      visible: true,
      unlockCondition: (ctx: GameContext) => {
        const upgrade = ctx.upgrades[UPGRADES.DRILL_SPEED_1];
        const drill = ctx.producers[PRODUCERS.DRILL];
        return upgrade && upgrade.purchased && drill && drill.level >= 15;
      },
    }),

    // Prestige upgrades
    [UPGRADES.PRESTIGE_BONUS_1]: new Upgrade(UPGRADES.PRESTIGE_BONUS_1, {
      name: 'Quantum Efficiency',
      description: 'Prestige bonus +50% more effective',
      icon: '⚛️',
      baseCost: { ore: 500000 },
      costMultiplier: 1,
      maxLevel: 1,
      effectType: 'multiplier',
      effectValue: 1.5,
      target: { type: 'prestige' },
      unlocked: false,
      visible: true,
      unlockCondition: (ctx: GameContext) => {
        const global2 = ctx.upgrades[UPGRADES.GLOBAL_PRODUCTION_2];
        const depth = ctx.upgrades[UPGRADES.DRILL_DEPTH_1];
        return global2 && global2.purchased && depth && depth.purchased;
      },
    }),
  };
};
