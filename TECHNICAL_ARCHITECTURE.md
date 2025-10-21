# 🏗️ Technical Architecture - Automation Imperium

**Purpose:** Define how the new game design maps to the existing codebase architecture.

---

## 🎯 Architecture Goals

1. ✅ **Reuse existing patterns** - Strategy, Factory, Template Method already proven
2. ✅ **Minimal breaking changes** - Extend, don't rewrite
3. ✅ **Scalable design** - Easy to add new buildings, resources, recipes
4. ✅ **Performance first** - Mobile 60 FPS target, efficient tick loop
5. ✅ **Save compatibility** - Migration path from current save format

---

## 📦 Core Class Hierarchy Changes

### **Current Architecture**
```
Entity (base)
├── Resource
│   └── Ore
└── Purchasable
    ├── Producer (generates resources)
    │   ├── Miner
    │   ├── Drill
    │   ├── Complex
    │   └── QuantumDevice
    ├── Upgrade
    └── ClickPower
```

### **New Architecture**
```
Entity (base) - NO CHANGES
├── Resource - NO CHANGES
│   ├── Ore (keep for now, deprecate later)
│   ├── Iron
│   ├── Copper
│   ├── Steel
│   └── ... (add 20+ new resources)
│
└── Purchasable - MINOR CHANGES (add powerConsumption field)
    ├── Building (RENAME from Producer) - NEW BASE CLASS
    │   ├── Extractor (gather raw resources)
    │   │   ├── IronDrill
    │   │   ├── CoalDrill
    │   │   ├── CopperDrill
    │   │   └── OilPump
    │   │
    │   ├── Processor (convert single resource type)
    │   │   ├── Smelter
    │   │   ├── Constructor
    │   │   ├── WireMill
    │   │   └── Refinery
    │   │
    │   ├── Assembler (combine multiple resources)
    │   │   ├── BasicAssembler
    │   │   ├── AdvancedAssembler
    │   │   ├── FabricationPlant
    │   │   └── HeavyFoundry
    │   │
    │   └── Generator (produce power)
    │       ├── CoalGenerator
    │       ├── SolarPanel
    │       ├── HydroelectricPlant
    │       └── NuclearReactor
    │
    ├── Upgrade - NO CHANGES (existing system works)
    └── ClickPower - NO CHANGES (keep manual clicking)
```

---

## 🔧 Detailed Class Specifications

### **1. Building (Base Class)**

**File:** `src/core/engine/Building.ts` (rename from `Producer.ts`)

```typescript
import { Purchasable } from './Entity';
import { BigNumber } from './BigNumber';
import type { GameContext, BuildingConfig, SerializedData } from '@core/types';

/**
 * Building - Base class for all production buildings
 *
 * Replaces Producer as the base class. All buildings consume power
 * and have a tier system for progression.
 */
export abstract class Building extends Purchasable {
  // Core properties
  readonly tier: number;
  readonly powerConsumption: BigNumber; // MW consumed per second

  // State
  isActive: boolean; // Currently producing/processing
  currentEfficiency: number; // 0.0-1.0 (affected by power availability)

  constructor(id: string, config: BuildingConfig) {
    super(id, config, 'building');

    this.tier = config.tier || 1;
    this.powerConsumption = BigNumber.from(config.powerConsumption || 0);
    this.isActive = false;
    this.currentEfficiency = 1.0;
  }

  /**
   * Update building state (called every game tick)
   * Subclasses must implement their specific production logic
   */
  abstract tick(deltaTime: number, context: GameContext): void;

  /**
   * Get current power consumption (can be modified by upgrades)
   */
  getPowerConsumption(): BigNumber {
    return this.powerConsumption.mul(this.level);
  }

  /**
   * Set efficiency based on available power
   * 1.0 = full power, 0.5 = half speed, 0.0 = stopped
   */
  setEfficiency(efficiency: number): void {
    this.currentEfficiency = Math.max(0, Math.min(1, efficiency));
    this.isActive = this.currentEfficiency > 0;
  }

  /**
   * Check if building can operate (has power, unlocked, etc.)
   */
  canOperate(context: GameContext): boolean {
    if (!this.unlocked || this.level === 0) {
      return false;
    }

    // Check if enough power available (handled by PowerManager)
    return this.currentEfficiency > 0;
  }

  serialize(): SerializedData {
    return {
      ...super.serialize(),
      tier: this.tier,
      isActive: this.isActive,
    };
  }
}
```

