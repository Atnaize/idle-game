import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameEngine } from '@engine/GameEngine';
import {
  createResources,
  createProducers,
  createUpgrades,
  createAchievements,
  createClickPower,
  createClickUpgrades,
  createPrestige,
  TABS,
  type TabId,
} from '@/config';
import type { BuyAmount, ProducerId, UpgradeId } from '@/types/core';
import { BigNumber } from '@engine/BigNumber';

interface GameState {
  // Game engine instance
  engine: GameEngine | null;

  // UI state
  buyAmount: BuyAmount;
  selectedTab: TabId;

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
        Object.values(clickUpgrades).forEach((upgrade: any) => {
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

        // Start engine
        engine.start();

        set({ engine, initialized: true });

        // Setup tick interval for React updates
        setInterval(() => {
          get().forceTick();
        }, 100); // Update UI 10 times per second

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
        // Game saved to localStorage
      },

      loadGame: () => {
        try {
          const savedData = localStorage.getItem('idle-game-save');
          if (!savedData) {
            return;
          }

          // For now, we'll handle loading on next initialization
          // Full deserialization would require factories for each class type
          // Save data found, but deserialization not yet implemented
        } catch (error) {
          console.error('Failed to load game:', error);
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
      name: 'idle-game-storage',
      partialize: (state) => ({
        // Only persist UI state, not the engine
        buyAmount: state.buyAmount,
        selectedTab: state.selectedTab,
      }),
    }
  )
);

// Auto-save every 30 seconds
setInterval(() => {
  const state = useGameStore.getState();
  if (state.engine) {
    state.saveGame();
  }
}, 30000);
