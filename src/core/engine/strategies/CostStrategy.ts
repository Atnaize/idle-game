import { BigNumber } from '../BigNumber';
import type { Cost } from '@core/types';

/**
 * Strategy interface for calculating purchasable costs
 *
 * Allows different cost progression curves (exponential, linear, polynomial, etc.)
 * to be used interchangeably based on game design requirements.
 *
 * @example
 * const strategy = new ExponentialCostStrategy(1.15);
 * const cost = strategy.calculateCost(baseCost, 5, 10);
 */
export interface CostStrategy {
  /**
   * Calculate the total cost for purchasing the next N levels
   *
   * @param baseCost - Base cost for each resource at level 0
   * @param currentLevel - Current level of the purchasable
   * @param levels - Number of levels to purchase (default: 1)
   * @returns Cost object with total resource requirements for all levels
   */
  calculateCost(baseCost: Cost, currentLevel: number, levels: number): Cost;

  /**
   * Get a description of this cost strategy
   */
  getDescription(): string;
}

/**
 * Exponential cost strategy - Most common for idle games
 *
 * Formula: cost(level) = baseCost * multiplier^level
 * Total cost for N levels uses geometric series:
 * Sum = baseCost * multiplier^currentLevel * (multiplier^levels - 1) / (multiplier - 1)
 *
 * @example
 * // Cost doubles each level
 * const strategy = new ExponentialCostStrategy(2.0);
 * // Level 0->1: 100, Level 1->2: 200, Level 2->3: 400
 *
 * @example
 * // Common idle game scaling (15% increase per level)
 * const strategy = new ExponentialCostStrategy(1.15);
 */
export class ExponentialCostStrategy implements CostStrategy {
  constructor(private multiplier: number) {
    if (multiplier <= 0) {
      throw new Error('Cost multiplier must be positive');
    }
  }

  calculateCost(baseCost: Cost, currentLevel: number, levels: number = 1): Cost {
    const cost: Cost = {};

    for (const [resourceId, baseAmount] of Object.entries(baseCost)) {
      const base = BigNumber.from(baseAmount);

      if (levels === 1) {
        // Cost for next single level
        cost[resourceId] = base.mul(BigNumber.from(this.multiplier).pow(currentLevel));
      } else {
        // Sum of costs for multiple levels (geometric series)
        const multiplier = BigNumber.from(this.multiplier);
        const start = multiplier.pow(currentLevel);
        const ratio = multiplier.pow(levels);

        if (this.multiplier === 1) {
          // Special case: no scaling (constant cost)
          cost[resourceId] = base.mul(levels);
        } else {
          // Sum = base * start * (ratio - 1) / (multiplier - 1)
          cost[resourceId] = base.mul(start).mul(ratio.sub(1)).div(multiplier.sub(1));
        }
      }
    }

    return cost;
  }

  getDescription(): string {
    return `Exponential (${this.multiplier}x per level)`;
  }
}

/**
 * Linear cost strategy - Cost increases by fixed amount per level
 *
 * Formula: cost(level) = baseCost * (1 + increment * level)
 * Total cost for N levels:
 * Sum = baseCost * N + baseCost * increment * (currentLevel * N + N * (N-1) / 2)
 *
 * @example
 * // Cost increases by 50% of base cost per level
 * const strategy = new LinearCostStrategy(0.5);
 * // Level 0: 100, Level 1: 150, Level 2: 200, Level 3: 250
 */
export class LinearCostStrategy implements CostStrategy {
  constructor(private increment: number) {
    if (increment < 0) {
      throw new Error('Cost increment cannot be negative');
    }
  }

  calculateCost(baseCost: Cost, currentLevel: number, levels: number = 1): Cost {
    const cost: Cost = {};

    for (const [resourceId, baseAmount] of Object.entries(baseCost)) {
      const base = BigNumber.from(baseAmount);
      const increment = BigNumber.from(this.increment);

      if (levels === 1) {
        // Cost for next single level
        const levelMultiplier = increment.mul(currentLevel).add(1);
        cost[resourceId] = base.mul(levelMultiplier);
      } else {
        // Total cost for N levels using arithmetic series
        // Sum = baseCost * N + baseCost * increment * (currentLevel * N + N * (N-1) / 2)
        const n = BigNumber.from(levels);
        const current = BigNumber.from(currentLevel);

        const constantPart = base.mul(n);
        const linearPart = base.mul(increment).mul(current.mul(n).add(n.mul(n.sub(1)).div(2)));

        cost[resourceId] = constantPart.add(linearPart);
      }
    }

    return cost;
  }

  getDescription(): string {
    return `Linear (+${this.increment * 100}% per level)`;
  }
}