---

### **2. Extractor (Resource Gatherers)**

**File:** `src/core/engine/buildings/Extractor.ts`

```typescript
import { Building } from '../Building';
import { BigNumber } from '../BigNumber';
import type { GameContext, ExtractorConfig, Production } from '@core/types';

/**
 * Extractor - Gathers raw resources from the environment
 *
 * Examples: Iron Drill, Coal Drill, Copper Drill, Oil Pump
 *
 * Mechanics:
 * - No input resources required
 * - Produces single resource type
 * - Has cycle time (time between outputs)
 * - Affected by power efficiency
 */
export class Extractor extends Building {
  // Output configuration
  readonly outputResource: string; // Resource ID (e.g., 'iron_ore')
  readonly outputAmount: BigNumber; // Amount per cycle
  readonly baseCycleTime: number; // Seconds per cycle (base value)

  // State
  private currentCycleProgress: number; // Current progress in seconds

  constructor(id: string, config: ExtractorConfig) {
    super(id, config);

    this.outputResource = config.outputResource;
    this.outputAmount = BigNumber.from(config.outputAmount);
    this.baseCycleTime = config.cycleTime || 1.0;
    this.currentCycleProgress = 0;
  }

  /**
   * Get current cycle time (affected by upgrades)
   */
  getCycleTime(): number {
    // Can be reduced by efficiency upgrades
    return this.baseCycleTime; // TODO: Apply upgrade multipliers
  }

  /**
   * Tick: Accumulate progress and output when cycle completes
   */
  tick(deltaTime: number, context: GameContext): void {
    if (!this.canOperate(context)) {
      return;
    }

    // Progress is affected by power efficiency
    const effectiveDelta = deltaTime * this.currentEfficiency;
    this.currentCycleProgress += effectiveDelta;

    const cycleTime = this.getCycleTime();

    // Complete cycles
    while (this.currentCycleProgress >= cycleTime) {
      this.currentCycleProgress -= cycleTime;
      this.produceOutput(context);
    }
  }

  /**
   * Produce output resources
   */
  private produceOutput(context: GameContext): void {
    const resource = context.resources[this.outputResource];
    if (!resource) {
      console.error(`Resource ${this.outputResource} not found`);
      return;
    }

    resource.add(this.outputAmount);
  }

  /**
   * Get current production rate (per second)
   */
  getProductionRate(): Production {
    const cycleTime = this.getCycleTime();
    const ratePerSecond = this.outputAmount.div(cycleTime).mul(this.currentEfficiency);

    return {
      [this.outputResource]: ratePerSecond
    };
  }

  /**
   * Get cycle progress percentage (for UI)
   */
  getCycleProgress(): number {
    return this.currentCycleProgress / this.getCycleTime();
  }

  serialize(): SerializedData {
    return {
      ...super.serialize(),
      currentCycleProgress: this.currentCycleProgress,
    };
  }

  static deserialize(data: SerializedData, config: ExtractorConfig): Extractor {
    const extractor = new Extractor(data.id, config);
    extractor.level = data.level;
    extractor.unlocked = data.unlocked;
    extractor.visible = data.visible;
    extractor.currentCycleProgress = data.currentCycleProgress || 0;
    return extractor;
  }
}
```

---

### **3. Processor (Resource Converters)**

**File:** `src/core/engine/buildings/Processor.ts`

