import { Purchasable } from './Entity';
import { BigNumber } from './BigNumber';
import type {
  ClickPowerConfig,
  ClickUpgradeConfig,
  SerializedData,
  GameContext,
} from '@/types/core';

export interface ClickResult {
  amount: BigNumber;
  wasCrit: boolean;
}

/**
 * ClickPower - Manual clicking system with upgrades
 * Makes manual clicking relevant throughout the game
 */
export class ClickPower extends Purchasable {
  baseClickValue: BigNumber;
  clickMultiplier: BigNumber;
  critChance: number;
  critMultiplier: number;

  constructor(id: string, config: ClickPowerConfig) {
    super(id, config, 'click_power');

    this.baseClickValue = BigNumber.from(config.baseClickValue || 1);
    this.clickMultiplier = BigNumber.one();
    this.critChance = config.critChance || 0;
    this.critMultiplier = config.critMultiplier || 2;
  }

  /**
   * Get current click value
   */
  getClickValue(): BigNumber {
    // Base value always active, level adds bonus (1 level = 1x base)
    const levelMultiplier = this.level > 0 ? this.level : 1;
    return this.baseClickValue.mul(levelMultiplier).mul(this.clickMultiplier);
  }

  /**
   * Process a click and return amount generated
   */
  processClick(): ClickResult {
    const baseValue = this.getClickValue();
    const isCrit = Math.random() < this.critChance;
    const amount = isCrit ? baseValue.mul(this.critMultiplier) : baseValue;

    return { amount, wasCrit: isCrit };
  }

  /**
   * Set click multiplier
   */
  setMultiplier(multiplier: BigNumber | number): void {
    this.clickMultiplier = BigNumber.from(multiplier);
  }

  /**
   * Apply boost to click power
   */
  applyBoost(boost: BigNumber | number): void {
    this.clickMultiplier = this.clickMultiplier.mul(boost);
  }

  /**
   * Increase crit chance
   */
  addCritChance(amount: number): void {
    this.critChance = Math.min(1, this.critChance + amount);
  }

  /**
   * Increase crit multiplier
   */
  addCritMultiplier(amount: number): void {
    this.critMultiplier += amount;
  }

  serialize(): SerializedData {
    return {
      ...super.serialize(),
      clickMultiplier: this.clickMultiplier.serialize(),
      critChance: this.critChance,
      critMultiplier: this.critMultiplier,
    };
  }

  static deserialize(data: SerializedData, config: ClickPowerConfig): ClickPower {
    const clickPower = new ClickPower(data.id, config);
    clickPower.level = data.level;
    clickPower.unlocked = data.unlocked;
    clickPower.visible = data.visible;
    clickPower.clickMultiplier = BigNumber.deserialize(data.clickMultiplier);
    clickPower.critChance = data.critChance;
    clickPower.critMultiplier = data.critMultiplier;
    return clickPower;
  }

  clone(): ClickPower {
    const clone = new ClickPower(this.id, {
      name: this.name,
      description: this.description,
      icon: this.icon,
      baseCost: this.baseCost,
      costMultiplier: this.costMultiplier,
      maxLevel: this.maxLevel,
      baseClickValue: this.baseClickValue,
      critChance: this.critChance,
      critMultiplier: this.critMultiplier,
      unlocked: this.unlocked,
      visible: this.visible,
    });
    clone.level = this.level;
    clone.clickMultiplier = new BigNumber(this.clickMultiplier);
    return clone;
  }
}

/**
 * ClickUpgrade - Special upgrades for click power
 */
export class ClickUpgrade extends Purchasable {
  clickPowerTarget: 'value' | 'crit_chance' | 'crit_multiplier';
  effectValue: number;
  unlockCondition: ((context: GameContext) => boolean) | null;

  constructor(id: string, config: ClickUpgradeConfig) {
    super(id, config, 'click_upgrade');

    this.maxLevel = config.maxLevel || 10;
    this.clickPowerTarget = config.clickPowerTarget || 'value';
    this.effectValue = config.effectValue || 2;
    this.unlockCondition = config.unlockCondition || null;
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
   * Get current effect value (for display in UI)
   */
  getEffect(): BigNumber {
    if (this.level === 0) {
      return BigNumber.zero();
    }

    switch (this.clickPowerTarget) {
      case 'value':
        return BigNumber.from(this.effectValue).pow(this.level);
      case 'crit_chance':
        return BigNumber.from(this.effectValue * this.level);
      case 'crit_multiplier':
        return BigNumber.from(this.effectValue * this.level);
      default:
        return BigNumber.one();
    }
  }

  /**
   * Purchase upgrade
   */
  purchase(): boolean {
    if (this.isMaxLevel()) {
      return false;
    }

    this.increaseLevel(1);
    return true;
  }

  /**
   * Apply upgrade effect to game context (called by GameEngine)
   */
  apply(context: GameContext): void {
    if (this.level === 0) {
      return;
    }

    const clickPower = context.clickPower;
    if (!clickPower) {
      return;
    }

    switch (this.clickPowerTarget) {
      case 'value':
        const multiplier = BigNumber.from(this.effectValue).pow(this.level);
        clickPower.applyBoost(multiplier);
        break;

      case 'crit_chance':
        clickPower.addCritChance(this.effectValue * this.level);
        break;

      case 'crit_multiplier':
        clickPower.addCritMultiplier(this.effectValue * this.level);
        break;
    }
  }

  clone(): ClickUpgrade {
    const clone = new ClickUpgrade(this.id, {
      name: this.name,
      description: this.description,
      icon: this.icon,
      baseCost: this.baseCost,
      costMultiplier: this.costMultiplier,
      maxLevel: this.maxLevel,
      clickPowerTarget: this.clickPowerTarget,
      effectValue: this.effectValue,
      unlocked: this.unlocked,
      visible: this.visible,
    });
    clone.level = this.level;
    return clone;
  }
}
