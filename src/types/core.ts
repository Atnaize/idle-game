import { BigNumber } from '@engine/BigNumber';
import type { Resource } from '@engine/Entity';
import type { Producer, Upgrade } from '@engine/Producer';
import type { Achievement } from '@engine/Achievement';
import type { ClickPower } from '@engine/ClickPower';
import type { Prestige } from '@engine/Prestige';

/**
 * Core type definitions for the idle game
 */

export type ResourceId = string;
export type ProducerId = string;
export type UpgradeId = string;
export type AchievementId = string;

export interface GameContext {
  resources: Record<ResourceId, Resource>;
  producers: Record<ProducerId, Producer>;
  upgrades: Record<UpgradeId, Upgrade>;
  achievements: Record<AchievementId, Achievement>;
  clickPower?: ClickPower;
  prestige?: Prestige;
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
  amount?: string;
  points?: string;
  totalResets?: number;
  totalProduced?: string;
  progress?: number;
  completed?: boolean;
  purchased?: boolean;
  [key: string]: unknown;
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
  type: 'producer' | 'all_producers' | 'resource' | 'click' | 'prestige' | 'category';
  id?: string;
  category?: string;
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
