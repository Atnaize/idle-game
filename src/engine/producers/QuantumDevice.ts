import { Producer } from '../Producer';
import { BigNumber } from '../BigNumber';
import type { ProducerConfig, Production } from '@/types/core';

export interface QuantumDeviceConfig extends ProducerConfig {
  quantumLevel?: number;
  quantumScaling?: number;
  instability?: number;
}

/**
 * QuantumDevice - Tier 6+ producers with exponential quantum scaling
 * Late-game producers with massive power but complexity
 */
export class QuantumDevice extends Producer {
  quantumLevel: number;
  quantumScaling: number;
  instability: number;

  constructor(id: string, config: QuantumDeviceConfig) {
    super(id, {
      ...config,
      tier: config.tier || 6,
    });
    this.quantumLevel = config.quantumLevel || 1;
    this.quantumScaling = config.quantumScaling || 2;
    this.instability = config.instability || 0;
  }

  getProductionRate(): Production {
    const baseRate = super.getProductionRate();

    // Quantum scaling: base * (quantumScaling ^ quantumLevel)
    const quantumMultiplier = BigNumber.from(this.quantumScaling).pow(this.quantumLevel);

    // Instability penalty: slightly reduce production based on instability
    const stabilityMultiplier = BigNumber.from(1 - this.instability);

    Object.keys(baseRate).forEach((resourceId) => {
      baseRate[resourceId] = BigNumber.from(baseRate[resourceId])
        .mul(quantumMultiplier)
        .mul(stabilityMultiplier);
    });

    return baseRate;
  }

  /**
   * Upgrade quantum level (expensive but powerful)
   */
  upgradeQuantumLevel(): void {
    this.quantumLevel += 1;
    // Increase instability slightly
    this.instability = Math.min(0.5, this.instability + 0.02);
  }

  /**
   * Stabilize quantum device (reduce instability)
   */
  stabilize(amount: number = 0.1): void {
    this.instability = Math.max(0, this.instability - amount);
  }

  clone(): QuantumDevice {
    const clone = new QuantumDevice(this.id, {
      name: this.name,
      description: this.description,
      icon: this.icon,
      tier: this.tier,
      baseCost: this.baseCost,
      costMultiplier: this.costMultiplier,
      maxLevel: this.maxLevel,
      baseProduction: this.baseProduction,
      quantumLevel: this.quantumLevel,
      quantumScaling: this.quantumScaling,
      instability: this.instability,
      unlockCondition: this.unlockCondition ?? undefined,
      unlocked: this.unlocked,
      visible: this.visible,
    });
    clone.level = this.level;
    clone.productionMultiplier = new BigNumber(this.productionMultiplier);
    return clone;
  }
}
