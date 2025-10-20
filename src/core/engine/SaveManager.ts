import { BigNumber } from './BigNumber';
import { Logger } from '@core/utils';
import { GAME_CONFIG } from '@core/constants/gameConfig';
import type {
  SaveData,
  SerializedData,
  ResourceId,
  ProducerId,
  UpgradeId,
  AchievementId,
} from '@core/types';
import type { GameEngine } from './GameEngine';

/**
 * Result of a load operation, including offline progress information
 */
export interface LoadResult {
  success: boolean;
  offlineInfo?: {
    timeAway: number;
    maxOfflineTime: number;
  };
  error?: string;
}

/**
 * SaveManager - Handles all save/load operations for the game
 *
 * Responsibilities:
 * - Serialize/deserialize game state
 * - Manage localStorage persistence
 * - Handle version migrations
 * - Calculate offline progress
 * - Provide error handling and logging
 *
 * Design principles:
 * - Single Responsibility: Only deals with persistence
 * - Separation of Concerns: GameEngine focuses on game logic
 * - Extensibility: Easy to add compression, cloud saves, etc.
 */
export class SaveManager {
  private static readonly SAVE_KEY = 'idle-game-save';
  private static readonly CURRENT_VERSION = GAME_CONFIG.SAVE.CURRENT_VERSION;

  /**
   * Save game state to localStorage
   *
   * @param engine - The game engine to save
   * @returns True if save was successful, false otherwise
   *
   * @example
   * const success = SaveManager.save(gameEngine);
   * if (!success) {
   *   console.error('Failed to save game');
   * }
   */
  static save(engine: GameEngine): boolean {
    try {
      const saveData = this.serialize(engine);
      const json = this.compress(saveData);

      localStorage.setItem(this.SAVE_KEY, json);

      Logger.debug('Game saved successfully', {
        size: `${(json.length / 1024).toFixed(2)} KB`,
        timestamp: new Date(saveData.timestamp).toLocaleString(),
        version: saveData.version,
      });

      return true;
    } catch (error) {
      Logger.error('Failed to save game', error);
      return false;
    }
  }

