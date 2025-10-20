import { BigNumber } from './BigNumber';
import { GAME_CONFIG } from '@core/constants/gameConfig';
import { CostStrategyFactory } from './strategies/CostStrategyFactory';
import type {
  EntityConfig,
  ResourceConfig,
  PurchasableConfig,
  Cost,
  GameContext,
  SerializedData,
} from '@core/types';
import type { CostStrategy, CostStrategyConfig } from './strategies';

/**
 * Base Entity class for all game objects
 */
export abstract class Entity {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly type: string;
  unlocked: boolean;
  visible: boolean;

  constructor(id: string, config: EntityConfig, type: string = 'entity') {
    this.id = id;
    this.name = config.name;
    this.description = config.description;
    this.icon = config.icon || '📦';
    this.type = type;
    this.unlocked = config.unlocked ?? false;
    this.visible = config.visible ?? true;
  }

  /**
   * Unlock this entity
   */
  unlock(): void {
    this.unlocked = true;
    this.visible = true;
  }

  /**
   * Update entity state (called every tick)
   */
  tick(deltaTime: number, context: GameContext): void {
    // Override in subclass
    // Base implementation doesn't use these, but subclasses do
    void deltaTime;
    void context;
  }

  /**
   * Serialize to plain object for saving
   */
  serialize(): SerializedData {
    return {
      id: this.id,
      level: 0,
      unlocked: this.unlocked,
      visible: this.visible,
    };
  }

  /**
   * Clone this entity
   */
  abstract clone(): Entity;
}

/**
 * Resource Entity - Collectable/spendable game resources
 */
export class Resource extends Entity {
  private _amount: BigNumber;
  maxAmount: BigNumber | null;
  readonly color: string;

  constructor(id: string, config: ResourceConfig) {
    super(id, config, 'resource');

    this._amount = BigNumber.from(config.amount || 0);
    this.maxAmount = config.maxAmount ? BigNumber.from(config.maxAmount) : null;
    this.color = config.color || '#ffffff';
  }

  /**
   * Get current amount (returns copy for immutability)
   */
  get amount(): BigNumber {
    return new BigNumber(this._amount);
  }

  /**
   * Set amount (automatically clamps to max if applicable)
   */
  set amount(value: BigNumber) {
    this._amount = this.clampToMax(value);
  }

  /**
   * Clamp value to max amount if applicable
   */
  private clampToMax(value: BigNumber): BigNumber {
    if (this.maxAmount && value.gt(this.maxAmount)) {
      return new BigNumber(this.maxAmount);
    }
    return value;
  }

  /**
   * Add amount to resource
   */
  add(amount: BigNumber | number | string): BigNumber {
    const value = BigNumber.from(amount);
    const newAmount = this._amount.earn(value);

    if (this.maxAmount && newAmount.gt(this.maxAmount)) {
      const actualAdded = this.maxAmount.sub(this._amount);
      this._amount = new BigNumber(this.maxAmount);
      return actualAdded;
    }

    this._amount = newAmount;
    return value;
  }

  /**
   * Subtract amount from resource
   */
  subtract(amount: BigNumber | number | string): boolean {
    const value = BigNumber.from(amount);

    if (!this.canAfford(value)) {
      return false;
    }

    this._amount = this._amount.spend(value);
    return true;
  }

  /**
   * Check if can afford cost
   */
  canAfford(cost: BigNumber | number | string): boolean {
    return this._amount.canAfford(cost);
  }

  /**
   * Check if at max capacity
   */
  isAtMax(): boolean {
    if (!this.maxAmount) {
      return false;
    }
    return this._amount.gte(this.maxAmount);
  }

  /**
   * Get percentage of max capacity (0-100)
   */
  getPercentFull(): BigNumber {
    if (!this.maxAmount) {
      return BigNumber.zero();
    }
    return this._amount.percentOf(this.maxAmount);
  }

  serialize(): SerializedData {
    return {
      ...super.serialize(),
      amount: this._amount.serialize(),
    };
  }

  static deserialize(data: SerializedData, config: ResourceConfig): Resource {
    const resource = new Resource(data.id, config);
    resource._amount = BigNumber.deserialize(data.amount ?? '0');
    resource.unlocked = data.unlocked;
    resource.visible = data.visible;
    return resource;
  }

  clone(): Resource {
    return new Resource(this.id, {
      name: this.name,
      description: this.description,
      icon: this.icon,
      amount: this.amount,
      maxAmount: this.maxAmount ?? undefined,
      color: this.color,
      unlocked: this.unlocked,
      visible: this.visible,
    });
  }
}

