import { BigNumber } from '@core/engine';

/**
 * Strategy interface for prestige point calculation
 */
export interface PrestigeFormulaStrategy {
  calculate(amount: BigNumber, requirement: BigNumber): BigNumber;
  readonly name: string;
  readonly description: string;
}

/**
 * Logarithmic prestige formula: log10(amount / requirement)
 * Good for: Very slow, steady progression
 */
export class LogarithmicPrestigeFormula implements PrestigeFormulaStrategy {
  readonly name = 'logarithmic';
  readonly description = 'Slow, steady progression based on logarithm';

  calculate(amount: BigNumber, requirement: BigNumber): BigNumber {
    if (amount.lt(requirement)) {
      return BigNumber.zero();
    }

    const ratio = amount.div(requirement);
    return BigNumber.from(Math.floor(Math.log10(ratio.toNumber()) + 1));
  }
}

/**
 * Square root prestige formula: sqrt(amount / requirement)
 * Good for: Balanced progression, not too fast or slow
 */
export class SqrtPrestigeFormula implements PrestigeFormulaStrategy {
  readonly name = 'sqrt';
  readonly description = 'Balanced progression based on square root';

  calculate(amount: BigNumber, requirement: BigNumber): BigNumber {
    if (amount.lt(requirement)) {
      return BigNumber.zero();
    }

    const ratio = amount.div(requirement);
    return BigNumber.from(Math.floor(Math.sqrt(ratio.toNumber())));
  }
}

/**
 * Cubic root prestige formula: cbrt(amount / requirement)
 * Good for: Moderate progression, recommended for most games
 */
export class CubicPrestigeFormula implements PrestigeFormulaStrategy {
  readonly name = 'cubic';
  readonly description = 'Moderate progression based on cubic root';

  calculate(amount: BigNumber, requirement: BigNumber): BigNumber {
    if (amount.lt(requirement)) {
      return BigNumber.zero();
    }

    const ratio = amount.div(requirement);
    return BigNumber.from(Math.floor(Math.cbrt(ratio.toNumber())));
  }
}

/**
 * Linear prestige formula: (amount / requirement)
 * Good for: Fast progression, early game testing
 */
export class LinearPrestigeFormula implements PrestigeFormulaStrategy {
  readonly name = 'linear';
  readonly description = 'Fast progression with linear scaling';

  calculate(amount: BigNumber, requirement: BigNumber): BigNumber {
    if (amount.lt(requirement)) {
      return BigNumber.zero();
    }

    const ratio = amount.div(requirement);
    return BigNumber.from(Math.floor(ratio.toNumber()));
  }
}

/**
 * Factory for creating prestige formulas by name
 */
export class PrestigeFormulaFactory {
  private static formulas: Map<string, PrestigeFormulaStrategy> = new Map<string, PrestigeFormulaStrategy>([
    ['logarithmic', new LogarithmicPrestigeFormula()],
    ['sqrt', new SqrtPrestigeFormula()],
    ['cubic', new CubicPrestigeFormula()],
    ['linear', new LinearPrestigeFormula()],
  ]);

  static getFormula(name: string): PrestigeFormulaStrategy {
    const formula = this.formulas.get(name.toLowerCase());
    if (!formula) {
      throw new Error(`Unknown prestige formula: ${name}. Available: ${Array.from(this.formulas.keys()).join(', ')}`);
    }
    return formula;
  }

  static getAllFormulas(): PrestigeFormulaStrategy[] {
    return Array.from(this.formulas.values());
  }
}
