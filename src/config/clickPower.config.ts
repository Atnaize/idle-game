/**
 * Click Power Configuration
 * Defines click power system and click upgrades
 */

import { ClickPower } from '@engine/ClickPower';
import { Upgrade } from '@engine/Producer';
import type { GameContext } from '@/types/core';
import { BigNumber } from '@engine/BigNumber';

// Click Power ID constants
export const CLICK_POWER = {
  MANUAL_MINING: 'manualMining',
} as const;

export type ClickPowerId = typeof CLICK_POWER[keyof typeof CLICK_POWER];

// Click Upgrade ID constants
export const CLICK_UPGRADES = {
  CLICK_POWER_1: 'clickPower1',
  CRIT_CHANCE_1: 'critChance1',
  CRIT_MULTIPLIER_1: 'critMultiplier1',
} as const;

export type ClickUpgradeId = typeof CLICK_UPGRADES[keyof typeof CLICK_UPGRADES];

// Click Power factory function
export const createClickPower = () => {
  return new ClickPower(CLICK_POWER.MANUAL_MINING, {
    name: 'Manual Mining Power',
    description: 'Click to mine ore manually',
    icon: '👆',
    baseCost: { ore: 25 },
    costMultiplier: 1.5,
    maxLevel: 100,
    baseClickValue: 1,
    critChance: 0.05,
    critMultiplier: 2,
    unlocked: true,
    visible: true,
  });
};

// Click Upgrades factory function
export const createClickUpgrades = () => {
  return {
    [CLICK_UPGRADES.CLICK_POWER_1]: new Upgrade(CLICK_UPGRADES.CLICK_POWER_1, {
      name: 'Stronger Clicks',
      description: 'Double click power',
      icon: '💪',
      baseCost: { ore: 25 },
      costMultiplier: 2.5,
      maxLevel: 10,
      effectType: 'multiplier',
      effectValue: 2,
      unlocked: true,
      visible: true,
      target: (gameState: GameContext, effect: BigNumber) => {
        if (gameState.clickPower) {
          gameState.clickPower.applyBoost(effect);
        }
      },
    }),

    [CLICK_UPGRADES.CRIT_CHANCE_1]: new Upgrade(CLICK_UPGRADES.CRIT_CHANCE_1, {
      name: 'Lucky Strikes',
      description: '+5% crit chance per level',
      icon: '🍀',
      baseCost: { ore: 300 },
      costMultiplier: 3,
      maxLevel: 10,
      effectType: 'additive',
      effectValue: 0.05,
      unlocked: false,
      visible: true,
      unlockCondition: (ctx: GameContext) => {
        const clickPower1 = ctx.upgrades[CLICK_UPGRADES.CLICK_POWER_1];
        return clickPower1 && clickPower1.level >= 3;
      },
      target: (gameState: GameContext, effect: BigNumber) => {
        if (gameState.clickPower) {
          gameState.clickPower.addCritChance(effect.toNumber());
        }
      },
    }),

    [CLICK_UPGRADES.CRIT_MULTIPLIER_1]: new Upgrade(CLICK_UPGRADES.CRIT_MULTIPLIER_1, {
      name: 'Devastating Blows',
      description: '+1x crit multiplier per level',
      icon: '💥',
      baseCost: { ore: 1500 },
      costMultiplier: 4,
      maxLevel: 5,
      effectType: 'additive',
      effectValue: 1,
      unlocked: false,
      visible: true,
      unlockCondition: (ctx: GameContext) => {
        const critChance = ctx.upgrades[CLICK_UPGRADES.CRIT_CHANCE_1];
        return critChance && critChance.level >= 3;
      },
      target: (gameState: GameContext, effect: BigNumber) => {
        if (gameState.clickPower) {
          gameState.clickPower.addCritMultiplier(effect.toNumber());
        }
      },
    }),
  };
};
