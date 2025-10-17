import { Producer } from '../Producer';
import { BigNumber } from '../BigNumber';
import type { ProducerConfig, Production, GameContext } from '@/types/core';

export interface ComplexConfig extends ProducerConfig {
  synergyBonus?: number;
  automation?: boolean;
}

/**
 * Complex - Tier 5 producers with synergy bonus mechanics
 * Advanced facilities that benefit from other producers
 */
export class Complex extends Producer {
  synergyBonus: number;
  automation: boolean;

  constructor(id: string, config: ComplexConfig) {
    super(id, {
      ...config,
      tier: config.tier || 5,
    });
    this.synergyBonus = config.synergyBonus || 0.05;
    this.automation = config.automation || false;
  }

  /**
   * Calculate synergy multiplier based on other producers
   */
  calculateSynergyMultiplier(context: GameContext): BigNumber {
    if (!context.producers) {
      return BigNumber.one();
    }

    // Count total levels of lower tier producers
    let totalLevels = 0;
    Object.values(context.producers).forEach((producer: any) => {
      if (producer.tier < this.tier) {
        totalLevels += producer.level;
      }
    });

    // Synergy multiplier: 1 + (synergyBonus * totalLevels)
    return BigNumber.from(1).add(BigNumber.from(this.synergyBonus).mul(totalLevels));
  }

  /**
   * Override to apply synergy
   */
  produce(deltaTime: number, context?: GameContext): Production {
    const production = super.produce(deltaTime);

    if (context) {
      const synergyMultiplier = this.calculateSynergyMultiplier(context);

      Object.keys(production).forEach((resourceId) => {
        production[resourceId] = BigNumber.from(production[resourceId]).mul(synergyMultiplier);
      });
    }

    return production;
  }

  clone(): Complex {
    const clone = new Complex(this.id, {
      name: this.name,
      description: this.description,
      icon: this.icon,
      tier: this.tier,
      baseCost: this.baseCost,
      costMultiplier: this.costMultiplier,
      maxLevel: this.maxLevel,
      baseProduction: this.baseProduction,
      synergyBonus: this.synergyBonus,
      automation: this.automation,
      unlockCondition: this.unlockCondition ?? undefined,
      unlocked: this.unlocked,
      visible: this.visible,
    });
    clone.level = this.level;
    clone.productionMultiplier = new BigNumber(this.productionMultiplier);
    return clone;
  }
}
