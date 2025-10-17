import { Producer } from '../Producer';
import { BigNumber } from '../BigNumber';
import type { ProducerConfig, Production } from '@/types/core';

export interface MinerConfig extends ProducerConfig {
  efficiency?: number;
}

/**
 * Miner - Tier 1-2 producers with efficiency mechanics
 * Basic resource extraction units
 */
export class Miner extends Producer {
  efficiency: number;

  constructor(id: string, config: MinerConfig) {
    super(id, {
      ...config,
      tier: config.tier || 1,
    });
    this.efficiency = config.efficiency || 1.0;
  }

  getProductionRate(): Production {
    const baseRate = super.getProductionRate();

    Object.keys(baseRate).forEach((resourceId) => {
      baseRate[resourceId] = BigNumber.from(baseRate[resourceId]).mul(this.efficiency);
    });

    return baseRate;
  }

  clone(): Miner {
    const clone = new Miner(this.id, {
      name: this.name,
      description: this.description,
      icon: this.icon,
      tier: this.tier,
      baseCost: this.baseCost,
      costMultiplier: this.costMultiplier,
      maxLevel: this.maxLevel,
      baseProduction: this.baseProduction,
      efficiency: this.efficiency,
      unlockCondition: this.unlockCondition ?? undefined,
      unlocked: this.unlocked,
      visible: this.visible,
    });
    clone.level = this.level;
    clone.productionMultiplier = new BigNumber(this.productionMultiplier);
    return clone;
  }
}
