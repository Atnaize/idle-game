import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameEngine, BigNumber } from '@core/engine';
import { Logger } from '@core/utils';
import { GAME_CONFIG } from '@core/constants/gameConfig';
import { createResources } from '@features/resources';
import { createProducers } from '@features/producers';
import { createUpgrades } from '@features/upgrades';
import { createAchievements } from '@features/achievements';
import { createClickPower, createClickUpgrades } from '@features/click';
import { createPrestige } from '@features/prestige';
import { TABS, type TabId } from '@shared/config';
import type { BuyAmount, ProducerId, UpgradeId } from '@core/types';

interface OfflineProgressInfo {
  timeAway: number;
  maxOfflineTime: number;
}

interface GameState {
  // Game engine instance
  engine: GameEngine | null;

  // UI state
  buyAmount: BuyAmount;
  selectedTab: TabId;

  // Offline progress modal
  offlineProgress: OfflineProgressInfo | null;
  dismissOfflineProgress: () => void;

  // Initialization
  initialized: boolean;
  initializeGame: () => void;

  // Actions
  setBuyAmount: (amount: BuyAmount) => void;
  setSelectedTab: (tab: TabId) => void;
  handleClick: () => { amount: BigNumber; wasCrit: boolean };
  purchaseProducer: (producerId: ProducerId, amount?: number) => boolean;
  purchaseUpgrade: (upgradeId: UpgradeId) => boolean;
  performPrestige: () => boolean;

  // Save/Load
  saveGame: () => void;
  loadGame: () => void;
  resetGame: () => void;

  // Force re-render trigger
  tick: number;
  forceTick: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      engine: null,
      buyAmount: 1,
      selectedTab: TABS.PRODUCERS,
      initialized: false,
      tick: 0,
      offlineProgress: null,

      // Offline progress
      dismissOfflineProgress: () => set({ offlineProgress: null }),

      // Initialize game
      initializeGame: () => {
        const state = get();
        if (state.initialized && state.engine) {
          return;
        }

        // Initialize game engine

        // Create engine
        const engine = new GameEngine({
          targetFPS: 20,
          autoSaveInterval: 30000,
          offlineProgressLimit: 3600000,
        });

        // Add resources
        const resources = createResources();
        Object.values(resources).forEach((resource) => {
          engine.addResource(resource);
        });

        // Add producers
        const producers = createProducers();
        Object.values(producers).forEach((producer) => {
          engine.addProducer(producer);
        });

        // Add upgrades
        const upgrades = createUpgrades();
        Object.values(upgrades).forEach((upgrade) => {
          engine.addUpgrade(upgrade);
        });

        // Add click upgrades (these are regular upgrades that target click power)
        const clickUpgrades = createClickUpgrades();
        Object.values(clickUpgrades).forEach((upgrade) => {
          engine.addUpgrade(upgrade);
        });

        // Add achievements
        const achievements = createAchievements();
        Object.values(achievements).forEach((achievement) => {
          engine.addAchievement(achievement);
        });

        // Add click power
        const clickPower = createClickPower();
        engine.setClickPower(clickPower);

        // Add prestige
        const prestige = createPrestige();
        engine.setPrestige(prestige);

        // Setup achievement completion callback for notifications
        engine.onAchievementComplete = (achievement) => {
          // This will be imported from toast store
          // For now, we'll add it after creating the toast integration
          if (typeof window !== 'undefined') {
            // Trigger toast notification
            import('@features/notifications/store/toastStore').then(({ useToastStore }) => {
              useToastStore.getState().showAchievement(
                achievement.id,
                achievement.name,
                achievement.icon
              );
            });
          }
        };

        // Start engine
        engine.start();

        set({ engine, initialized: true });

        // UI update loop is now managed by useGameLoop hook in App.tsx
        // Auto-save is now managed by useAutoSave hook in App.tsx

        // Try to load saved game
        get().loadGame();

        // Game initialization complete
      },

      // UI Actions
      setBuyAmount: (amount) => set({ buyAmount: amount }),

      setSelectedTab: (tab) => set({ selectedTab: tab }),

      handleClick: () => {
        const { engine } = get();
        if (!engine) {
          return { amount: BigNumber.zero(), wasCrit: false };
        }

        const result = engine.handleClick();
        get().forceTick();
        return result;
      },

      purchaseProducer: (producerId, amount) => {
        const { engine, buyAmount: stateBuyAmount } = get();
        if (!engine) {
          return false;
        }

        const producer = engine.producers[producerId];
        if (!producer) {
          return false;
        }

        let purchaseAmount = amount ?? 1;

        // Handle 'max' buy amount
        if (amount === undefined) {
          if (stateBuyAmount === 'max') {
            purchaseAmount = producer.getMaxAffordable(engine.resources);
          } else {
            purchaseAmount = stateBuyAmount;
          }
        }

        if (purchaseAmount === 0) {
          return false;
        }

        const success = engine.purchaseProducer(producerId, purchaseAmount);
        if (success) {
          get().forceTick();
        }
        return success;
      },

      purchaseUpgrade: (upgradeId) => {
        const { engine } = get();
        if (!engine) {
          return false;
        }

        const success = engine.purchaseUpgrade(upgradeId);
        if (success) {
          get().forceTick();
        }
        return success;
      },

      performPrestige: () => {
        const { engine } = get();
        if (!engine) {
          return false;
        }

        const success = engine.performPrestige();
        if (success) {
          get().forceTick();
        }
        return success;
      },

      // Save/Load
      saveGame: () => {
        const { engine } = get();
        if (!engine) {
          return;
        }

        const saveData = engine.serialize();
        localStorage.setItem('idle-game-save', JSON.stringify(saveData));
        Logger.debug('Game saved:', {
          producers: Object.keys(saveData.producers).length,
          achievements: Object.keys(saveData.achievements).length,
          timestamp: new Date(saveData.timestamp).toLocaleString(),
        });
      },

      loadGame: () => {
        try {
          const savedData = localStorage.getItem('idle-game-save');
          if (!savedData) {
            Logger.debug('No save data found');
            return;
          }

          const { engine } = get();
          if (!engine) {
            Logger.warn('Cannot load game: engine not initialized');
            return;
          }

          const saveData = JSON.parse(savedData);
          Logger.debug('Loading game:', {
            producers: Object.keys(saveData.producers || {}).length,
            achievements: Object.keys(saveData.achievements || {}).length,
            timestamp: new Date(saveData.timestamp).toLocaleString(),
          });

          const offlineInfo = engine.deserialize(saveData);

          // Show offline progress modal if away for more than configured threshold
          if (offlineInfo.timeAway > GAME_CONFIG.SAVE.MIN_OFFLINE_TIME_FOR_MODAL) {
            set({ offlineProgress: offlineInfo });
          }

          // Force UI update
          get().forceTick();

          Logger.debug('Game loaded successfully');
        } catch (error) {
          Logger.error('Failed to load game:', error);
        }
      },

      resetGame: () => {
        localStorage.removeItem('idle-game-save');
        window.location.reload();
      },

      forceTick: () => {
        set((state) => ({ tick: state.tick + 1 }));
      },
    }),
    {
      name: 'idle-game-ui-state',
      partialize: (state) => ({
        // Only persist UI state, not the engine
        buyAmount: state.buyAmount,
        selectedTab: state.selectedTab,
      }),
    }
  )
);

// Auto-save is now managed by useAutoSave hook in App.tsx
