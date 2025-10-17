import { Purchasable } from './Entity';
import { BigNumber } from './BigNumber';
import type {
  ProducerConfig,
  UpgradeConfig,
  Production,
  GameContext,
  UnlockCondition,
  SerializedData,
  Cost,
  UpgradeTarget,
} from '@/types/core';
import type { Resource } from './Entity';

/**
 * Producer Entity - Generates resources over time
 */
export class Producer extends Purchasable {
  baseProduction: Production;
  productionMultiplier: BigNumber;
  unlockCondition: UnlockCondition | null;
  tier: number;

  constructor(id: string, config: ProducerConfig) {
    super(id, config, 'producer');

    this.baseProduction = this.normalizeProduction(config.baseProduction);
    this.productionMultiplier = BigNumber.one();
    this.unlockCondition = config.unlockCondition || null;
    this.tier = config.tier || 1;
  }

  /**
   * Normalize production object to use BigNumber
   */
  protected normalizeProduction(production: Production): Production {
    const normalized: Production = {};
    for (const [resourceId, amount] of Object.entries(production)) {
      normalized[resourceId] = BigNumber.from(amount);
    }
    return normalized;
  }

  /**
   * Calculate current production rate per second
   */
  getProductionRate(): Production {
    if (this.level === 0) {
      return {};
    }

    const production: Production = {};

    for (const [resourceId, baseAmount] of Object.entries(this.baseProduction)) {
      production[resourceId] = BigNumber.from(baseAmount)
        .mul(this.level)
        .mul(this.productionMultiplier);
    }

    return production;
  }

  /**
   * Calculate production for given time period
   */
  produce(deltaTime: number): Production {
    const rate = this.getProductionRate();
    const production: Production = {};

    for (const [resourceId, rateAmount] of Object.entries(rate)) {
      production[resourceId] = BigNumber.from(rateAmount).mul(deltaTime);
    }

    return production;
  }

  /**
   * Set production multiplier
   */
  setMultiplier(multiplier: BigNumber | number): void {
    this.productionMultiplier = BigNumber.from(multiplier);
  }

  /**
   * Apply temporary boost multiplier
   */
  applyBoost(boost: BigNumber | number): void {
    this.productionMultiplier = this.productionMultiplier.mul(boost);
  }

  /**
   * Check unlock condition
   */
  checkUnlock(context: GameContext): boolean {
    if (this.unlocked) {
      return true;
    }

    if (!this.unlockCondition) {
      return true;
    }

    return this.unlockCondition(context);
  }

  /**
   * Get efficiency (production per cost)
   */
  getEfficiency(): BigNumber {
    const nextCost = this.getNextCost();
    const production = this.getProductionRate();

    // Simple efficiency: total production / total cost
    const totalProduction: BigNumber = Object.values(production).reduce<BigNumber>(
      (sum, val) => sum.add(BigNumber.from(val)),
      BigNumber.zero()
    );

    const totalCost: BigNumber = Object.values(nextCost).reduce<BigNumber>(
      (sum, val) => sum.add(BigNumber.from(val)),
      BigNumber.zero()
    );

    if (totalCost.eq(0)) {
      return BigNumber.zero();
    }

    return totalProduction.div(totalCost);
  }

  serialize(): SerializedData {
    return {
      ...super.serialize(),
      productionMultiplier: this.productionMultiplier.serialize(),
    };
  }

  static deserialize(data: SerializedData, config: ProducerConfig): Producer {
    const producer = new Producer(data.id, config);
    producer.level = data.level;
    producer.unlocked = data.unlocked;
    producer.visible = data.visible;
    producer.productionMultiplier = BigNumber.deserialize(data.productionMultiplier);
    return producer;
  }

