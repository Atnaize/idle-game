import { BigNumber } from '@engine/BigNumber';
import { Ore } from '@engine/resources';
import { Miner, Drill, Complex, QuantumDevice } from '@engine/producers';
import { Upgrade } from '@engine/Producer';
import { MilestoneAchievement, PurchaseAchievement } from '@engine/Achievement';
import { ClickPower } from '@engine/ClickPower';
import { Prestige } from '@engine/Prestige';
import { Formulas } from '@utils/Formulas';
import type { GameContext } from '@/types/core';

/**
 * Game Data Configuration
 * All game content defined here in TypeScript
 */

// ===== RESOURCES =====

export const createResources = () => {
  return {
    ore: new Ore('ore', {
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

// ===== PRODUCERS =====

export const createProducers = () => {
  return {
    // Tier 1: Miners
    miner: new Miner('miner', {
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

    excavator: new Miner('excavator', {
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
        const miner = ctx.producers['miner'];
        return miner && miner.level >= 5;
      },
    }),

    // Tier 3: Drills
    drill: new Drill('drill', {
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
        const excavator = ctx.producers['excavator'];
        return excavator && excavator.level >= 10;
      },
    }),

    laserDrill: new Drill('laserDrill', {
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
        const drill = ctx.producers['drill'];
        return drill && drill.level >= 10;
      },
    }),

    // Tier 5: Complex
    miningComplex: new Complex('miningComplex', {
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
        const laserDrill = ctx.producers['laserDrill'];
        return laserDrill && laserDrill.level >= 10;
      },
    }),

    // Tier 6: Quantum
    quantumMiner: new QuantumDevice('quantumMiner', {
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
        const complex = ctx.producers['miningComplex'];
        return complex && complex.level >= 10;
      },
    }),
  };
};

// ===== UPGRADES =====

export const createUpgrades = () => {
  return {
    // Miner upgrades
    minerBoost1: new Upgrade('minerBoost1', {
      name: 'Better Pickaxes',
      description: 'Doubles miner production',
      icon: '⚒️',
      baseCost: { ore: 50 },
      costMultiplier: 1,
      maxLevel: 1,
      effectType: 'multiplier',
      effectValue: 2,
      target: { type: 'producer', id: 'miner' },
      unlocked: true,
      visible: true,
    }),

    minerBoost2: new Upgrade('minerBoost2', {
      name: 'Mining Helmets',
      description: 'Doubles miner production again',
      icon: '🪖',
      baseCost: { ore: 250 },
      costMultiplier: 1,
      maxLevel: 1,
      effectType: 'multiplier',
      effectValue: 2,
      target: { type: 'producer', id: 'miner' },
      unlocked: false,
      visible: true,
      unlockCondition: (ctx: GameContext) => {
        const upgrade = ctx.upgrades['minerBoost1'];
        return upgrade && upgrade.purchased;
      },
    }),

    // Global upgrades
    globalProduction1: new Upgrade('globalProduction1', {
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
        const excavator = ctx.producers['excavator'];
        return excavator && excavator.level >= 10;
      },
    }),

    globalProduction2: new Upgrade('globalProduction2', {
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
        const drill = ctx.producers['drill'];
        return drill && drill.level >= 10;
      },
    }),

    // Drill upgrades
    drillEfficiency1: new Upgrade('drillEfficiency1', {
      name: 'Drill Bits',
      description: 'Doubles drill production',
      icon: '🔩',
      baseCost: { ore: 5000 },
      costMultiplier: 1,
      maxLevel: 1,
      effectType: 'multiplier',
      effectValue: 2,
      target: { type: 'producer', id: 'drill' },
      unlocked: false,
      visible: true,
      unlockCondition: (ctx: GameContext) => {
        const drill = ctx.producers['drill'];
        return drill && drill.level >= 1;
      },
    }),

    drillSpeed1: new Upgrade('drillSpeed1', {
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
        const upgrade = ctx.upgrades['drillEfficiency1'];
        return upgrade && upgrade.purchased;
      },
    }),

    drillDepth1: new Upgrade('drillDepth1', {
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
        const upgrade = ctx.upgrades['drillSpeed1'];
        const drill = ctx.producers['drill'];
        return upgrade && upgrade.purchased && drill && drill.level >= 15;
      },
    }),

    // Prestige upgrades
    prestigeBonus1: new Upgrade('prestigeBonus1', {
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
        const global2 = ctx.upgrades['globalProduction2'];
        const depth = ctx.upgrades['drillDepth1'];
        return global2 && global2.purchased && depth && depth.purchased;
      },
    }),
  };
};

// ===== ACHIEVEMENTS =====

export const createAchievements = () => {
  return {
    // Milestone achievements
    firstOre: new MilestoneAchievement('firstOre', {
      name: 'First Strike',
      description: 'Reach 100 ore',
      icon: '🎯',
      resourceId: 'ore',
      targetAmount: 100,
      reward: {
        type: 'multiplier',
        target: 'all',
        value: 1.1,
      },
    }),

    thousandOre: new MilestoneAchievement('thousandOre', {
      name: 'Getting Started',
      description: 'Reach 1,000 ore',
      icon: '📊',
      resourceId: 'ore',
      targetAmount: 1000,
      reward: {
        type: 'multiplier',
        target: 'all',
        value: 1.1,
      },
    }),

    millionOre: new MilestoneAchievement('millionOre', {
      name: 'Millionaire',
      description: 'Reach 1 million ore',
      icon: '💰',
      resourceId: 'ore',
      targetAmount: 1000000,
      reward: {
        type: 'multiplier',
        target: 'all',
        value: 1.25,
      },
    }),

    // Purchase achievements
    tenMiners: new PurchaseAchievement('tenMiners', {
      name: 'Small Crew',
      description: 'Own 10 miners',
      icon: '👷',
      targetId: 'miner',
      targetLevel: 10,
      reward: {
        type: 'multiplier',
        target: 'all',
        value: 1.05,
      },
    }),

    hundredMiners: new PurchaseAchievement('hundredMiners', {
      name: 'Mining Army',
      description: 'Own 100 miners',
      icon: '👷‍♂️',
      targetId: 'miner',
      targetLevel: 100,
      reward: {
        type: 'multiplier',
        target: 'all',
        value: 1.15,
      },
    }),
  };
};

// ===== CLICK POWER =====

export const createClickPower = () => {
  return new ClickPower('manualMining', {
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

// Click upgrades moved to clickPower.config.ts

// ===== PRESTIGE =====

export const createPrestige = () => {
  return new Prestige('prestige', {
    name: 'Prestige',
    description: 'Reset progress for permanent production bonuses',
    minRequirement: BigNumber.from('1e12'), // 1 trillion ore
    currencyId: 'ore',
    formula: (amount: BigNumber) => {
      // Cubic root formula: more balanced progression
      return Formulas.cubicPrestige(amount, BigNumber.from('1e12'));
    },
    bonusPerPoint: 0.1, // 10% per prestige point
    keepProducers: [],
    keepUpgrades: [],
  });
};