```typescript
import { Building } from '../Building';
import { BigNumber } from '../BigNumber';
import type { GameContext, ProcessorConfig, Recipe, CraftingJob } from '@core/types';

/**
 * Processor - Converts input resources into output resources
 *
 * Examples: Smelter, Constructor, Wire Mill, Refinery
 *
 * Mechanics:
 * - Consumes input resources to craft outputs
 * - Has crafting queue (can queue multiple jobs)
 * - Each job has cycle time (processing duration)
 * - Affected by power efficiency
 */
export class Processor extends Building {
  // Recipe configuration
  readonly recipe: Recipe;
  readonly baseCycleTime: number;
  readonly maxQueueSize: number;

  // State
  private currentJob: CraftingJob | null;
  private queue: CraftingJob[];

  constructor(id: string, config: ProcessorConfig) {
    super(id, config);

    this.recipe = config.recipe;
    this.baseCycleTime = config.cycleTime || 1.0;
    this.maxQueueSize = config.maxQueueSize || 5;

    this.currentJob = null;
    this.queue = [];
  }

  /**
   * Get current cycle time (affected by upgrades)
   */
  getCycleTime(): number {
    return this.baseCycleTime; // TODO: Apply upgrade multipliers
  }

  /**
   * Tick: Process current job and try to queue new ones
   */
  tick(deltaTime: number, context: GameContext): void {
    if (!this.canOperate(context)) {
      return;
    }

    // Try to start new job if idle
    if (!this.currentJob) {
      this.tryStartNextJob(context);
    }

    // Process current job
    if (this.currentJob) {
      const effectiveDelta = deltaTime * this.currentEfficiency;
      this.currentJob.progress += effectiveDelta;

      // Check if job completed
      if (this.currentJob.progress >= this.currentJob.cycleTime) {
        this.completeJob(context);
        this.currentJob = null;

        // Immediately try to start next
        this.tryStartNextJob(context);
      }
    }

    // Auto-queue new jobs if enabled and space available
    if (this.queue.length < this.maxQueueSize) {
      this.tryQueueJob(context);
    }
  }

  /**
   * Try to queue a new crafting job
   */
  private tryQueueJob(context: GameContext): boolean {
    // Check if inputs available
    const canAfford = this.checkInputsAvailable(context);
    if (!canAfford) {
      return false;
    }

    // Deduct inputs immediately
    this.consumeInputs(context);

    // Create job
    const job: CraftingJob = {
      recipeId: this.id,
      startTime: Date.now(),
      cycleTime: this.getCycleTime(),
      progress: 0,
      inputs: this.recipe.inputs,
      outputs: this.recipe.outputs,
    };

    this.queue.push(job);
    return true;
  }

  /**
   * Try to start processing the next queued job
   */
  private tryStartNextJob(context: GameContext): boolean {
    if (this.queue.length === 0) {
      return false;
    }

    this.currentJob = this.queue.shift()!;
    return true;
  }

  /**
   * Complete current job and output resources
   */
  private completeJob(context: GameContext): void {
    if (!this.currentJob) return;

    // Add outputs to resources
    Object.entries(this.currentJob.outputs).forEach(([resourceId, amount]) => {
      const resource = context.resources[resourceId];
      if (resource) {
        resource.add(amount);
      }
    });
  }

  /**
   * Check if inputs are available for crafting
   */
  private checkInputsAvailable(context: GameContext): boolean {
    return Object.entries(this.recipe.inputs).every(([resourceId, amount]) => {
      const resource = context.resources[resourceId];
      return resource && resource.canAfford(amount);
    });
  }

  /**
   * Consume input resources
   */
  private consumeInputs(context: GameContext): void {
    Object.entries(this.recipe.inputs).forEach(([resourceId, amount]) => {
      const resource = context.resources[resourceId];
      if (resource) {
        resource.subtract(amount);
      }
    });
  }

  /**
   * Get current production rate estimate (per second)
   */
  getProductionRate(): Production {
    if (!this.currentJob && this.queue.length === 0) {
      return {};
    }

    const cycleTime = this.getCycleTime();
    const production: Production = {};

    Object.entries(this.recipe.outputs).forEach(([resourceId, amount]) => {
      production[resourceId] = BigNumber.from(amount)
        .div(cycleTime)
        .mul(this.currentEfficiency);
    });

    return production;
  }

  /**
   * Get queue status (for UI)
   */
  getQueueStatus(): { current: number; max: number; jobs: CraftingJob[] } {
    return {
      current: this.queue.length + (this.currentJob ? 1 : 0),
      max: this.maxQueueSize,
      jobs: this.currentJob ? [this.currentJob, ...this.queue] : this.queue,
    };
  }

  /**
   * Get current job progress (for UI progress bar)
   */
  getCurrentProgress(): number {
    if (!this.currentJob) return 0;
    return this.currentJob.progress / this.currentJob.cycleTime;
  }

  serialize(): SerializedData {
    return {
      ...super.serialize(),
      currentJob: this.currentJob,
      queue: this.queue,
    };
  }

  static deserialize(data: SerializedData, config: ProcessorConfig): Processor {
    const processor = new Processor(data.id, config);
    processor.level = data.level;
    processor.unlocked = data.unlocked;
    processor.visible = data.visible;
    processor.currentJob = data.currentJob || null;
    processor.queue = data.queue || [];
    return processor;
  }
}
```

