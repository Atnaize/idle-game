import { Entity } from './Entity';
import { BigNumber } from './BigNumber';
import type {
  AchievementConfig,
  AchievementReward,
  GameContext,
  SerializedData,
} from '@core/types';

/**
 * Strategy interface for checking achievement conditions
 */
export interface AchievementConditionStrategy {
  check(context: GameContext): boolean;
  calculateProgress(context: GameContext): number;
}

/**
 * Strategy interface for tracking achievement progress
 */
export interface AchievementProgressStrategy {
  update(context: GameContext): void;
  getProgress(): number;
  serialize(): Record<string, unknown>;
  deserialize(data: Record<string, unknown>): void;
}

/**
 * Milestone strategy - Check if resource amount reaches target
 */
export class MilestoneConditionStrategy implements AchievementConditionStrategy {
  constructor(
    private readonly resourceId: string,
    private readonly targetAmount: BigNumber
  ) {}

  check(context: GameContext): boolean {
    const resource = context.resources[this.resourceId];
    return resource !== undefined && resource.amount.gte(this.targetAmount);
  }

  calculateProgress(context: GameContext): number {
    const resource = context.resources[this.resourceId];
    if (!resource) {
      return 0;
    }

    const current = resource.amount;
    const progress = current.div(this.targetAmount).toNumber();
    return Math.min(progress, 1);
  }
}

/**
 * Production strategy - Track total production across all time
 */
export class ProductionConditionStrategy implements AchievementConditionStrategy {
  private totalProduced: BigNumber;

  constructor(
    private readonly resourceId: string,
    private readonly targetAmount: BigNumber
  ) {
    this.totalProduced = BigNumber.zero();
  }

  addProduction(amount: BigNumber): void {
    this.totalProduced = this.totalProduced.add(amount);
  }

  check(context: GameContext): boolean {
    void context;
    return this.totalProduced.gte(this.targetAmount);
  }

  calculateProgress(context: GameContext): number {
    void context;
    const progress = this.totalProduced.div(this.targetAmount).toNumber();
    return Math.min(progress, 1);
  }

  getTotalProduced(): BigNumber {
    return this.totalProduced;
  }
}

/**
 * Purchase strategy - Check if entity reaches target level
 */
export class PurchaseConditionStrategy implements AchievementConditionStrategy {
  constructor(
    private readonly targetId: string,
    private readonly targetLevel: number
  ) {}

  check(context: GameContext): boolean {
    const target = context.producers[this.targetId] || context.upgrades[this.targetId];
    return target !== undefined && target.level >= this.targetLevel;
  }

  calculateProgress(context: GameContext): number {
    const target = context.producers[this.targetId] || context.upgrades[this.targetId];
    if (!target) {
      return 0;
    }

    const progress = target.level / this.targetLevel;
    return Math.min(progress, 1);
  }
}

/**
 * Achievement - Permanent goals with rewards
 * Uses strategy pattern for condition checking and progress tracking
 */
export class Achievement extends Entity {
  completed: boolean;
  progress: number;
  maxProgress: number;
  reward: AchievementReward | null;
  private conditionStrategy: AchievementConditionStrategy;

  constructor(
    id: string,
    config: AchievementConfig,
    conditionStrategy: AchievementConditionStrategy
  ) {
    super(id, config, 'achievement');

    this.completed = false;
    this.progress = 0;
    this.maxProgress = 1;
    this.reward = config.reward || null;
    this.conditionStrategy = conditionStrategy;
  }

  /**
   * Check if achievement condition is met
   */
  checkCondition(context: GameContext): boolean {
    return this.conditionStrategy.check(context);
  }

  /**
   * Update achievement progress
   */
  updateProgress(context: GameContext, onComplete?: (achievement: Achievement) => void): void {
    if (this.completed) {
      return;
    }

    this.progress = this.conditionStrategy.calculateProgress(context);

    if (this.checkCondition(context)) {
      this.complete(context, onComplete);
    }
  }

  /**
   * Complete the achievement
   */
  complete(context: GameContext, onComplete?: (achievement: Achievement) => void): void {
    if (this.completed) {
      return;
    }

    this.completed = true;
    this.progress = this.maxProgress;
    this.applyReward(context);

    // Trigger completion callback (for notifications, etc.)
    if (onComplete) {
      onComplete(this);
    }
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

  getConditionStrategy(): AchievementConditionStrategy {
    return this.conditionStrategy;
  }

  serialize(): SerializedData {
    return {
      ...super.serialize(),
      completed: this.completed,
      progress: this.progress,
    };
  }

  static deserialize(
    data: SerializedData,
    config: AchievementConfig,
    conditionStrategy: AchievementConditionStrategy
  ): Achievement {
    const achievement = new Achievement(data.id, config, conditionStrategy);
    achievement.completed = data.completed ?? false;
    achievement.progress = data.progress ?? 0;
    achievement.unlocked = data.unlocked;
    achievement.visible = data.visible;
    return achievement;
  }

  clone(): Achievement {
    const clone = new Achievement(
      this.id,
      {
        name: this.name,
        description: this.description,
        icon: this.icon,
        reward: this.reward ?? undefined,
        unlocked: this.unlocked,
        visible: this.visible,
      },
      this.conditionStrategy
    );
    clone.completed = this.completed;
    clone.progress = this.progress;
    clone.maxProgress = this.maxProgress;
    return clone;
  }
}