/**
 * Purchasable Entity - Can be bought with resources
 */
export abstract class Purchasable extends Entity {
  level: number;
  readonly baseCost: Cost;
  readonly costMultiplier: number;
  readonly maxLevel: number;
  private readonly costStrategy: CostStrategy;

  constructor(id: string, config: PurchasableConfig, type: string = 'purchasable') {
    super(id, config, type);

    this.level = 0;
    this.baseCost = this.normalizeCost(config.baseCost);
    this.costMultiplier = config.costMultiplier || 1.15;
    this.maxLevel = config.maxLevel || Infinity;

    // Initialize cost strategy
    this.costStrategy = this.initializeCostStrategy(config);
  }

  /**
   * Initialize the cost strategy from config
   */
  private initializeCostStrategy(config: PurchasableConfig): CostStrategy {
    // If explicit strategy provided, use it
    if (config.costStrategy) {
      // If it's already a CostStrategy instance, use it
      if ('calculateCost' in config.costStrategy) {
        return config.costStrategy as CostStrategy;
      }
      // Otherwise, it's a config object - create from factory
      return CostStrategyFactory.create(config.costStrategy as CostStrategyConfig);
    }

    // Fallback to creating exponential strategy from costMultiplier
    return CostStrategyFactory.createDefault(config.costMultiplier || 1.15);
  }

  /**
   * Normalize cost object to use BigNumber
   */
  protected normalizeCost(cost: Cost): Cost {
    const normalized: Cost = {};
    for (const [resourceId, amount] of Object.entries(cost)) {
      normalized[resourceId] = BigNumber.from(amount);
    }
    return normalized;
  }

  /**
   * Calculate the total cost for purchasing the next N levels
   *
   * Delegates to the configured cost strategy for flexible cost curves.
   * Supports exponential, linear, polynomial, step, and hybrid strategies.
   *
   * @param levels - Number of levels to purchase (default: 1)
   * @returns Cost object with resource requirements for all levels
   *
   * @example
   * // Cost for next level
   * const cost = producer.getNextCost(); // { ore: BigNumber(100) }
   *
   * // Cost for next 10 levels (total, not per level)
   * const bulkCost = producer.getNextCost(10); // { ore: BigNumber(1584) }
   */
  getNextCost(levels: number = 1): Cost {
    return this.costStrategy.calculateCost(this.baseCost, this.level, levels);
  }

  /**
   * Get the cost strategy description (useful for debugging/UI)
   */
  getCostStrategyDescription(): string {
    return this.costStrategy.getDescription();
  }

  /**
   * Calculate the maximum number of levels that can be purchased with current resources
   *
   * Performs iterative calculation up to MAX_AFFORDABLE_CALC_LIMIT for performance.
   * Uses a linear search that stops at the first unaffordable level.
   *
   * Performance characteristics:
   * - Time complexity: O(min(n, MAX_AFFORDABLE_CALC_LIMIT)) where n is levels until max
   * - Space complexity: O(1)
   * - Capped at 1000 iterations to prevent UI lag with large numbers
   *
   * @param resources - Current game resources to check against
   * @returns Maximum number of affordable levels, or 0 if cannot afford any
   *
   * @example
   * // Check how many levels can be bought with current resources
   * const maxLevels = producer.getMaxAffordable(gameEngine.resources);
   * if (maxLevels > 0) {
   *   producer.increaseLevel(maxLevels);
   * }
   *
   * @see GAME_CONFIG.PERFORMANCE.MAX_AFFORDABLE_CALC_LIMIT for iteration limit
   */
  getMaxAffordable(resources: Record<string, Resource>): number {
    let affordable = 0;
    const maxCheck = Math.min(GAME_CONFIG.PERFORMANCE.MAX_AFFORDABLE_CALC_LIMIT, this.maxLevel - this.level);

    for (let i = 1; i <= maxCheck; i++) {
      const cost = this.getNextCost(i);
      const canAfford = Object.entries(cost).every(([resourceId, amount]) => {
        const resource = resources[resourceId];
        return resource && resource.canAfford(amount);
      });

      if (canAfford) {
        affordable = i;
      } else {
        break;
      }
    }

    return affordable;
  }

  /**
   * Check if at maximum level
   */
  isMaxLevel(): boolean {
    return this.level >= this.maxLevel;
  }

  /**
   * Increase level
   */
  increaseLevel(amount: number = 1): void {
    this.level = Math.min(this.level + amount, this.maxLevel);
  }

  serialize(): SerializedData {
    return {
      ...super.serialize(),
      level: this.level,
    };
  }
}