---

### **4. Assembler (Multi-Input Crafting)**

**File:** `src/core/engine/buildings/Assembler.ts`

```typescript
import { Processor } from './Processor';
import type { AssemblerConfig } from '@core/types';

/**
 * Assembler - Combines multiple resource types into complex components
 *
 * Examples: Basic Assembler (circuits), Advanced Assembler, Fabrication Plant
 *
 * Mechanics:
 * - Same as Processor but typically:
 *   - More complex recipes (3+ inputs)
 *   - Longer cycle times (strategic waiting)
 *   - Higher power consumption
 */
export class Assembler extends Processor {
  constructor(id: string, config: AssemblerConfig) {
    super(id, config);
    // Assemblers are just specialized Processors
    // Can add assembler-specific mechanics here if needed
  }

  // Inherit all Processor behavior
  // Override methods only if assembler-specific logic needed
}
```

---

### **5. Generator (Power Production)**

**File:** `src/core/engine/buildings/Generator.ts`

```typescript
import { Building } from '../Building';
import { BigNumber } from '../BigNumber';
import type { GameContext, GeneratorConfig } from '@core/types';

/**
 * Generator - Produces power for other buildings
 *
 * Examples: Coal Generator, Solar Panel, Nuclear Reactor
 *
 * Mechanics:
 * - Produces power (MW) instead of resources
 * - May consume fuel (coal, uranium, etc.)
 * - Adds to global power pool
 */
export class Generator extends Building {
  readonly powerOutput: BigNumber; // MW produced per second
  readonly fuelType: string | null; // Resource ID (null = no fuel needed)
  readonly fuelConsumptionRate: BigNumber; // Fuel consumed per second

  private fuelProgress: number; // Tracks fuel consumption timing

  constructor(id: string, config: GeneratorConfig) {
    super(id, config);

    this.powerOutput = BigNumber.from(config.powerOutput);
    this.fuelType = config.fuelType || null;
    this.fuelConsumptionRate = BigNumber.from(config.fuelConsumptionRate || 0);
    this.fuelProgress = 0;
  }

  /**
   * Get current power output (affected by fuel availability and upgrades)
   */
  getPowerOutput(): BigNumber {
    if (!this.isActive) {
      return BigNumber.zero();
    }

    return this.powerOutput.mul(this.level);
  }

  /**
   * Tick: Consume fuel and produce power
   */
  tick(deltaTime: number, context: GameContext): void {
    if (!this.canOperate(context)) {
      this.isActive = false;
      return;
    }

    // Check fuel availability if needed
    if (this.fuelType) {
      const hasFuel = this.checkAndConsumeFuel(deltaTime, context);
      this.isActive = hasFuel;
    } else {
      // No fuel needed (solar, hydro, etc.)
      this.isActive = true;
    }

    // Power is added to global pool by PowerManager
    // Generator just needs to report its output
  }

  /**
   * Check if fuel is available and consume it
   */
  private checkAndConsumeFuel(deltaTime: number, context: GameContext): boolean {
    if (!this.fuelType) return true;

    const fuelResource = context.resources[this.fuelType];
    if (!fuelResource) return false;

    this.fuelProgress += deltaTime;

    // Check if it's time to consume fuel
    const fuelConsumeInterval = 1.0 / this.fuelConsumptionRate.toNumber();

    if (this.fuelProgress >= fuelConsumeInterval) {
      const consumed = fuelResource.subtract(1);
      if (!consumed) {
        // Out of fuel
        return false;
      }
      this.fuelProgress -= fuelConsumeInterval;
    }

    return true;
  }

  serialize(): SerializedData {
    return {
      ...super.serialize(),
      fuelProgress: this.fuelProgress,
    };
  }

  static deserialize(data: SerializedData, config: GeneratorConfig): Generator {
    const generator = new Generator(data.id, config);
    generator.level = data.level;
    generator.unlocked = data.unlocked;
    generator.visible = data.visible;
    generator.fuelProgress = data.fuelProgress || 0;
    return generator;
  }
}
```

