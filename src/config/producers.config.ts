/**
 * Producers Configuration
 * Defines all game producers and their IDs
 */

import { Miner, Drill, Complex, QuantumDevice } from '@engine/producers';
import type { GameContext } from '@/types/core';

// Producer ID constants
export const PRODUCERS = {
  MINER: 'miner',
  EXCAVATOR: 'excavator',
  DRILL: 'drill',
  LASER_DRILL: 'laserDrill',
  MINING_COMPLEX: 'miningComplex',
  QUANTUM_MINER: 'quantumMiner',
} as const;

export type ProducerId = typeof PRODUCERS[keyof typeof PRODUCERS];

// Producer factory function
export const createProducers = () => {
  return {
    // Tier 1: Miners
    [PRODUCERS.MINER]: new Miner(PRODUCERS.MINER, {
      name: 'Miner',
      description: 'A basic miner that extracts ore',
      icon: '⛏️',
      tier: 1,
      baseCost: { ore: 10 },
      costMultiplier: 1.15,
      baseProduction: { ore: 0.5 },
      efficiency: 1.0,
      unlocked: true,
      visible: true,
    }),

    [PRODUCERS.EXCAVATOR]: new Miner(PRODUCERS.EXCAVATOR, {
      name: 'Excavator',
      description: 'Automated mining equipment',
      icon: '🚜',
      tier: 2,
      baseCost: { ore: 100 },
      costMultiplier: 1.15,
      baseProduction: { ore: 4 },
      efficiency: 1.2,
      unlocked: false,
      visible: true,
      unlockCondition: (ctx: GameContext) => {
        const miner = ctx.producers[PRODUCERS.MINER];
        return miner && miner.level >= 5;
      },
    }),

    // Tier 3: Drills
    [PRODUCERS.DRILL]: new Drill(PRODUCERS.DRILL, {
      name: 'Drill',
      description: 'Deep mining drill with depth bonuses',
      icon: '🔧',
      tier: 3,
      baseCost: { ore: 1100 },
      costMultiplier: 1.15,
      baseProduction: { ore: 20 },
      depth: 0,
      depthBonus: 0.1,
      unlocked: false,
      visible: true,
      unlockCondition: (ctx: GameContext) => {
        const excavator = ctx.producers[PRODUCERS.EXCAVATOR];
        return excavator && excavator.level >= 10;
      },
    }),

    [PRODUCERS.LASER_DRILL]: new Drill(PRODUCERS.LASER_DRILL, {
      name: 'Laser Drill',
      description: 'Advanced drilling technology',
      icon: '🔦',
      tier: 4,
      baseCost: { ore: 12000 },
      costMultiplier: 1.15,
      baseProduction: { ore: 47 },
      depth: 1,
      depthBonus: 0.15,
      unlocked: false,
      visible: true,
      unlockCondition: (ctx: GameContext) => {
        const drill = ctx.producers[PRODUCERS.DRILL];
        return drill && drill.level >= 10;
      },
    }),

    // Tier 5: Complex
    [PRODUCERS.MINING_COMPLEX]: new Complex(PRODUCERS.MINING_COMPLEX, {
      name: 'Mining Complex',
      description: 'Large facility with synergy bonuses',
      icon: '🏭',
      tier: 5,
      baseCost: { ore: 130000 },
      costMultiplier: 1.15,
      baseProduction: { ore: 260 },
      synergyBonus: 0.01,
      automation: true,
      unlocked: false,
      visible: true,
      unlockCondition: (ctx: GameContext) => {
        const laserDrill = ctx.producers[PRODUCERS.LASER_DRILL];
        return laserDrill && laserDrill.level >= 10;
      },
    }),

    // Tier 6: Quantum
    [PRODUCERS.QUANTUM_MINER]: new QuantumDevice(PRODUCERS.QUANTUM_MINER, {
      name: 'Quantum Miner',
      description: 'Reality-bending extraction device',
      icon: '⚛️',
      tier: 6,
      baseCost: { ore: 1400000 },
      costMultiplier: 1.15,
      baseProduction: { ore: 1400 },
      quantumLevel: 1,
      quantumScaling: 1.5,
      instability: 0,
      unlocked: false,
      visible: true,
      unlockCondition: (ctx: GameContext) => {
        const complex = ctx.producers[PRODUCERS.MINING_COMPLEX];
        return complex && complex.level >= 10;
      },
    }),
  };
};
