import { BigNumber } from './BigNumber';
import { Logger } from '@core/utils';
import type {
  GameContext,
  ResourceId,
  ProducerId,
  UpgradeId,
  AchievementId,
  GameStats,
} from '@core/types';
import type { Resource } from './Entity';
import type { Producer, Upgrade } from './Producer';
import type { Achievement } from './Achievement';
import type { ClickPower } from './ClickPower';
import type { Prestige } from './Prestige';
import { RESOURCES } from '@features/resources/config/resources.config';
import { GAME_CONFIG } from '../constants/gameConfig';

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

  // Context caching for performance
  private _cachedContext: GameContext | null;
  private _contextDirty: boolean;

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
    this.targetFPS = config.targetFPS || GAME_CONFIG.ENGINE.TARGET_FPS;
    this.autoSaveInterval = config.autoSaveInterval || GAME_CONFIG.ENGINE.AUTO_SAVE_INTERVAL_MS;
    this.lastAutoSave = Date.now();
    this.offlineProgressLimit = config.offlineProgressLimit || GAME_CONFIG.ENGINE.OFFLINE_PROGRESS_LIMIT_MS;

    this._cachedContext = null;
    this._contextDirty = true;
  }

  /**
   * Add resource to game
   */
  addResource(resource: Resource): void {
    this.resources[resource.id] = resource;
    this.invalidateContext();
  }

  /**
   * Add producer to game
   */
  addProducer(producer: Producer): void {
    this.producers[producer.id] = producer;
    this.invalidateContext();
  }

  /**
   * Add upgrade to game
   */
  addUpgrade(upgrade: Upgrade): void {
    this.upgrades[upgrade.id] = upgrade;
    this.invalidateContext();
  }

  /**
   * Add achievement to game
   */
  addAchievement(achievement: Achievement): void {
    this.achievements[achievement.id] = achievement;
    this.invalidateContext();
  }

  /**
   * Set click power system
   */
  setClickPower(clickPower: ClickPower): void {
    this.clickPower = clickPower;
    this.invalidateContext();
  }

  /**
   * Set prestige system
   */
  setPrestige(prestige: Prestige): void {
    this.prestige = prestige;
    this.invalidateContext();
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
   * Callback for achievement completion
   * This is set by the game store to trigger notifications
   */
  onAchievementComplete?: (achievement: Achievement) => void;

  /**
   * Update achievement progress
   */
  private updateAchievements(): void {
    const context = this.getGameContext();

    Object.values(this.achievements).forEach((achievement) => {
      if (!achievement.completed) {
        achievement.updateProgress(context, this.onAchievementComplete);
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
      Logger.warn(`Cannot purchase producer: ${producerId} not found`);
      return false;
    }

    if (producer.isMaxLevel()) {
      Logger.debug(`Cannot purchase producer: ${producerId} is at max level`);
      return false;
    }

    const cost = producer.getNextCost(amount);

    // Check if can afford
    const canAfford = Object.entries(cost).every(([resourceId, costAmount]) => {
      const resource = this.resources[resourceId];
      if (!resource) {
        Logger.warn(`Resource ${resourceId} not found for cost check`);
        return false;
      }
      return resource.canAfford(costAmount);
    });

    if (!canAfford) {
      Logger.debug(`Cannot afford ${amount}x ${producerId}`);
      return false;
    }

    // Deduct cost
    Object.entries(cost).forEach(([resourceId, costAmount]) => {
      this.resources[resourceId].subtract(costAmount);
    });

    // Increase level
    producer.increaseLevel(amount);

    // Context doesn't need invalidation here - references stay the same
    // Only the internal state of entities changes

    return true;
  }

  /**
   * Purchase upgrade
   */
  purchaseUpgrade(upgradeId: UpgradeId): boolean {
    const upgrade = this.upgrades[upgradeId];
    if (!upgrade) {
      Logger.warn(`Cannot purchase upgrade: ${upgradeId} not found`);
      return false;
    }

    if (upgrade.isMaxLevel()) {
      Logger.debug(`Cannot purchase upgrade: ${upgradeId} is at max level`);
      return false;
    }

    const cost = upgrade.getNextCost();

    // Check if can afford
    const canAfford = Object.entries(cost).every(([resourceId, costAmount]) => {
      const resource = this.resources[resourceId];
      if (!resource) {
        Logger.warn(`Resource ${resourceId} not found for cost check`);
        return false;
      }
      return resource.canAfford(costAmount);
    });

    if (!canAfford) {
      Logger.debug(`Cannot afford upgrade ${upgradeId}`);
      return false;
    }

    // Deduct cost
    Object.entries(cost).forEach(([resourceId, costAmount]) => {
      this.resources[resourceId].subtract(costAmount);
    });

    // Purchase upgrade
    upgrade.purchase();

    // Context doesn't need invalidation here - references stay the same
    // Only the internal state of entities changes

    return true;
  }

  /**
   * Perform prestige
   */
  performPrestige(): boolean {
    if (!this.prestige) {
      Logger.error('Cannot perform prestige: prestige system not initialized');
      return false;
    }

    const context = this.getGameContext();

    if (!this.prestige.canPrestige(context)) {
      Logger.debug('Cannot prestige: requirements not met');
      return false;
    }

    try {
      const result = this.prestige.performPrestige(context);

      // Apply new state
      this.resources = result.newState.resources;
      this.producers = result.newState.producers;
      this.upgrades = result.newState.upgrades;
      // Keep achievements

      this.stats.totalPrestige += 1;

      // Invalidate context since we replaced the resources/producers/upgrades objects
      this.invalidateContext();

      Logger.info(`Prestige completed: gained ${result.pointsGained.toFixed(2)} points, total ${result.totalPoints.toFixed(2)}`);
      return true;
    } catch (error) {
      Logger.error('Prestige failed with error:', error);
      return false;
    }
  }

  /**
   * Calculate and apply production gains while the player was offline
   *
   * Simulates resource production for the time the player was away, up to a configured limit.
   * Uses the production rates from when the player left (state at last save), not current rates.
   * Time is capped to prevent exploits and balance gameplay.
   *
   * Important notes:
   * - Offline time is capped at OFFLINE_PROGRESS_LIMIT_MS (default: 1 hour)
   * - Production is calculated using the saved game state, not current multipliers
   * - Resources still respect their maximum capacity limits
   * - No achievements are triggered during offline progress
   *
   * @param timeAway - Time away in seconds since last save
   *
   * @example
   * // Calculate offline progress for 30 minutes
   * gameEngine.calculateOfflineProgress(1800); // 1800 seconds = 30 minutes
   *
   * @see GAME_CONFIG.ENGINE.OFFLINE_PROGRESS_LIMIT_MS for maximum offline time
   * @see produceResources for the actual production calculation
   */
  calculateOfflineProgress(timeAway: number): void {
    // Limit offline progress to prevent exploits
    const effectiveTime = Math.min(timeAway, this.offlineProgressLimit / 1000);

    // Simulate production at current rates
    this.produceResources(effectiveTime);

    // Offline progress calculation complete
  }

  /**
   * Get current game context
   * Uses caching to avoid creating new object on every call
   */
  getGameContext(): GameContext {
    if (this._contextDirty || this._cachedContext === null) {
      this._cachedContext = {
        resources: this.resources,
        producers: this.producers,
        upgrades: this.upgrades,
        achievements: this.achievements,
        clickPower: this.clickPower ?? undefined,
        prestige: this.prestige ?? undefined,
      };
      this._contextDirty = false;
    }
    return this._cachedContext;
  }

  /**
   * Mark context as dirty to force rebuild on next access
   * Call this after any state change that affects game context
   */
  invalidateContext(): void {
    this._contextDirty = true;
  }

}
