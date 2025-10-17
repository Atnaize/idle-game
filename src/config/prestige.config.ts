/**
 * Prestige Configuration
 * Defines prestige system
 */

import { BigNumber } from '@engine/BigNumber';
import { Prestige } from '@engine/Prestige';
import { Formulas } from '@utils/Formulas';
import { RESOURCES } from './resources.config';

// Prestige ID constants
export const PRESTIGE = {
  PRESTIGE: 'prestige',
} as const;

export type PrestigeId = typeof PRESTIGE[keyof typeof PRESTIGE];

// Prestige factory function
export const createPrestige = () => {
  return new Prestige(PRESTIGE.PRESTIGE, {
    name: 'Prestige',
    description: 'Reset progress for permanent production bonuses',
    minRequirement: BigNumber.from('1e12'), // 1 trillion ore
    currencyId: RESOURCES.ORE,
    formula: (amount: BigNumber) => {
      // Cubic root formula: more balanced progression
      return Formulas.cubicPrestige(amount, BigNumber.from('1e12'));
    },
    bonusPerPoint: 0.1, // 10% per prestige point
    keepProducers: [],
    keepUpgrades: [],
  });
};