---

## ⚡ Power Management System

**File:** `src/core/engine/PowerManager.ts`

```typescript
import { BigNumber } from './BigNumber';
import type { Building, Generator } from './buildings';

/**
 * PowerManager - Global power pool and distribution
 *
 * Calculates total power generation vs consumption
 * Adjusts building efficiency based on power availability
 */
export class PowerManager {
  private totalGeneration: BigNumber;
  private totalConsumption: BigNumber;

  constructor() {
    this.totalGeneration = BigNumber.zero();
    this.totalConsumption = BigNumber.zero();
  }

  /**
   * Calculate power from all buildings
   */
  update(buildings: Building[]): void {
    // Calculate total generation
    this.totalGeneration = buildings
      .filter(b => b instanceof Generator)
      .reduce((sum, gen) => {
        return sum.add((gen as Generator).getPowerOutput());
      }, BigNumber.zero());

    // Calculate total consumption
    this.totalConsumption = buildings
      .filter(b => !(b instanceof Generator) && b.isActive)
      .reduce((sum, building) => {
        return sum.add(building.getPowerConsumption());
      }, BigNumber.zero());
  }

  /**
   * Check if power is sufficient
   */
  isPowerSufficient(): boolean {
    return this.totalGeneration.gte(this.totalConsumption);
  }

  /**
   * Get power ratio (generation / consumption)
   * 1.0 = enough power, 0.5 = half power, 0.0 = no power
   */
  getPowerRatio(): number {
    if (this.totalConsumption.eq(0)) {
      return 1.0;
    }

    const ratio = this.totalGeneration.div(this.totalConsumption);
    return Math.min(1.0, ratio.toNumber());
  }

  /**
   * Apply power efficiency to all buildings
   */
  applyPowerEfficiency(buildings: Building[]): void {
    const powerRatio = this.getPowerRatio();

    buildings.forEach(building => {
      if (!(building instanceof Generator)) {
        building.setEfficiency(powerRatio);
      }
    });
  }

  /**
   * Get power stats (for UI)
   */
  getStats(): { generation: BigNumber; consumption: BigNumber; ratio: number } {
    return {
      generation: this.totalGeneration,
      consumption: this.totalConsumption,
      ratio: this.getPowerRatio(),
    };
  }
}
```

---

## 🎮 GameEngine Integration

**File:** `src/core/engine/GameEngine.ts` (UPDATE EXISTING)

