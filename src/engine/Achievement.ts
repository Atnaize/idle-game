import { Entity } from './Entity';
import { BigNumber } from './BigNumber';
import type {
  AchievementConfig,
  AchievementReward,
  GameContext,
  SerializedData,
} from '@/types/core';

/**
 * Achievement - Permanent goals with rewards
 */
export class Achievement extends Entity {
  completed: boolean;
  progress: number;
  maxProgress: number;
  reward: AchievementReward | null;

  constructor(id: string, config: AchievementConfig) {
    super(id, config, 'achievement');

    this.completed = false;
    this.progress = 0;
    this.maxProgress = 1;
    this.reward = config.reward || null;
  }

  /**
   * Check if achievement condition is met
   */
  checkCondition(context: GameContext): boolean {
    // Override in subclass
    return false;
  }

  /**
   * Update achievement progress
   */
  updateProgress(context: GameContext): void {
    if (this.completed) {
      return;
    }

    if (this.checkCondition(context)) {
      this.complete(context);
    }
  }

  /**
   * Complete the achievement
   */
  complete(context: GameContext): void {
    if (this.completed) {
      return;
    }

    this.completed = true;
    this.progress = this.maxProgress;
    this.applyReward(context);
  }

  /**
   * Apply achievement reward
   */
  applyReward(context: GameContext): void {
    if (!this.reward) {
      return;
    }

    switch (this.reward.type) {
      case 'multiplier':
        // Reward is applied by game engine
        break;

      case 'resource':
        if (this.reward.target && this.reward.amount) {
          const resource = context.resources[this.reward.target];
          if (resource) {
            resource.add(this.reward.amount);
          }
        }
        break;

      case 'unlock':
        if (this.reward.target) {
          const target =
            context.producers[this.reward.target] ||
            context.upgrades[this.reward.target];
          if (target) {
            target.unlock();
          }
        }
        break;
    }
  }

  /**
   * Get reward description
   */
  getRewardDescription(): string {
    if (!this.reward) {
      return 'No reward';
    }

    switch (this.reward.type) {
      case 'multiplier':
        return `${this.reward.value}x production multiplier`;
      case 'resource':
        return `Gain ${this.reward.amount} ${this.reward.target}`;
      case 'unlock':
        return `Unlock ${this.reward.target}`;
      default:
        return 'Unknown reward';
    }
  }

  serialize(): SerializedData {
    return {
      ...super.serialize(),
      completed: this.completed,
      progress: this.progress,
    };
  }

  static deserialize(data: SerializedData, config: AchievementConfig): Achievement {
    const achievement = new Achievement(data.id, config);
    achievement.completed = data.completed;
    achievement.progress = data.progress;
    achievement.unlocked = data.unlocked;
    achievement.visible = data.visible;
    return achievement;
  }

  clone(): Achievement {
    const clone = new Achievement(this.id, {
      name: this.name,
      description: this.description,
      icon: this.icon,
      reward: this.reward ?? undefined,
      unlocked: this.unlocked,
      visible: this.visible,
    });
    clone.completed = this.completed;
    clone.progress = this.progress;
    clone.maxProgress = this.maxProgress;
    return clone;
  }
}

/**
 * MilestoneAchievement - Reach a specific resource amount
 */
export class MilestoneAchievement extends Achievement {
  resourceId: string;
  targetAmount: BigNumber;

  constructor(
    id: string,
    config: AchievementConfig & { resourceId: string; targetAmount: BigNumber | number | string }
  ) {
    super(id, config);
    this.resourceId = config.resourceId;
    this.targetAmount = BigNumber.from(config.targetAmount);
  }

  checkCondition(context: GameContext): boolean {
    const resource = context.resources[this.resourceId];
    return resource && resource.getAmount().gte(this.targetAmount);
  }

  updateProgress(context: GameContext): void {
    if (this.completed) {
      return;
    }

    const resource = context.resources[this.resourceId];
    if (resource) {
      const current = resource.getAmount();
      this.progress = current.div(this.targetAmount).toNumber();
      this.progress = Math.min(this.progress, 1);
    }

    super.updateProgress(context);
  }
}

/**
 * ProductionAchievement - Produce total amount across all time
 */
export class ProductionAchievement extends Achievement {
  resourceId: string;
  targetAmount: BigNumber;
  totalProduced: BigNumber;

  constructor(
    id: string,
    config: AchievementConfig & { resourceId: string; targetAmount: BigNumber | number | string }
  ) {
    super(id, config);
    this.resourceId = config.resourceId;
    this.targetAmount = BigNumber.from(config.targetAmount);
    this.totalProduced = BigNumber.zero();
  }

  addProduction(amount: BigNumber): void {
    this.totalProduced = this.totalProduced.add(amount);
  }

  checkCondition(context: GameContext): boolean {
    return this.totalProduced.gte(this.targetAmount);
  }

  updateProgress(context: GameContext): void {
    if (this.completed) {
      return;
    }

    this.progress = this.totalProduced.div(this.targetAmount).toNumber();
    this.progress = Math.min(this.progress, 1);

    super.updateProgress(context);
  }
}

/**
 * PurchaseAchievement - Purchase a specific amount of something
 */
export class PurchaseAchievement extends Achievement {
  targetId: string;
  targetLevel: number;

  constructor(
    id: string,
    config: AchievementConfig & { targetId: string; targetLevel: number }
  ) {
    super(id, config);
    this.targetId = config.targetId;
    this.targetLevel = config.targetLevel;
  }

  checkCondition(context: GameContext): boolean {
    const target = context.producers[this.targetId] || context.upgrades[this.targetId];
    return target && target.level >= this.targetLevel;
  }

  updateProgress(context: GameContext): void {
    if (this.completed) {
      return;
    }

    const target = context.producers[this.targetId] || context.upgrades[this.targetId];
    if (target) {
      this.progress = target.level / this.targetLevel;
      this.progress = Math.min(this.progress, 1);
    }

    super.updateProgress(context);
  }
}