  /**
   * Load game state from localStorage
   *
   * @param engine - The game engine to load state into
   * @returns LoadResult with success status and optional offline progress info
   *
   * @example
   * const result = SaveManager.load(gameEngine);
   * if (result.success && result.offlineInfo) {
   *   console.log(`You were away for ${result.offlineInfo.timeAway} seconds`);
   * }
   */
  static load(engine: GameEngine): LoadResult {
    try {
      const json = localStorage.getItem(this.SAVE_KEY);
      if (!json) {
        Logger.debug('No save data found');
        return { success: false };
      }

      const saveData = this.decompress(json);
      const migrated = this.migrate(saveData);

      Logger.debug('Loading game', {
        version: migrated.version,
        timestamp: new Date(migrated.timestamp).toLocaleString(),
      });

      // Deserialize all game state
      this.deserialize(engine, migrated);

      // Calculate offline progress
      const offlineInfo = this.calculateOfflineProgress(engine, migrated.timestamp);

      Logger.debug('Game loaded successfully');

      return {
        success: true,
        offlineInfo,
      };
    } catch (error) {
      Logger.error('Failed to load game', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if a save file exists
   */
  static hasSaveData(): boolean {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }

  /**
   * Delete save data from localStorage
   */
  static deleteSave(): void {
    localStorage.removeItem(this.SAVE_KEY);
    Logger.info('Save data deleted');
  }

  /**
   * Export save data as a JSON string for backup/sharing
   */
  static exportSave(): string | null {
    try {
      const json = localStorage.getItem(this.SAVE_KEY);
      if (!json) {
        Logger.warn('No save data to export');
        return null;
      }

      // Validate it's valid JSON
      JSON.parse(json);
      return json;
    } catch (error) {
      Logger.error('Failed to export save', error);
      return null;
    }
  }

  /**
   * Import save data from a JSON string
   *
   * @param json - The JSON string to import
   * @returns True if import was successful
   */
  static importSave(json: string): boolean {
    try {
      // Validate JSON structure
      const saveData = JSON.parse(json) as SaveData;

      if (!saveData.version || !saveData.timestamp) {
        Logger.error('Invalid save data structure');
        return false;
      }

      // Store the imported data
      localStorage.setItem(this.SAVE_KEY, json);
      Logger.info('Save data imported successfully');
      return true;
    } catch (error) {
      Logger.error('Failed to import save', error);
      return false;
    }
  }

  /**
   * Serialize game state to SaveData format
   */
  private static serialize(engine: GameEngine): SaveData {
    const resources: Record<ResourceId, SerializedData> = {};
    Object.entries(engine.resources).forEach(([id, resource]) => {
      resources[id as ResourceId] = resource.serialize();
    });

    const producers: Record<ProducerId, SerializedData> = {};
    Object.entries(engine.producers).forEach(([id, producer]) => {
      producers[id as ProducerId] = producer.serialize();
    });

    const upgrades: Record<UpgradeId, SerializedData> = {};
    Object.entries(engine.upgrades).forEach(([id, upgrade]) => {
      upgrades[id as UpgradeId] = upgrade.serialize();
    });

    const achievements: Record<AchievementId, SerializedData> = {};
    Object.entries(engine.achievements).forEach(([id, achievement]) => {
      achievements[id as AchievementId] = achievement.serialize();
    });

    return {
      version: this.CURRENT_VERSION,
      timestamp: Date.now(),
      resources,
      producers,
      upgrades,
      achievements,
      clickPower: engine.clickPower?.serialize(),
      prestige: engine.prestige
        ? {
            points: engine.prestige.prestigePoints.serialize(),
            totalResets: engine.prestige.totalResets,
          }
        : undefined,
      stats: engine.stats,
    };
  }

  /**
   * Deserialize SaveData into game engine state
   */
  private static deserialize(engine: GameEngine, saveData: SaveData): void {
    // Restore all game entities
    this.deserializeResources(engine, saveData.resources);
    this.deserializeProducers(engine, saveData.producers);
    this.deserializeUpgrades(engine, saveData.upgrades);
    this.deserializeAchievements(engine, saveData.achievements);
    this.deserializeClickPower(engine, saveData.clickPower);
    this.deserializePrestige(engine, saveData.prestige);

    // Restore game stats
    if (saveData.stats) {
      engine.stats = { ...saveData.stats };
    }

    // Invalidate context cache to force rebuild with new state
    engine.invalidateContext();
  }

  /**
   * Restore resources from save data
   */
  private static deserializeResources(
    engine: GameEngine,
    resourcesData: Record<ResourceId, SerializedData>
  ): void {
    Object.entries(resourcesData).forEach(([id, data]) => {
      const resource = engine.resources[id as ResourceId];
      if (resource) {
        if (data.amount) {
          resource.amount = BigNumber.deserialize(data.amount);
        }
        resource.unlocked = data.unlocked;
        resource.visible = data.visible;
      } else {
        Logger.warn(`Resource ${id} not found during deserialization`);
      }
    });
  }

  /**
   * Restore producers from save data
   */
  private static deserializeProducers(
    engine: GameEngine,
    producersData: Record<ProducerId, SerializedData>
  ): void {
    Object.entries(producersData).forEach(([id, data]) => {
      const producer = engine.producers[id as ProducerId];
      if (producer) {
        producer.level = data.level;
        producer.unlocked = data.unlocked;
        producer.visible = data.visible;
        Logger.debug(`Restored producer ${id}: level=${data.level}`);
        if (data.productionMultiplier) {
          producer.productionMultiplier = BigNumber.deserialize(
            data.productionMultiplier as string
          );
        }
      } else {
        Logger.warn(`Producer ${id} not found during deserialization`);
      }
    });
  }

  /**
   * Restore upgrades from save data
   */
  private static deserializeUpgrades(
    engine: GameEngine,
    upgradesData: Record<UpgradeId, SerializedData>
  ): void {
    Object.entries(upgradesData).forEach(([id, data]) => {
      const upgrade = engine.upgrades[id as UpgradeId];
      if (upgrade) {
        upgrade.level = data.level;
        upgrade.unlocked = data.unlocked;
        upgrade.visible = data.visible;
        if (data.purchased !== undefined) {
          upgrade.purchased = data.purchased;
        }
      }
    });
  }

  /**
   * Restore achievements from save data
   */
  private static deserializeAchievements(
    engine: GameEngine,
    achievementsData: Record<AchievementId, SerializedData>
  ): void {
    Object.entries(achievementsData).forEach(([id, data]) => {
      const achievement = engine.achievements[id as AchievementId];
      if (achievement) {
        achievement.unlocked = data.unlocked;
        achievement.visible = data.visible;
        if (data.completed !== undefined) {
          achievement.completed = data.completed;
        }
        if (data.progress !== undefined) {
          achievement.progress = data.progress;
        }
      }
    });
  }

  /**
   * Restore click power from save data
   */
  private static deserializeClickPower(
    engine: GameEngine,
    clickPowerData?: SerializedData
  ): void {
    if (clickPowerData && engine.clickPower) {
      engine.clickPower.level = clickPowerData.level;
      engine.clickPower.unlocked = clickPowerData.unlocked;
      engine.clickPower.visible = clickPowerData.visible;
    }
  }

  /**
   * Restore prestige from save data
   */
  private static deserializePrestige(
    engine: GameEngine,
    prestigeData?: { points: string; totalResets: number }
  ): void {
    if (prestigeData && engine.prestige) {
      engine.prestige.prestigePoints = BigNumber.deserialize(prestigeData.points);
      engine.prestige.totalResets = prestigeData.totalResets;
    }
  }

  /**
   * Calculate offline progress since last save
   *
   * @param engine - The game engine
   * @param savedTimestamp - Timestamp of last save (in milliseconds)
   * @returns Offline progress information
   */
  private static calculateOfflineProgress(
    engine: GameEngine,
    savedTimestamp: number
  ): { timeAway: number; maxOfflineTime: number } {
    const now = Date.now();
    const timeAway = (now - savedTimestamp) / 1000; // Convert to seconds
    const maxOfflineTime = GAME_CONFIG.ENGINE.OFFLINE_PROGRESS_LIMIT_MS / 1000;

    // Only calculate offline progress if away for more than configured threshold
    if (timeAway > GAME_CONFIG.SAVE.MIN_OFFLINE_TIME_FOR_MODAL) {
      engine.calculateOfflineProgress(timeAway);
      Logger.debug(`Offline progress calculated: ${Math.floor(timeAway / 60)} minutes away`);
    }

    return { timeAway, maxOfflineTime };
  }

  /**
   * Migrate save data from older versions to current version
   *
   * @param saveData - The save data to migrate
   * @returns Migrated save data
   */
  private static migrate(saveData: SaveData): SaveData {
    if (saveData.version === this.CURRENT_VERSION) {
      return saveData;
    }

    Logger.info(
      `Migrating save from v${saveData.version} to v${this.CURRENT_VERSION}`
    );

    // Migration logic for future versions
    // Example:
    // if (saveData.version === '1.0.0') {
    //   saveData = this.migrateFrom1_0_0To1_1_0(saveData);
    // }

    // Update version after migration
    saveData.version = this.CURRENT_VERSION;

    return saveData;
  }

  /**
   * Compress save data to JSON string
   *
   * Currently just uses JSON.stringify, but can be extended
   * to use LZ-string or other compression libraries
   */
  private static compress(data: SaveData): string {
    return JSON.stringify(data);
  }

  /**
   * Decompress JSON string to save data
   */
  private static decompress(json: string): SaveData {
    return JSON.parse(json) as SaveData;
  }

  // Future migration methods can be added here
  // Example:
  // private static migrateFrom1_0_0To1_1_0(saveData: SaveData): SaveData {
  //   // Add new fields with default values
  //   // Transform old data structures to new ones
  //   return saveData;
  // }
}