```typescript
import { PowerManager } from './PowerManager';
import type { Building } from './buildings';

export class GameEngine {
  // Existing properties...
  resources: Record<ResourceId, Resource>;
  upgrades: Record<UpgradeId, Upgrade>;
  achievements: Record<AchievementId, Achievement>;
  clickPower: ClickPower | null;
  prestige: Prestige | null;

  // NEW: Replace producers with buildings
  buildings: Record<BuildingId, Building>; // Was: producers

  // NEW: Power management
  powerManager: PowerManager;

  // NEW: Corporation progression
  corporationXP: number;
  corporationLevel: number;
  totalPrestiges: number;

  constructor(config: GameEngineConfig = {}) {
    // ... existing initialization

    this.buildings = {};
    this.powerManager = new PowerManager();
    this.corporationXP = 0;
    this.corporationLevel = 1;
    this.totalPrestiges = 0;
  }

  /**
   * Add building to game
   */
  addBuilding(building: Building): void {
    this.buildings[building.id] = building;
    this.invalidateContext();
  }

  /**
   * Main game tick (UPDATED)
   */
  tick(deltaTime: number): void {
    // 1. Update stats
    this.stats.totalPlayTime += deltaTime;

    // 2. Check unlock conditions
    this.checkUnlocks();

    // 3. Calculate power
    this.powerManager.update(Object.values(this.buildings));
    this.powerManager.applyPowerEfficiency(Object.values(this.buildings));

    // 4. Tick all buildings
    Object.values(this.buildings).forEach(building => {
      building.tick(deltaTime, this.getGameContext());
    });

    // 5. Apply prestige bonuses
    this.applyPrestigeBonuses();

    // 6. Update achievements
    this.updateAchievements();
  }

  /**
   * Apply corporation-level bonuses
   */
  private applyPrestigeBonuses(): void {
    const bonuses = this.getCorpLevelBonuses(this.corporationLevel);

    // Apply production speed bonus
    if (bonuses.productionSpeed) {
      Object.values(this.buildings).forEach(building => {
        // Reduce cycle times by bonus percentage
        // Implementation depends on building type
      });
    }

    // Apply building cost reduction
    if (bonuses.buildingCostReduction) {
      // Handled in purchase logic
    }
  }

  /**
   * Get bonuses for corporation level
   */
  private getCorpLevelBonuses(level: number): CorpLevelBonuses {
    // Implementation from BALANCED_GAME_DESIGN.md
    // Returns: { productionSpeed, buildingCostReduction, etc. }
  }

  /**
   * Perform prestige (UPDATED)
   */
  performPrestige(): PrestigeResult {
    // Calculate Corp XP earned
    const earnedXP = this.calculateCorpXP();

    this.corporationXP += earnedXP;
    this.totalPrestiges += 1;

    // Calculate new level
    const newLevel = this.calculateCorpLevel(this.corporationXP);
    const leveledUp = newLevel > this.corporationLevel;
    this.corporationLevel = newLevel;

    // Reset resources and buildings
    this.resources = this.createFreshResources();
    this.buildings = this.createStarterBuildings(newLevel);

    // Keep: achievements, corporationXP, corporationLevel

    return {
      earnedXP,
      newLevel,
      leveledUp,
      newBonuses: leveledUp ? this.getCorpLevelBonuses(newLevel) : null,
    };
  }

  /**
   * Calculate Corp XP from current run
   */
  private calculateCorpXP(): number {
    let xp = 0;

    // Count Tier 4+ components produced
    const tier4Count = this.stats.tier4ComponentsProduced || 0;
    const tier5Count = this.stats.tier5ComponentsProduced || 0;

    xp += tier4Count * 1.0;
    xp += tier5Count * 5.0;

    // Bonus for unique production chains
    xp += this.stats.uniqueChainsCompleted * 10;

    // Time efficiency bonus (under 2 hours)
    if (this.stats.totalPlayTime < 7200) {
      xp *= 1.5;
    }

    return Math.floor(xp);
  }

  /**
   * Calculate corporation level from total XP
   */
  private calculateCorpLevel(totalXP: number): number {
    // Formula: level = largest L where (100 * L * (L-1) / 2) <= totalXP
    let level = 1;
    while (this.xpRequiredForLevel(level + 1) <= totalXP) {
      level++;
    }
    return level;
  }

  /**
   * Get XP required for specific level
   */
  private xpRequiredForLevel(level: number): number {
    return 100 * level * (level - 1) / 2;
  }
}
```

