import {
  CostStrategy,
  ExponentialCostStrategy,
  LinearCostStrategy,
  PolynomialCostStrategy,
  StepCostStrategy,
  HybridCostStrategy,
} from './CostStrategy';

/**
 * Configuration for creating a cost strategy
 */
export type CostStrategyConfig =
  | { type: 'exponential'; multiplier: number }
  | { type: 'linear'; increment: number }
  | { type: 'polynomial'; exponent: number }
  | { type: 'step'; stepSize: number; stepMultiplier: number }
  | {
      type: 'hybrid';
      threshold: number;
      earlyStrategy: CostStrategyConfig;
      lateStrategy: CostStrategyConfig;
    };

/**
 * Factory for creating cost strategy instances
 *
 * Provides a centralized way to create cost strategies from configuration,
 * making it easy to define strategies in config files.
 *
 * @example
 * // Create from config
 * const strategy = CostStrategyFactory.create({
 *   type: 'exponential',
 *   multiplier: 1.15
 * });
 *
 * @example
 * // Create hybrid strategy
 * const strategy = CostStrategyFactory.create({
 *   type: 'hybrid',
 *   threshold: 50,
 *   earlyStrategy: { type: 'exponential', multiplier: 1.15 },
 *   lateStrategy: { type: 'polynomial', exponent: 2 }
 * });
 */
export class CostStrategyFactory {
  /**
   * Create a cost strategy from configuration
   */
  static create(config: CostStrategyConfig): CostStrategy {
    switch (config.type) {
      case 'exponential':
        return new ExponentialCostStrategy(config.multiplier);

      case 'linear':
        return new LinearCostStrategy(config.increment);

      case 'polynomial':
        return new PolynomialCostStrategy(config.exponent);

      case 'step':
        return new StepCostStrategy(config.stepSize, config.stepMultiplier);

      case 'hybrid':
        return new HybridCostStrategy(
          config.threshold,
          this.create(config.earlyStrategy),
          this.create(config.lateStrategy)
        );

      default:
        // TypeScript exhaustiveness check
        const _exhaustive: never = config;
        throw new Error(`Unknown cost strategy type: ${(_exhaustive as CostStrategyConfig).type}`);
    }
  }

  /**
   * Create default exponential strategy (most common for idle games)
   */
  static createDefault(multiplier: number = 1.15): CostStrategy {
    return new ExponentialCostStrategy(multiplier);
  }

  /**
   * Preset strategies for common use cases
   */
  static readonly presets = {
    /**
     * Standard idle game scaling (15% increase per level)
     */
    standard: new ExponentialCostStrategy(1.15),

    /**
     * Aggressive scaling (50% increase per level)
     */
    aggressive: new ExponentialCostStrategy(1.5),

    /**
     * Gentle scaling (8% increase per level)
     */
    gentle: new ExponentialCostStrategy(1.08),

    /**
     * Doubling each level (very aggressive)
     */
    doubling: new ExponentialCostStrategy(2.0),

    /**
     * Constant cost (no scaling)
     */
    constant: new ExponentialCostStrategy(1.0),

    /**
     * Linear growth (50% increase per level)
     */
    linearModerate: new LinearCostStrategy(0.5),

    /**
     * Quadratic growth
     */
    quadratic: new PolynomialCostStrategy(2),

    /**
     * Cubic growth
     */
    cubic: new PolynomialCostStrategy(3),

    /**
     * Tier-based (doubles every 10 levels)
     */
    tiered: new StepCostStrategy(10, 2.0),
  };
}
