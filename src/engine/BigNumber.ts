import Decimal from 'break_infinity.js';

/**
 * BigNumber wrapper class for game calculations
 * Provides a consistent interface for handling large numbers
 */
export class BigNumber extends Decimal {
  /**
   * Create a BigNumber from various input types
   */
  static from(value: number | string | Decimal | BigNumber): BigNumber {
    if (value instanceof BigNumber) {
      return value;
    }
    return new BigNumber(value);
  }

  /**
   * Create a BigNumber from zero
   */
  static zero(): BigNumber {
    return new BigNumber(0);
  }

  /**
   * Create a BigNumber from one
   */
  static one(): BigNumber {
    return new BigNumber(1);
  }

  /**
   * Check if value is greater than or equal to cost
   */
  canAfford(cost: BigNumber | number | string): boolean {
    return this.gte(BigNumber.from(cost));
  }

  /**
   * Subtract cost and return new BigNumber
   */
  spend(cost: BigNumber | number | string): BigNumber {
    return new BigNumber(this.sub(BigNumber.from(cost)));
  }

  /**
   * Add amount and return new BigNumber
   */
  earn(amount: BigNumber | number | string): BigNumber {
    return new BigNumber(this.add(BigNumber.from(amount)));
  }

  /**
   * Override arithmetic operations to return BigNumber
   */
  add(other: Decimal | number | string): BigNumber {
    return new BigNumber(super.add(other));
  }

  sub(other: Decimal | number | string): BigNumber {
    return new BigNumber(super.sub(other));
  }

  mul(other: Decimal | number | string): BigNumber {
    return new BigNumber(super.mul(other));
  }

  div(other: Decimal | number | string): BigNumber {
    return new BigNumber(super.div(other));
  }

  pow(other: Decimal | number): BigNumber {
    return new BigNumber(super.pow(other));
  }

  /**
   * Serialize to plain object
   */
  serialize(): string {
    return this.toString();
  }

  /**
   * Deserialize from plain object
   */
  static deserialize(data: string | number): BigNumber {
    return new BigNumber(data);
  }

  /**
   * Check if value is finite and valid
   */
  isValid(): boolean {
    return Number.isFinite(this.toNumber()) && !Number.isNaN(this.toNumber());
  }

  /**
   * Clamp value between min and max
   */
  clamp(min: BigNumber | number | string, max: BigNumber | number | string): BigNumber {
    const minVal = BigNumber.from(min);
    const maxVal = BigNumber.from(max);

    if (this.lt(minVal)) {
      return minVal;
    }
    if (this.gt(maxVal)) {
      return maxVal;
    }
    return this;
  }

  /**
   * Get percentage of this value relative to target
   */
  percentOf(target: BigNumber | number | string): BigNumber {
    const targetVal = BigNumber.from(target);
    if (targetVal.eq(0)) {
      return BigNumber.zero();
    }
    return this.div(targetVal).mul(100);
  }
}