---

## 💾 Save/Load System Updates

**File:** `src/core/engine/SaveManager.ts` (UPDATE EXISTING)

```typescript
interface SaveDataV2 {
  version: "2.0.0";

  // Existing
  resources: SerializedResource[];
  upgrades: SerializedUpgrade[];
  achievements: SerializedAchievement[];
  clickPower: SerializedClickPower;

  // NEW: Replace producers with buildings
  buildings: SerializedBuilding[]; // Was: producers

  // NEW: Power system
  powerStats: {
    totalGeneration: string;
    totalConsumption: string;
  };

  // NEW: Corporation progression
  corporationXP: number;
  corporationLevel: number;
  totalPrestiges: number;

  // Updated stats
  stats: {
    totalPlayTime: number;
    totalClicks: number;
    tier4ComponentsProduced: number;
    tier5ComponentsProduced: number;
    uniqueChainsCompleted: number;
  };

  lastSaveTime: number;
}

/**
 * Migration from V1 to V2
 */
export class SaveMigration {
  static migrateV1toV2(oldSave: SaveDataV1): SaveDataV2 {
    return {
      version: "2.0.0",

      // Migrate producers → buildings
      buildings: oldSave.producers.map(producer => ({
        ...producer,
        type: 'extractor', // Assume old producers are extractors
        tier: 1,
        powerConsumption: '10', // Default power
      })),

      // Keep existing data
      resources: oldSave.resources,
      upgrades: oldSave.upgrades,
      achievements: oldSave.achievements,
      clickPower: oldSave.clickPower,

      // Initialize new fields
      powerStats: {
        totalGeneration: '0',
        totalConsumption: '0',
      },
      corporationXP: 0,
      corporationLevel: 1,
      totalPrestiges: 0,

      stats: {
        totalPlayTime: oldSave.playTime || 0,
        totalClicks: oldSave.totalClicks || 0,
        tier4ComponentsProduced: 0,
        tier5ComponentsProduced: 0,
        uniqueChainsCompleted: 0,
      },

      lastSaveTime: oldSave.lastSaveTime,
    };
  }
}
```

---

## 📁 File Structure Changes

### **New Files to Create**

```
src/core/engine/
├── Building.ts                      # NEW: Base building class (rename Producer.ts)
├── PowerManager.ts                  # NEW: Power management system
├── buildings/                       # NEW: Building implementations
│   ├── index.ts                    # Export all building types
│   ├── Extractor.ts                # Resource gatherers
│   ├── Processor.ts                # Resource converters
│   ├── Assembler.ts                # Multi-input crafters
│   └── Generator.ts                # Power producers
└── (keep existing files)

src/features/buildings/              # NEW: Building configs
├── config/
│   ├── buildings.config.ts         # All building definitions
│   ├── extractors.config.ts        # Extractor-specific configs
│   ├── processors.config.ts        # Processor-specific configs
│   ├── assemblers.config.ts        # Assembler-specific configs
│   └── generators.config.ts        # Generator-specific configs
└── components/
    ├── BuildingList.tsx            # List of all buildings
    ├── BuildingCard.tsx            # Individual building display
    ├── BuildingDetail.tsx          # Detailed building view
    ├── ProductionChain.tsx         # Visual production chain
    └── PowerDisplay.tsx            # Power stats display
```

### **Files to Update**

```
src/core/engine/
├── GameEngine.ts                    # UPDATE: Add buildings, powerManager
├── Entity.ts                        # MINOR: Add powerConsumption to Purchasable
└── index.ts                         # UPDATE: Export new building types

src/core/types/
└── core.ts                          # UPDATE: Add new types

src/core/store/
└── gameStore.ts                     # UPDATE: Replace producers with buildings

src/features/producers/              # DEPRECATE: Move to buildings/
└── (migrate to features/buildings/)
```

