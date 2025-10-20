/**
 * Core Game Engine
 * Central export point for all engine components
 */

export { GameEngine } from './GameEngine';
export type { GameEngineConfig } from './GameEngine';

export { SaveManager } from './SaveManager';
export type { LoadResult } from './SaveManager';

export { BigNumber } from './BigNumber';
export { Entity } from './Entity';
export type { Resource } from './Entity';

export { Producer, Upgrade } from './Producer';

export { Achievement, MilestoneConditionStrategy, PurchaseConditionStrategy } from './Achievement';
export { ClickPower } from './ClickPower';
export { Prestige } from './Prestige';

// Cost strategies
export * from './strategies';

// Producer implementations
export * from './producers';

// Resource implementations
export * from './resources';
