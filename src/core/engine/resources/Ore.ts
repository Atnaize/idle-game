import { Resource } from '../Entity';
import type { ResourceConfig } from '@core/types';

export interface OreConfig extends ResourceConfig {
  quality?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  rarity?: number;
}

/**
 * Ore - Primary resource with quality tiers
 */
export class Ore extends Resource {
  quality: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  rarity: number;

  constructor(id: string, config: OreConfig) {
    super(id, config);
    this.quality = config.quality || 'common';
    this.rarity = config.rarity || 1.0;
  }

  /**
   * Get quality multiplier
   */
  getQualityMultiplier(): number {
    const multipliers = {
      common: 1,
      uncommon: 1.5,
      rare: 2,
      epic: 3,
      legendary: 5,
    };
    return multipliers[this.quality];
  }

  clone(): Ore {
    return new Ore(this.id, {
      name: this.name,
      description: this.description,
      icon: this.icon,
      amount: this.amount,
      maxAmount: this.maxAmount ?? undefined,
      color: this.color,
      unlocked: this.unlocked,
      visible: this.visible,
      quality: this.quality,
      rarity: this.rarity,
    });
  }
}
