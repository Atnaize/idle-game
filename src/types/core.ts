import { BigNumber } from '@engine/BigNumber';

/**
 * Core type definitions for the idle game
 */

export type ResourceId = string;
export type ProducerId = string;
export type UpgradeId = string;
export type AchievementId = string;

export interface GameContext {
  resources: Record<ResourceId, any>;
  producers: Record<ProducerId, any>;
  upgrades: Record<UpgradeId, any>;
  achievements: Record<AchievementId, any>;
  clickPower?: any;
  prestige?: any;
  deltaTime?: number;
}

export interface Cost {
  [resourceId: ResourceId]: BigNumber | number | string;
}

export interface Production {
  [resourceId: ResourceId]: BigNumber | number | string;
}

export interface SerializedData {
  id: string;
  level: number;
  unlocked: boolean;
  visible: boolean;
  [key: string]: any;
}

export interface UnlockCondition {
  (context: GameContext): boolean;
}

export interface EntityConfig {
  name: string;
  description: string;
  icon?: string;
  unlocked?: boolean;
  visible?: boolean;
}

export interface ResourceConfig extends EntityConfig {
  amount?: BigNumber | number | string;
  maxAmount?: BigNumber | number | string;
  color?: string;
}

export interface PurchasableConfig extends EntityConfig {
  baseCost: Cost;
  costMultiplier?: number;
  maxLevel?: number;
}

export interface ProducerConfig extends PurchasableConfig {
  baseProduction: Production;
  unlockCondition?: UnlockCondition;
  tier?: number;
}

export interface UpgradeConfig extends PurchasableConfig {
  effectType?: 'multiplier' | 'additive' | 'flat';
  effectValue?: number;
  target?: UpgradeTarget | ((gameState: GameContext, effect: BigNumber) => void);
  unlockCondition?: UnlockCondition;
}

export interface UpgradeTarget {
  type: 'producer' | 'all_producers' | 'resource' | 'click' | 'prestige';
  id?: string;
}

export interface AchievementConfig extends EntityConfig {
  reward?: AchievementReward;
}

export interface AchievementReward {
  type: 'multiplier' | 'resource' | 'unlock';
  target?: string;
  value?: number;
  amount?: BigNumber | number | string;
}

export interface PrestigeConfig {
  name: string;
  description: string;
  minRequirement: BigNumber | number | string;
  currencyId: ResourceId;
  formula: (amount: BigNumber) => BigNumber;
  bonusPerPoint?: number;
  keepProducers?: ProducerId[];
  keepUpgrades?: UpgradeId[];
}

export interface ClickPowerConfig extends PurchasableConfig {
  baseClickValue: BigNumber | number | string;
  critChance?: number;
  critMultiplier?: number;
}

export interface ClickUpgradeConfig extends UpgradeConfig {
  clickPowerTarget?: 'value' | 'crit_chance' | 'crit_multiplier';
}

export interface SaveData {
  version: string;
  timestamp: number;
  resources: Record<ResourceId, SerializedData>;
  producers: Record<ProducerId, SerializedData>;
  upgrades: Record<UpgradeId, SerializedData>;
  achievements: Record<AchievementId, SerializedData>;
  clickPower?: SerializedData;
  prestige?: {
    points: string;
    totalResets: number;
  };
  stats: GameStats;
}

export interface GameStats {
  totalPlayTime: number;
  totalClicks: number;
  totalPrestige: number;
  lifetimeOre: string;
}

export type BuyAmount = 1 | 10 | 25 | 100 | 'max';
