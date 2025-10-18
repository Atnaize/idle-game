import { BigNumber } from '@core/engine';

/**
 * Formulas - Common game formulas
 */
export class Formulas {
  /**
   * Linear cost scaling: base * (level * multiplier)
   */
  static linearCost(base: BigNumber, level: number, multiplier: number = 1.15): BigNumber {
    return base.mul(BigNumber.from(multiplier).pow(level));
  }

  /**
   * Exponential cost scaling: base * (multiplier ^ level)
   */
  static exponentialCost(base: BigNumber, level: number, multiplier: number = 1.15): BigNumber {
    return base.mul(BigNumber.from(multiplier).pow(level));
  }

  /**
   * Polynomial cost scaling: base * (level ^ power)
   */
  static polynomialCost(base: BigNumber, level: number, power: number = 2): BigNumber {
    return base.mul(BigNumber.from(level).pow(power));
  }

  /**
   * Linear production: base * level
   */
  static linearProduction(base: BigNumber, level: number): BigNumber {
    return base.mul(level);
  }

  /**
   * Exponential production: base * level * (multiplier ^ level)
   */
  static exponentialProduction(base: BigNumber, level: number, multiplier: number = 1.1): BigNumber {
    return base.mul(level).mul(BigNumber.from(multiplier).pow(level));
  }

  /**
   * Soft cap formula: reduces growth after threshold
   */
  static softCap(value: BigNumber, threshold: BigNumber, power: number = 0.5): BigNumber {
    if (value.lte(threshold)) {
      return value;
    }

    const excess = value.sub(threshold);
    const reducedExcess = excess.pow(power);
    return threshold.add(reducedExcess);
  }

  /**
   * Hard cap formula: maximum value
   */
  static hardCap(value: BigNumber, maximum: BigNumber): BigNumber {
    return value.gt(maximum) ? maximum : value;
  }

  /**
   * Diminishing returns formula
   */
  static diminishingReturns(value: BigNumber, factor: number = 0.9): BigNumber {
    // Returns: value / (1 + value * (1 - factor))
    const denominator = BigNumber.one().add(value.mul(1 - factor));
    return value.div(denominator);
  }
}
