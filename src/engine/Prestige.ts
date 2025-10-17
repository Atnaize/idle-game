import { BigNumber } from './BigNumber';
import type { PrestigeConfig, GameContext, SerializedData } from '@/types/core';

export interface PrestigeResult {
  newState: GameContext;
  pointsGained: BigNumber;
  totalPoints: BigNumber;
}

/**
 * Prestige - Reset progress for permanent bonuses
 */
export class Prestige {
  id: string;
  name: string;
  description: string;
  minRequirement: BigNumber;
  currencyId: string;
  formula: (amount: BigNumber) => BigNumber;
  bonusPerPoint: number;
  keepProducers: string[];
  keepUpgrades: string[];
  prestigePoints: BigNumber;
  totalResets: number;

  constructor(id: string, config: PrestigeConfig) {
    this.id = id;
    this.name = config.name;
    this.description = config.description;
    this.minRequirement = BigNumber.from(config.minRequirement);
    this.currencyId = config.currencyId;
    this.formula = config.formula;
    this.bonusPerPoint = config.bonusPerPoint || 0.01;
    this.keepProducers = config.keepProducers || [];
    this.keepUpgrades = config.keepUpgrades || [];
    this.prestigePoints = BigNumber.zero();
    this.totalResets = 0;
  }

  /**
   * Check if can prestige
   */
  canPrestige(gameState: GameContext): boolean {
    const currency = gameState.resources[this.currencyId];
    if (!currency) {
      return false;
    }

    return currency.amount.gte(this.minRequirement);
  }

  /**
   * Calculate prestige points that would be gained
   */
  calculatePointsGain(gameState: GameContext): BigNumber {
    const currency = gameState.resources[this.currencyId];
    if (!currency) {
      return BigNumber.zero();
    }

    const amount = currency.amount;
    if (amount.lt(this.minRequirement)) {
      return BigNumber.zero();
    }

    return this.formula(amount);
  }

  /**
   * Get current production multiplier from prestige points
   */
  getMultiplier(): BigNumber {
    // Multiplier = 1 + (bonusPerPoint * prestigePoints)
    return BigNumber.from(1).add(BigNumber.from(this.bonusPerPoint).mul(this.prestigePoints));
  }

  /**
   * Perform prestige reset
   */
  performPrestige(gameState: GameContext): PrestigeResult {
    const pointsGained = this.calculatePointsGain(gameState);

    if (pointsGained.eq(0)) {
      throw new Error('Cannot prestige: not enough currency');
    }

    // Add prestige points
    this.prestigePoints = this.prestigePoints.add(pointsGained);
    this.totalResets += 1;

    // Create new game state
    const newState = this.resetGameState(gameState);

    return {
      newState,
      pointsGained,
      totalPoints: new BigNumber(this.prestigePoints),
    };
  }

  /**
   * Reset game state while keeping certain progress
   */
  resetGameState(gameState: GameContext): GameContext {
    const newState: GameContext = {
      resources: {},
      producers: {},
      upgrades: {},
      achievements: gameState.achievements, // Always keep achievements
    };

    // Reset resources
    for (const [id, resource] of Object.entries(gameState.resources)) {
      newState.resources[id] = resource.clone();
      newState.resources[id].amount = BigNumber.zero();
    }

    // Reset producers (keep specified ones)
    for (const [id, producer] of Object.entries(gameState.producers)) {
      newState.producers[id] = producer.clone();

      if (!this.keepProducers.includes(id)) {
        newState.producers[id].level = 0;
      }

      // Reset multipliers (will be reapplied)
      newState.producers[id].setMultiplier(1);
    }

    // Reset upgrades (keep specified ones)
    for (const [id, upgrade] of Object.entries(gameState.upgrades)) {
      newState.upgrades[id] = upgrade.clone();

      if (!this.keepUpgrades.includes(id)) {
        newState.upgrades[id].level = 0;
        newState.upgrades[id].purchased = false;
      }
    }

    return newState;
  }

  serialize(): SerializedData {
    return {
      id: this.id,
      level: 0,
      unlocked: true,
      visible: true,
      prestigePoints: this.prestigePoints.serialize(),
      totalResets: this.totalResets,
    };
  }

  static deserialize(data: SerializedData, config: PrestigeConfig): Prestige {
    const prestige = new Prestige(data.id, config);
    prestige.prestigePoints = BigNumber.deserialize(data.prestigePoints);
    prestige.totalResets = data.totalResets;
    return prestige;
  }
}