  clone(): Producer {
    const clone = new Producer(this.id, {
      name: this.name,
      description: this.description,
      icon: this.icon,
      baseCost: this.baseCost,
      costMultiplier: this.costMultiplier,
      maxLevel: this.maxLevel,
      baseProduction: this.baseProduction,
      unlockCondition: this.unlockCondition ?? undefined,
      unlocked: this.unlocked,
      visible: this.visible,
      tier: this.tier,
    });
    clone.level = this.level;
    clone.productionMultiplier = new BigNumber(this.productionMultiplier);
    return clone;
  }
}

/**
 * Upgrade Entity - Permanent improvements to game mechanics
 */
export class Upgrade extends Purchasable {
  effectType: 'multiplier' | 'additive' | 'flat';
  effectValue: number;
  target: UpgradeTarget | ((gameState: GameContext, effect: BigNumber) => void) | null;
  unlockCondition: UnlockCondition | null;
  purchased: boolean;

  constructor(id: string, config: UpgradeConfig) {
    super(id, config, 'upgrade');

    this.maxLevel = config.maxLevel || 1;
    this.effectType = config.effectType || 'multiplier';
    this.effectValue = config.effectValue || 2;
    this.target = config.target || null;
    this.unlockCondition = config.unlockCondition || null;
    this.purchased = false;
  }

  /**
   * Get current effect value
   */
  getEffect(): BigNumber {
    if (!this.purchased && this.level === 0) {
      return this.effectType === 'multiplier' ? BigNumber.one() : BigNumber.zero();
    }

    switch (this.effectType) {
      case 'multiplier':
        return BigNumber.from(this.effectValue).pow(this.level);
      case 'additive':
        return BigNumber.from(this.effectValue).mul(this.level);
      case 'flat':
        return BigNumber.from(this.effectValue);
      default:
        return BigNumber.one();
    }
  }

  /**
   * Apply upgrade effect to target
   */
  apply(gameState: GameContext): void {
    if (!this.purchased && this.level === 0) {
      return;
    }

    const effect = this.getEffect();

    if (!this.target) {
      return;
    }

    // Custom effect function
    if (typeof this.target === 'function') {
      this.target(gameState, effect);
      return;
    }

    // Apply to specific producer
    if (this.target.type === 'producer' && this.target.id) {
      const producer = gameState.producers[this.target.id];
      if (producer) {
        producer.applyBoost(effect);
      }
    }

    // Apply to all producers
    if (this.target.type === 'all_producers') {
      Object.values(gameState.producers).forEach((producer: any) => {
        producer.applyBoost(effect);
      });
    }
  }

  /**
   * Purchase upgrade
   */
  purchase(): boolean {
    if (this.isMaxLevel()) {
      return false;
    }

    this.purchased = true;
    this.increaseLevel(1);
    return true;
  }

  /**
   * Check unlock condition
   */
  checkUnlock(context: GameContext): boolean {
    if (this.unlocked) {
      return true;
    }

    if (!this.unlockCondition) {
      return true;
    }

    return this.unlockCondition(context);
  }

  serialize(): SerializedData {
    return {
      ...super.serialize(),
      purchased: this.purchased,
    };
  }

  static deserialize(data: SerializedData, config: UpgradeConfig): Upgrade {
    const upgrade = new Upgrade(data.id, config);
    upgrade.level = data.level;
    upgrade.purchased = data.purchased;
    upgrade.unlocked = data.unlocked;
    upgrade.visible = data.visible;
    return upgrade;
  }

  clone(): Upgrade {
    const clone = new Upgrade(this.id, {
      name: this.name,
      description: this.description,
      icon: this.icon,
      baseCost: this.baseCost,
      costMultiplier: this.costMultiplier,
      maxLevel: this.maxLevel,
      effectType: this.effectType,
      effectValue: this.effectValue,
      target: this.target ?? undefined,
      unlockCondition: this.unlockCondition ?? undefined,
      unlocked: this.unlocked,
      visible: this.visible,
    });
    clone.level = this.level;
    clone.purchased = this.purchased;
    return clone;
  }
}
