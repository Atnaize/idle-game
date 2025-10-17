import { Producer } from '../Producer';
import { BigNumber } from '../BigNumber';
import type { ProducerConfig, Production } from '@/types/core';

export interface DrillConfig extends ProducerConfig {
  depth?: number;
  depthBonus?: number;
}

/**
 * Drill - Tier 3-4 producers with depth bonus mechanics
 * Deep mining equipment with exponential bonuses
 */
export class Drill extends Producer {
  depth: number;
  depthBonus: number;

  constructor(id: string, config: DrillConfig) {
    super(id, {
      ...config,
      tier: config.tier || 3,
    });
    this.depth = config.depth || 0;
    this.depthBonus = config.depthBonus || 0.1;
  }

  getProductionRate(): Production {
    const baseRate = super.getProductionRate();

    // Apply depth bonus: (1 + depthBonus) ^ depth
    const depthMultiplier = BigNumber.from(1 + this.depthBonus).pow(this.depth);

    Object.keys(baseRate).forEach((resourceId) => {
      baseRate[resourceId] = BigNumber.from(baseRate[resourceId]).mul(depthMultiplier);
    });

    return baseRate;
  }

  /**
   * Increase depth (can be triggered by achievements/upgrades)
   */
  increaseDepth(amount: number = 1): void {
    this.depth += amount;
  }

  clone(): Drill {
    const clone = new Drill(this.id, {
      name: this.name,
      description: this.description,
      icon: this.icon,
      tier: this.tier,
      baseCost: this.baseCost,
      costMultiplier: this.costMultiplier,
      maxLevel: this.maxLevel,
      baseProduction: this.baseProduction,
      depth: this.depth,
      depthBonus: this.depthBonus,
      unlockCondition: this.unlockCondition ?? undefined,
      unlocked: this.unlocked,
      visible: this.visible,
    });
    clone.level = this.level;
    clone.productionMultiplier = new BigNumber(this.productionMultiplier);
    return clone;
  }
}