/**
 * Polynomial cost strategy - Cost increases by power law
 *
 * Formula: cost(level) = baseCost * (level + 1)^exponent
 * Total cost for N levels: Sum from i=currentLevel to currentLevel+levels-1 of baseCost * (i+1)^exponent
 *
 * @example
 * // Quadratic growth
 * const strategy = new PolynomialCostStrategy(2);
 * // Level 0: 100 * 1^2 = 100
 * // Level 1: 100 * 2^2 = 400
 * // Level 2: 100 * 3^2 = 900
 */
export class PolynomialCostStrategy implements CostStrategy {
  constructor(private exponent: number) {
    if (exponent < 1) {
      throw new Error('Exponent must be at least 1');
    }
  }

  calculateCost(baseCost: Cost, currentLevel: number, levels: number = 1): Cost {
    const cost: Cost = {};

    for (const [resourceId, baseAmount] of Object.entries(baseCost)) {
      const base = BigNumber.from(baseAmount);
      let totalCost = BigNumber.zero();

      // Sum from currentLevel to currentLevel + levels - 1
      for (let i = 0; i < levels; i++) {
        const level = currentLevel + i;
        const levelFactor = BigNumber.from(level + 1).pow(this.exponent);
        totalCost = totalCost.add(base.mul(levelFactor));
      }

      cost[resourceId] = totalCost;
    }

    return cost;
  }

  getDescription(): string {
    return `Polynomial (level^${this.exponent})`;
  }
}

/**
 * Step cost strategy - Cost increases in discrete steps/tiers
 *
 * Useful for prestige tiers or milestone-based scaling.
 *
 * @example
 * // Cost stays same for 10 levels, then doubles
 * const strategy = new StepCostStrategy(10, 2.0);
 * // Levels 0-9: 100, Levels 10-19: 200, Levels 20-29: 400
 */
export class StepCostStrategy implements CostStrategy {
  constructor(
    private stepSize: number,
    private stepMultiplier: number
  ) {
    if (stepSize < 1) {
      throw new Error('Step size must be at least 1');
    }
    if (stepMultiplier <= 0) {
      throw new Error('Step multiplier must be positive');
    }
  }

  calculateCost(baseCost: Cost, currentLevel: number, levels: number = 1): Cost {
    const cost: Cost = {};

    for (const [resourceId, baseAmount] of Object.entries(baseCost)) {
      const base = BigNumber.from(baseAmount);
      let totalCost = BigNumber.zero();

      for (let i = 0; i < levels; i++) {
        const level = currentLevel + i;
        const tier = Math.floor(level / this.stepSize);
        const tierMultiplier = BigNumber.from(this.stepMultiplier).pow(tier);
        totalCost = totalCost.add(base.mul(tierMultiplier));
      }

      cost[resourceId] = totalCost;
    }

    return cost;
  }

  getDescription(): string {
    return `Step (${this.stepMultiplier}x every ${this.stepSize} levels)`;
  }
}

/**
 * Hybrid cost strategy - Combines multiple strategies
 *
 * Useful for complex cost curves that change behavior at different thresholds.
 *
 * @example
 * // Exponential for first 50 levels, then polynomial
 * const strategy = new HybridCostStrategy(
 *   50,
 *   new ExponentialCostStrategy(1.15),
 *   new PolynomialCostStrategy(2)
 * );
 */
export class HybridCostStrategy implements CostStrategy {
  constructor(
    private threshold: number,
    private earlyStrategy: CostStrategy,
    private lateStrategy: CostStrategy
  ) {
    if (threshold < 0) {
      throw new Error('Threshold must be non-negative');
    }
  }

  calculateCost(baseCost: Cost, currentLevel: number, levels: number = 1): Cost {
    const endLevel = currentLevel + levels;

    // All levels are before threshold
    if (endLevel <= this.threshold) {
      return this.earlyStrategy.calculateCost(baseCost, currentLevel, levels);
    }

    // All levels are after threshold
    if (currentLevel >= this.threshold) {
      return this.lateStrategy.calculateCost(baseCost, currentLevel, levels);
    }

    // Spans threshold - split calculation
    const levelsBeforeThreshold = this.threshold - currentLevel;
    const levelsAfterThreshold = levels - levelsBeforeThreshold;

    const earlyCost = this.earlyStrategy.calculateCost(baseCost, currentLevel, levelsBeforeThreshold);
    const lateCost = this.lateStrategy.calculateCost(baseCost, this.threshold, levelsAfterThreshold);

    // Merge costs
    const cost: Cost = { ...earlyCost };
    for (const [resourceId, amount] of Object.entries(lateCost)) {
      const earlyAmount = cost[resourceId] ? BigNumber.from(cost[resourceId]) : BigNumber.zero();
      cost[resourceId] = earlyAmount.add(amount);
    }

    return cost;
  }

  getDescription(): string {
    return `Hybrid (${this.earlyStrategy.getDescription()} → ${this.lateStrategy.getDescription()} at level ${this.threshold})`;
  }
}
