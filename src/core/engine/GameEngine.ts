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
} from '@core/types';
import type { Resource } from './Entity';
import type { Producer, Upgrade } from './Producer';
import type { Achievement } from './Achievement';
import type { ClickPower } from './ClickPower';
import type { Prestige } from './Prestige';
import { RESOURCES } from '@features/resources/config/resources.config';
import { GAME_CONFIG, DERIVED_CONFIG } from '../constants/gameConfig';

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

    // Context doesn't need invalidation here - references stay the same
    // Only the internal state of entities changes

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

    // Invalidate context since we replaced the resources/producers/upgrades objects
    this.invalidateContext();

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
  private invalidateContext(): void {
    this._contextDirty = true;
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

  /**
   * Deserialize game state from save data
   * This method restores the saved state into the current entities
   * Must be called after all entities have been added to the engine
   */
  deserialize(saveData: SaveData): void {
    // Validate save version
    if (saveData.version !== GAME_CONFIG.SAVE.CURRENT_VERSION) {
      console.warn(`Save version mismatch: expected ${GAME_CONFIG.SAVE.CURRENT_VERSION}, got ${saveData.version}`);
      // In the future, implement migration logic here
    }

    // Restore resources
    Object.entries(saveData.resources).forEach(([id, data]) => {
      const resource = this.resources[id];
      if (resource) {
        if (data.amount) {
          resource.amount = BigNumber.deserialize(data.amount);
        }
        resource.unlocked = data.unlocked;
        resource.visible = data.visible;
      }
    });

    // Restore producers
    Object.entries(saveData.producers).forEach(([id, data]) => {
      const producer = this.producers[id];
      if (producer) {
        producer.level = data.level;
        producer.unlocked = data.unlocked;
        producer.visible = data.visible;
        if (data.productionMultiplier) {
          // Access private field through type assertion
          (producer as any).productionMultiplier = BigNumber.deserialize(data.productionMultiplier as string);
        }
      }
    });

    // Restore upgrades
    Object.entries(saveData.upgrades).forEach(([id, data]) => {
      const upgrade = this.upgrades[id];
      if (upgrade) {
        upgrade.level = data.level;
        upgrade.unlocked = data.unlocked;
        upgrade.visible = data.visible;
        if (data.purchased !== undefined) {
          (upgrade as any).purchased = data.purchased;
        }
      }
    });

    // Restore achievements
    Object.entries(saveData.achievements).forEach(([id, data]) => {
      const achievement = this.achievements[id];
      if (achievement) {
        achievement.unlocked = data.unlocked;
        achievement.visible = data.visible;
        if (data.completed !== undefined) {
          (achievement as any).completed = data.completed;
        }
        if (data.progress !== undefined) {
          (achievement as any).progress = data.progress;
        }
      }
    });

    // Restore click power
    if (saveData.clickPower && this.clickPower) {
      this.clickPower.level = saveData.clickPower.level;
      this.clickPower.unlocked = saveData.clickPower.unlocked;
      this.clickPower.visible = saveData.clickPower.visible;
    }

    // Restore prestige
    if (saveData.prestige && this.prestige) {
      (this.prestige as any).prestigePoints = BigNumber.deserialize(saveData.prestige.points);
      (this.prestige as any).totalResets = saveData.prestige.totalResets;
    }

    // Restore stats
    if (saveData.stats) {
      this.stats = { ...saveData.stats };
    }

    // Calculate offline progress
    const now = Date.now();
    const timeAway = (now - saveData.timestamp) / 1000; // Convert to seconds
    if (timeAway > 5) { // Only if more than 5 seconds away
      this.calculateOfflineProgress(timeAway);
      console.log(`Offline progress calculated: ${Math.floor(timeAway / 60)} minutes away`);
    }

    // Invalidate context to force rebuild with new state
    this.invalidateContext();
  }
}
