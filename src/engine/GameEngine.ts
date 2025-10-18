import { BigNumber } from './BigNumber';
import type {
  GameContext,
  ResourceId,
  ProducerId,
  UpgradeId,
  AchievementId,
  SaveData,
  GameStats,
  SerializedData,
} from '@/types/core';
import type { Resource } from './Entity';
import type { Producer, Upgrade } from './Producer';
import type { Achievement } from './Achievement';
import type { ClickPower } from './ClickPower';
import type { Prestige } from './Prestige';
import { RESOURCES } from '@config/resources.config';

export interface GameEngineConfig {
  targetFPS?: number;
  autoSaveInterval?: number;
  offlineProgressLimit?: number;
}

/**
 * GameEngine - Core game loop and state management
 */
export class GameEngine {
  resources: Record<ResourceId, Resource>;
  producers: Record<ProducerId, Producer>;
  upgrades: Record<UpgradeId, Upgrade>;
  achievements: Record<AchievementId, Achievement>;
  clickPower: ClickPower | null;
  prestige: Prestige | null;

  stats: GameStats;
  running: boolean;
  lastTickTime: number;
  targetFPS: number;
  autoSaveInterval: number;
  lastAutoSave: number;
  offlineProgressLimit: number;

  constructor(config: GameEngineConfig = {}) {
    this.resources = {};
    this.producers = {};
    this.upgrades = {};
    this.achievements = {};
    this.clickPower = null;
    this.prestige = null;

    this.stats = {
      totalPlayTime: 0,
      totalClicks: 0,
      totalPrestige: 0,
      lifetimeOre: '0',
    };

    this.running = false;
    this.lastTickTime = Date.now();
    this.targetFPS = config.targetFPS || 20;
    this.autoSaveInterval = config.autoSaveInterval || 30000; // 30 seconds
    this.lastAutoSave = Date.now();
    this.offlineProgressLimit = config.offlineProgressLimit || 3600000; // 1 hour
  }

  /**
   * Add resource to game
   */
  addResource(resource: Resource): void {
    this.resources[resource.id] = resource;
  }

  /**
   * Add producer to game
   */
  addProducer(producer: Producer): void {
    this.producers[producer.id] = producer;
  }

  /**
   * Add upgrade to game
   */
  addUpgrade(upgrade: Upgrade): void {
    this.upgrades[upgrade.id] = upgrade;
  }

  /**
   * Add achievement to game
   */
  addAchievement(achievement: Achievement): void {
    this.achievements[achievement.id] = achievement;
  }

  /**
   * Set click power system
   */
  setClickPower(clickPower: ClickPower): void {
    this.clickPower = clickPower;
  }

  /**
   * Set prestige system
   */
  setPrestige(prestige: Prestige): void {
    this.prestige = prestige;
  }

