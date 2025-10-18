/**
 * Prestige Configuration
 * Defines prestige system with configurable formula
 */

import { BigNumber } from '@engine/BigNumber';
import { Prestige } from '@engine/Prestige';
import { PrestigeFormulaFactory } from '@utils/PrestigeFormulas';
import { RESOURCES } from './resources.config';

// Prestige ID constants
export const PRESTIGE = {
  PRESTIGE: 'prestige',
} as const;

export type PrestigeId = typeof PRESTIGE[keyof typeof PRESTIGE];

// Prestige configuration
export const PRESTIGE_CONFIG = {
  minRequirement: '1e12', // 1 trillion ore
  formula: 'cubic', // Options: 'linear', 'sqrt', 'cubic', 'logarithmic'
  bonusPerPoint: 0.1, // 10% per prestige point
} as const;

// Prestige factory function
export const createPrestige = () => {
  const formulaStrategy = PrestigeFormulaFactory.getFormula(PRESTIGE_CONFIG.formula);

  return new Prestige(
    PRESTIGE.PRESTIGE,
    {
      name: 'Prestige',
      description: 'Reset progress for permanent production bonuses',
      minRequirement: BigNumber.from(PRESTIGE_CONFIG.minRequirement),
      currencyId: RESOURCES.ORE,
      bonusPerPoint: PRESTIGE_CONFIG.bonusPerPoint,
      keepProducers: [],
      keepUpgrades: [],
    },
    formulaStrategy
  );
};