### **Files to Keep Unchanged**

```
src/core/engine/
├── Achievement.ts                   # NO CHANGES
├── ClickPower.ts                    # NO CHANGES
├── Prestige.ts                      # MINOR UPDATES (corp XP)
├── BigNumber.ts                     # NO CHANGES
└── strategies/                      # NO CHANGES (reuse cost strategies)

src/core/utils/
├── Formulas.ts                      # NO CHANGES
├── NumberFormatter.ts               # NO CHANGES
└── Logger.ts                        # NO CHANGES

src/features/
├── resources/                       # EXPAND (add new resources)
├── upgrades/                        # NO CHANGES (system works as-is)
├── achievements/                    # EXPAND (add new achievements)
└── prestige/                        # UPDATE (corp XP display)
```

---

## 🔄 Migration Strategy

### **Phase 1: Parallel Implementation**
1. Create new `Building` class hierarchy alongside existing `Producer`
2. Implement new building types (Extractor, Processor, etc.)
3. Keep old `Producer` system working
4. Test new buildings in isolation

### **Phase 2: Gradual Migration**
1. Add `buildings` field to GameEngine (alongside `producers`)
2. GameEngine ticks both systems
3. UI shows both old and new buildings
4. Save system stores both formats

### **Phase 3: Deprecation**
1. Mark `Producer` as deprecated
2. Stop creating new producers
3. Migrate existing saves to new format
4. Remove producer system

### **Phase 4: Cleanup**
1. Delete `Producer` class and old files
2. Rename `buildings` → canonical system
3. Clean up migration code
4. Celebrate! 🎉

---

## 🎯 Performance Considerations

### **Tick Rate Optimization**

```typescript
// Current: 20 FPS (50ms tick)
// New: Same, but more buildings

// Optimization strategies:
1. Batch building updates by type
2. Use object pools for CraftingJob
3. Cache production rate calculations
4. Only tick active buildings
5. Spatial partitioning (future: building groups)
```

### **Memory Management**

```typescript
// Estimated memory per building:
- Extractor: ~200 bytes (state + config)
- Processor: ~500 bytes (state + queue)
- Assembler: ~500 bytes (same as processor)
- Generator: ~150 bytes (minimal state)

// Target: Support 500+ buildings without lag
// Total: ~200 KB for buildings (acceptable)
```

### **Save File Size**

```typescript
// Current save: ~10 KB
// New save (500 buildings): ~50-75 KB
// Still acceptable for localStorage (5 MB limit)

// Optimization: gzip compression (optional)
```

---

## ✅ Implementation Checklist

### **Week 1: Foundation**
- [ ] Rename `Producer.ts` → `Building.ts`
- [ ] Create `Extractor` class
- [ ] Create `Processor` class
- [ ] Create `Generator` class
- [ ] Create `PowerManager` class
- [ ] Update `GameEngine` to use new classes
- [ ] Write unit tests for new classes

### **Week 2: Integration**
- [ ] Create building config system
- [ ] Implement 5 extractors (iron, coal, copper, oil, stone)
- [ ] Implement 5 processors (smelter, constructor, wire mill, etc.)
- [ ] Implement 2 generators (coal, solar)
- [ ] Update save/load with migration
- [ ] Test in GameEngine

### **Week 3: UI**
- [ ] Create `BuildingList` component
- [ ] Create `BuildingCard` component
- [ ] Create `PowerDisplay` component
- [ ] Create `ProductionChain` visual
- [ ] Update main game UI
- [ ] Polish UI/UX

### **Week 4: Testing & Balance**
- [ ] Playtest first 30 minutes
- [ ] Balance production rates
- [ ] Fix bugs
- [ ] Performance profiling
- [ ] Final polish

---

**This architecture reuses 80%+ of existing code while enabling the new game design!**
**Last Updated:** 2025-10-21