  /**
   * Start game loop
   */
  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.lastTickTime = Date.now();
    this.gameLoop();
  }

  /**
   * Stop game loop
   */
  stop(): void {
    this.running = false;
  }

  /**
   * Main game loop
   */
  private gameLoop = (): void => {
    if (!this.running) {
      return;
    }

    const now = Date.now();
    const deltaTime = (now - this.lastTickTime) / 1000; // Convert to seconds
    this.lastTickTime = now;

    // Update game state
    this.tick(deltaTime);

    // Auto-save check
    if (now - this.lastAutoSave >= this.autoSaveInterval) {
      this.lastAutoSave = now;
      // Trigger save event (handled by store)
    }

    // Schedule next frame
    setTimeout(this.gameLoop, 1000 / this.targetFPS);
  };

  /**
   * Update game state for one tick
   */
  tick(deltaTime: number): void {
    // Update stats
    this.stats.totalPlayTime += deltaTime;

    // Check unlock conditions
    this.checkUnlocks();

    // Apply upgrade multipliers (reset and reapply each tick)
    this.applyMultipliers();

    // Generate resources from producers
    this.produceResources(deltaTime);

    // Update achievements
    this.updateAchievements();
  }

  /**
   * Check unlock conditions for all entities
   */
  private checkUnlocks(): void {
    const context = this.getGameContext();

    Object.values(this.producers).forEach((producer) => {
      if (!producer.unlocked && producer.checkUnlock(context)) {
        producer.unlock();
      }
    });

    Object.values(this.upgrades).forEach((upgrade) => {
      if (!upgrade.unlocked && upgrade.checkUnlock(context)) {
        upgrade.unlock();
      }
    });
  }

  /**
   * Apply all multipliers from upgrades, prestige, etc.
   */
  private applyMultipliers(): void {
    const context = this.getGameContext();

    // Reset all multipliers
    Object.values(this.producers).forEach((producer) => {
      producer.setMultiplier(1);
    });

    if (this.clickPower) {
      this.clickPower.setMultiplier(1);
    }

    // Apply prestige multiplier
    if (this.prestige) {
      const prestigeMultiplier = this.prestige.getMultiplier();
      Object.values(this.producers).forEach((producer) => {
        producer.applyBoost(prestigeMultiplier);
      });
      if (this.clickPower) {
        this.clickPower.applyBoost(prestigeMultiplier);
      }
    }

    // Apply upgrade effects
    Object.values(this.upgrades).forEach((upgrade) => {
      upgrade.apply(context);
    });

    // Apply achievement multipliers
    Object.values(this.achievements).forEach((achievement) => {
      if (achievement.completed && achievement.reward?.type === 'multiplier') {
        const multiplier = BigNumber.from(achievement.reward.value || 1);
        if (achievement.reward.target === 'all') {
          Object.values(this.producers).forEach((producer) => {
            producer.applyBoost(multiplier);
          });
        }
      }
    });
  }

  /**
   * Generate resources from producers
   */
  private produceResources(deltaTime: number): void {
    Object.values(this.producers).forEach((producer) => {
      if (producer.level === 0) {
        return;
      }

      const production = producer.produce(deltaTime);

      Object.entries(production).forEach(([resourceId, amount]) => {
        const resource = this.resources[resourceId];
        if (resource) {
          resource.add(amount);
        }
      });
    });
  }

  /**
   * Update achievement progress
   */
  private updateAchievements(): void {
    const context = this.getGameContext();

    Object.values(this.achievements).forEach((achievement) => {
      if (!achievement.completed) {
        achievement.updateProgress(context);
      }
    });
  }

  /**
   * Handle manual click
   */
  handleClick(): { amount: BigNumber; wasCrit: boolean } {
    if (!this.clickPower) {
      return { amount: BigNumber.one(), wasCrit: false };
    }

    const result = this.clickPower.processClick();
    this.stats.totalClicks += 1;

    // Add to main resource (ore)
    const oreResource = this.resources[RESOURCES.ORE];
    if (oreResource) {
      oreResource.add(result.amount);
    }

    return result;
  }

  /**
   * Purchase producer levels
   */
  purchaseProducer(producerId: ProducerId, amount: number = 1): boolean {
    const producer = this.producers[producerId];
    if (!producer) {
      return false;
    }

    if (producer.isMaxLevel()) {
      return false;
    }

    const cost = producer.getNextCost(amount);

    // Check if can afford
    const canAfford = Object.entries(cost).every(([resourceId, costAmount]) => {
      const resource = this.resources[resourceId];
      return resource && resource.canAfford(costAmount);
    });

    if (!canAfford) {
      return false;
    }

    // Deduct cost
    Object.entries(cost).forEach(([resourceId, costAmount]) => {
      this.resources[resourceId].subtract(costAmount);
    });

    // Increase level
    producer.increaseLevel(amount);

    return true;
  }

  /**
   * Purchase upgrade
   */
  purchaseUpgrade(upgradeId: UpgradeId): boolean {
    const upgrade = this.upgrades[upgradeId];
    if (!upgrade) {
      return false;
    }

    if (upgrade.isMaxLevel()) {
      return false;
    }

    const cost = upgrade.getNextCost();

    // Check if can afford
    const canAfford = Object.entries(cost).every(([resourceId, costAmount]) => {
      const resource = this.resources[resourceId];
      return resource && resource.canAfford(costAmount);
    });

    if (!canAfford) {
      return false;
    }

    // Deduct cost
    Object.entries(cost).forEach(([resourceId, costAmount]) => {
      this.resources[resourceId].subtract(costAmount);
    });

    // Purchase upgrade
    upgrade.purchase();

    return true;
  }

  /**
   * Perform prestige
   */
  performPrestige(): boolean {
    if (!this.prestige) {
      return false;
    }

    const context = this.getGameContext();

    if (!this.prestige.canPrestige(context)) {
      return false;
    }

    const result = this.prestige.performPrestige(context);

    // Apply new state
    this.resources = result.newState.resources;
    this.producers = result.newState.producers;
    this.upgrades = result.newState.upgrades;
    // Keep achievements

    this.stats.totalPrestige += 1;

    return true;
  }

  /**
   * Calculate offline progress
   */
  calculateOfflineProgress(timeAway: number): void {
    // Limit offline progress
    const effectiveTime = Math.min(timeAway, this.offlineProgressLimit / 1000);

    // Simulate production at current rates
    this.produceResources(effectiveTime);

    // Offline progress calculation complete
  }

  /**
   * Get current game context
   */
  getGameContext(): GameContext {
    return {
      resources: this.resources,
      producers: this.producers,
      upgrades: this.upgrades,
      achievements: this.achievements,
      clickPower: this.clickPower ?? undefined,
      prestige: this.prestige ?? undefined,
    };
  }

  /**
   * Serialize game state for saving
   */
  serialize(): SaveData {
    const resources: Record<ResourceId, SerializedData> = {};
    Object.entries(this.resources).forEach(([id, resource]) => {
      resources[id] = resource.serialize();
    });

    const producers: Record<ProducerId, SerializedData> = {};
    Object.entries(this.producers).forEach(([id, producer]) => {
      producers[id] = producer.serialize();
    });

    const upgrades: Record<UpgradeId, SerializedData> = {};
    Object.entries(this.upgrades).forEach(([id, upgrade]) => {
      upgrades[id] = upgrade.serialize();
    });

    const achievements: Record<AchievementId, SerializedData> = {};
    Object.entries(this.achievements).forEach(([id, achievement]) => {
      achievements[id] = achievement.serialize();
    });

    return {
      version: '1.0.0',
      timestamp: Date.now(),
      resources,
      producers,
      upgrades,
      achievements,
      clickPower: this.clickPower?.serialize(),
      prestige: this.prestige?.serialize() ? {
        points: this.prestige.prestigePoints.serialize(),
        totalResets: this.prestige.totalResets,
      } : undefined,
      stats: this.stats,
    };
  }
}
