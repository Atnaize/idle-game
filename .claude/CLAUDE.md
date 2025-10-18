# Idle Game Project - Claude Code Instructions

## Project Overview
This is a mobile-first idle game built with React, TypeScript, and Tailwind CSS. The game features resource management, incremental progression, prestige mechanics, achievements, and handles extremely large numbers using break_infinity.js.

**Current Status:** Core systems implemented with feature-based architecture. No test suite yet.

## Technology Stack

- **React 18.3.1** - UI framework with hooks
- **TypeScript 5.7.2** - Strict mode enabled
- **Zustand 5.0.2** - Lightweight state management with persistence
- **break_infinity.js 2.1.0** - Big number handling (supports up to 1e308)
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Vite 5.4.20** - Build tool and dev server

## Architecture Overview

### Feature-Based Architecture

The project uses a **feature-based architecture** with three main layers:

```
src/
├── core/                      # Core game engine & shared utilities
│   ├── engine/                # Game logic (no React dependencies)
│   │   ├── Entity.ts          # Base classes (Entity, Resource, Purchasable)
│   │   ├── Producer.ts        # Producer and Upgrade classes
│   │   ├── Achievement.ts     # Achievement system with strategies
│   │   ├── ClickPower.ts      # Manual clicking system
│   │   ├── Prestige.ts        # Prestige/reset mechanics
│   │   ├── GameEngine.ts      # Main game loop orchestrator
│   │   ├── BigNumber.ts       # Wrapper for break_infinity.js
│   │   ├── producers/         # Producer implementations
│   │   └── resources/         # Resource implementations
│   ├── store/                 # Zustand state management
│   │   └── gameStore.ts       # Global game state + actions
│   ├── hooks/                 # Core React hooks
│   │   ├── useGameLoop.ts     # UI update loop (500ms tick)
│   │   └── useAutoSave.ts     # Auto-save mechanism (30s)
│   ├── types/                 # Core TypeScript types
│   ├── utils/                 # Utilities (formulas, formatters)
│   └── constants/             # Game configuration constants
│
├── features/                  # Feature modules (UI + config)
│   ├── resources/             # Resource management
│   ├── producers/             # Producer management
│   ├── upgrades/              # Upgrade system
│   ├── click/                 # Manual clicking
│   ├── achievements/          # Achievement system
│   ├── prestige/              # Prestige mechanics
│   ├── skilltree/             # Skill tree visualization
│   └── notifications/         # Toast notifications
│
├── shared/                    # Shared UI components & config
│   ├── components/            # Reusable components
│   ├── hooks/                 # Shared React hooks
│   ├── config/                # UI configuration
│   └── styles/                # Shared CSS
│
└── styles/                    # Global stylesheets
```

**Key Principle:** Game logic lives in `core/engine/` (pure TypeScript), UI lives in `features/` and `shared/` (React).

## Core Design Patterns

### 1. Class Hierarchy (Template Method Pattern)

```
Entity (base class)
├── Resource
│   └── Ore
└── Purchasable (adds cost/level management)
    ├── Producer
    │   ├── Miner (Tier 1-2, efficiency multiplier)
    │   ├── Drill (Tier 3-4, depth bonuses)
    │   ├── Complex (Tier 5, synergy bonuses)
    │   └── QuantumDevice (Tier 6+, quantum mechanics)
    ├── Upgrade
    └── ClickPower
```

**Base Classes:**
- `Entity`: ID, name, description, unlock conditions, visibility
- `Purchasable`: Extends Entity with cost, level, max level
- `Producer`: Extends Purchasable with production rate
- `Resource`: Extends Entity with amount, max capacity

### 2. Strategy Pattern

**Prestige Formulas:**
```typescript
interface PrestigeFormulaStrategy {
  calculate(resourceAmount: BigNumber, requirement: BigNumber): BigNumber;
}

// Implementations:
- LinearPrestigeFormula      // Fastest progression
- SqrtPrestigeFormula         // Balanced
- CubicPrestigeFormula        // Recommended/moderate (default)
- LogarithmicPrestigeFormula  // Slowest
```

**Achievement Conditions:**
```typescript
interface AchievementConditionStrategy {
  check(context: GameContext): boolean;
  getProgress(context: GameContext): number;
}

// Implementations:
- MilestoneConditionStrategy   // Reach resource target
- ProductionConditionStrategy  // Track total production
- PurchaseConditionStrategy    // Reach producer/upgrade level
```

### 3. Factory Pattern

All game entities created via factories in feature config files:
- `createResources()` → `src/features/resources/config/resources.config.ts`
- `createProducers()` → `src/features/producers/config/producers.config.ts`
- `createUpgrades()` → `src/features/upgrades/config/upgrades.config.ts`
- `createAchievements()` → `src/features/achievements/config/achievements.config.ts`
- `PrestigeFormulaFactory` → Runtime strategy selection

### 4. Context Pattern

`GameContext` object passed to unlock/purchase conditions:
```typescript
interface GameContext {
  resources: Map<string, Resource>;
  producers: Map<string, Producer>;
  upgrades: Map<string, Upgrade>;
  achievements: Map<string, Achievement>;
  prestigePoints: BigNumber;
  totalResets: number;
  playTime: number;
}
```

Allows entities to query game state without tight coupling.

### 5. Observer Pattern (Implicit)

- `GameEngine.onAchievementComplete` callback for notifications
- Toast system reacts to achievement completions
- Zustand subscribers for UI updates

## State Management

### Zustand Store (`src/core/store/gameStore.ts`)

```typescript
interface GameState {
  // Core Engine
  engine: GameEngine | null;

  // UI State (persisted to localStorage)
  buyAmount: 1 | 10 | 25 | 100 | 'max';
  selectedTab: TabId;
  tick: number; // Force re-render counter

  // Offline Progress
  offlineProgress: OfflineProgressInfo | null;

  // Initialization
  initialized: boolean;

  // Actions
  initializeGame(): void;
  handleClick(): void;
  purchaseProducer(id: string): void;
  purchaseUpgrade(id: string): void;
  performPrestige(): void;
  saveGame(): void;
  loadGame(): void;
  resetGame(): void;
  forceTick(): void;
}
```

**Persistence:**
- UI state (buyAmount, selectedTab) → `'idle-game-ui-state'` key
- Game data → `'idle-game-save'` key (versioned format)

## Game Systems

### Resource System
**Current:** Single resource "Ore"
- Class: `src/core/engine/resources/Ore.ts`
- BigNumber amount tracking
- Optional max capacity
- Color-coded display
- Locked/visible state

**Adding Resources:**
1. Create class in `src/core/engine/resources/`
2. Extend `Resource` base class
3. Add to `createResources()` in `resources.config.ts`

### Producer System
**Current:** 6 producer types across 6 tiers
1. **Miner** (Tier 1-2) - Base extraction with efficiency multiplier
2. **Drill** (Tier 3-4) - Deep mining with depth bonuses
3. **Complex** (Tier 5) - Mining facility with synergy effects
4. **QuantumDevice** (Tier 6+) - Quantum-based advanced mining

**Features:**
- Exponential cost scaling (default 1.15 multiplier)
- Production per level
- Unlock conditions (resource thresholds, producer levels)
- Tier system for organization
- Custom mechanics via inheritance (see `Miner.getProductionRate()`)
- Max level support

**Adding Producers:**
1. Create class in `src/core/engine/producers/`
2. Extend `Producer` base class
3. Override `getProductionRate()` if custom logic needed
4. Add to `createProducers()` in `producers.config.ts`

### Upgrade System
**Structure:** Two-state lifecycle (unlocked → purchasable → purchased)

**Effect Types:**
- `'multiplier'` - Exponential boost (e.g., 2x^level)
- `'additive'` - Linear boost (e.g., level * amount)
- `'flat'` - Fixed boost (one-time)

**Effect Targets:**
- Specific producer by ID
- All producers (`target: 'all'`)
- Custom function-based effects

**Features:**
- Unlock conditions
- Max level support (typically 1 for single-purchase)
- Can target multiple producers
- Reward bonuses (resource grants)

**Adding Upgrades:**
1. Add to `createUpgrades()` in `upgrades.config.ts`
2. Define cost, effect type, target, unlock conditions
3. UI automatically shows when unlocked

### Achievement System
**Strategy-based conditions with progress tracking**

**Achievement Lifecycle:**
1. Hidden → Visible (unlock condition met)
2. Visible → Completed (condition satisfied)
3. Rewards applied on completion

**Condition Types:**
- `MilestoneConditionStrategy` - "Reach X amount of resource"
- `ProductionConditionStrategy` - "Produce X total resources"
- `PurchaseConditionStrategy` - "Buy X levels of producer"

**Rewards:**
- Multiplier bonuses (permanent boost)
- Resource gifts
- Feature unlocks

**Adding Achievements:**
1. Add to `createAchievements()` in `achievements.config.ts`
2. Choose condition strategy
3. Define unlock conditions, rewards
4. Progress automatically tracked

### Click Power System
**Manual resource generation via taps**

**Features:**
- Base click value (configurable)
- Click multiplier (from upgrades)
- Critical hit system:
  - Configurable chance (0-1)
  - Critical multiplier (default 2x)
- Upgradeable via levels
- Cost scaling (exponential)

**Config:** `src/features/click/config/clickPower.config.ts`

### Prestige System
**Reset progression for permanent bonuses**

**Formula Strategies:**
- **Linear**: `amount / requirement` (fastest)
- **Square root**: `sqrt(amount / requirement)` (balanced)
- **Cubic root**: `cbrt(amount / requirement)` ⭐ **RECOMMENDED**
- **Logarithmic**: `log10(amount / requirement)` (slowest)

**Configuration:**
- Min requirement: 1 trillion ore
- Bonus per point: 10% global multiplier
- Formula: `1 + (bonusPerPoint * prestigePoints)`
- Max offline calculation: 1 hour

**Bonus Calculation:**
```typescript
globalMultiplier = 1 + (0.10 * prestigePoints)
// Example: 5 prestige points = 1.5x multiplier (50% bonus)
```

**Adding Prestige Features:**
1. Modify `Prestige` class in `src/core/engine/Prestige.ts`
2. Update config in `prestige.config.ts`
3. Change formula via `PrestigeFormulaFactory`

### Save/Load System
**Auto-save with offline progress**

**Save Format:** Versioned JSON (current: "1.0.0")
```typescript
interface SaveData {
  version: string;
  resources: SerializedResource[];
  producers: SerializedProducer[];
  upgrades: SerializedUpgrade[];
  achievements: SerializedAchievement[];
  clickPower: SerializedClickPower;
  prestigePoints: string; // Serialized BigNumber
  totalResets: number;
  playTime: number;
  totalClicks: number;
  totalPrestige: number;
  lastSaveTime: number;
}
```

**Features:**
- Auto-save every 30 seconds
- localStorage persistence
- Versioned for migrations
- Offline progress calculation (max 1 hour)
- Shows modal if away >5 seconds

**Storage Keys:**
- Game data: `'idle-game-save'`
- UI state: `'idle-game-ui-state'`

## BigNumber System

**Library:** `break_infinity.js` (NOT Decimal.js)

**Wrapper:** `src/core/engine/BigNumber.ts`
```typescript
class BigNumber extends Decimal {
  static from(value: number | string | Decimal | BigNumber): BigNumber;

  canAfford(cost: BigNumber): boolean;
  spend(amount: BigNumber): BigNumber;
  earn(amount: BigNumber): BigNumber;
  percentOf(other: BigNumber): BigNumber;

  serialize(): string;
  static deserialize(value: string): BigNumber;
}
```

**Number Formatting:** `src/core/utils/NumberFormatter.ts`
- `format(num)` → "1.23K", "4.56M", "7.89B", etc.
- `formatRate(num)` → "123.45/s"
- `formatCompact(num)` → Shorter format
- `formatDetailed(num)` → Full precision for tooltips
- `formatTime(seconds)` → "1h 23m 45s"

**Range:** Supports up to 1e308 (JavaScript MAX_VALUE)

**IMPORTANT:** ALL game numeric values MUST use BigNumber:
- Resource amounts
- Production rates
- Costs
- Prestige points
- Click values
- Multipliers

## React Patterns

### Custom Hooks

**Core Hooks:**
- `useGameLoop(tickRate: number)` - UI update loop (default 500ms)
- `useAutoSave(interval: number)` - Auto-save loop (default 30s)
- `useTheme()` - Theme state management
- `useMobileLayout()` - Mobile layout utilities

**Usage:**
```typescript
// In App.tsx
useGameLoop(500); // Update UI every 500ms
useAutoSave(30000); // Save every 30 seconds
```

### Component Patterns

**All components are functional with hooks**
- No class components
- Use `React.memo()` for performance (when appropriate)
- Tailwind CSS for styling
- Custom CSS for animations/effects

**Shared Components:** `src/shared/components/`
- `Header` - Top navigation with settings
- `BottomNavigation` - Tab switching
- `TouchButton` - Touch-optimized button (min 44x44px)
- `Modal` - Reusable modal dialog
- `StatCard` - Display stats/values
- `SectionCard` - Content containers
- `OfflineProgressModal` - Offline progress display
- `ErrorBoundary` - Error handling wrapper
- `SettingsMenu` - Settings with debug tools

## Performance Configuration

**Game Loop:**
- FPS: 20 (configurable in `src/core/constants/gameConfig.ts`)
- Tick rate: 50ms (1000ms / 20 FPS)

**UI Update:**
- Rate: 500ms (configurable via `useGameLoop`)
- Decoupled from game loop for performance

**Context Caching:**
- `GameEngine` caches `GameContext`
- Invalidated on state changes via `_contextDirty` flag
- Reduces object creation overhead

## Mobile-First UI Guidelines

### Touch Optimization
- **Minimum touch targets:** 44x44px
- **No hover states:** Design for touch-only
- **Tap feedback:** Visual feedback on touch (TouchButton component)
- **Prevent double-tap zoom:** Use appropriate meta tags

### Layout
- **Viewport:** 375-430px width (portrait)
- **Single column:** No multi-column layouts
- **Vertical scrolling:** Primary navigation is vertical
- **Safe areas:** Account for notches (CSS safe-area-inset)
- **Bottom navigation:** Tab bar at bottom (thumb-friendly)

### Responsive Units
- Use `rem` for font sizes
- Use `vh/vw` for full-screen layouts
- Use Tailwind spacing scale for consistency

## TypeScript Standards

### Strict Mode
```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true
}
```

### Type Guidelines
- ✅ Always declare return types on functions
- ✅ Use `unknown` instead of `any` when type is unclear
- ✅ Use `readonly` for immutable data
- ✅ Use discriminated unions for state machines
- ✅ Use branded types for domain primitives (if needed)
- ❌ Never use `any` (use `unknown` or proper generics)
- ❌ Avoid type assertions (`as`) unless absolutely necessary

### Example
```typescript
// Good
function calculateProduction(producer: Producer): BigNumber {
  return producer.getProductionRate();
}

// Bad
function calculateProduction(producer: any) {
  return producer.getProductionRate();
}
```

## Code Style

### General Principles
- **Functional where possible:** Prefer pure functions
- **Early returns:** Avoid nested conditionals
- **Descriptive names:** `calculateOfflineResourceGain` not `calc`
- **No magic numbers:** All constants in config files
- **Comments for "why":** Code explains "what", comments explain "why"

### Example
```typescript
// Good - early return, descriptive
function canAffordProducer(producer: Producer, resource: Resource): boolean {
  if (!producer.isUnlocked()) {
    return false;
  }

  if (!producer.isVisible()) {
    return false;
  }

  const cost = producer.getCost();
  return resource.amount.gte(cost);
}

// Bad - nested, unclear
function canAffordProducer(producer: Producer, resource: Resource): boolean {
  if (producer.isUnlocked()) {
    if (producer.isVisible()) {
      if (resource.amount.gte(producer.getCost())) {
        return true;
      }
    }
  }
  return false;
}
```

## Adding New Features

### Checklist
1. ✅ **Check existing code** - Does similar functionality exist?
2. ✅ **Design the abstraction** - What interface/base class makes sense?
3. ✅ **Implement in core/engine** - Pure TypeScript, no React dependencies
4. ✅ **Create factory function** - Add to appropriate config file
5. ✅ **Update GameEngine** - Integrate with game loop if needed
6. ✅ **Create UI components** - Add to features/ directory
7. ✅ **Update save/load** - Add serialization if needed
8. ✅ **Test manually** - Use debug tools in SettingsMenu
9. ⚠️ **Write tests** - (Currently no test suite, but should be added)

### Example: Adding a New Resource

```typescript
// 1. Create class in src/core/engine/resources/
export class Crystal extends Resource {
  constructor() {
    super({
      id: 'crystal',
      name: 'Crystal',
      description: 'Rare crystalline formations',
      color: '#9333ea',
      icon: '💎',
      initialAmount: new BigNumber(0),
      maxCapacity: undefined,
    });
  }
}

// 2. Add to factory in src/features/resources/config/resources.config.ts
export function createResources(): Map<string, Resource> {
  return new Map([
    ['ore', new Ore()],
    ['crystal', new Crystal()], // Add here
  ]);
}

// 3. Update save/load in src/core/store/gameStore.ts
// (Automatic if following serialization pattern)

// 4. Create UI component in src/features/resources/components/
// (Can reuse existing ResourceDisplay component)
```

### Example: Adding a New Producer

```typescript
// 1. Create class in src/core/engine/producers/
export class Excavator extends Producer {
  constructor() {
    super({
      id: 'excavator',
      name: 'Excavator',
      description: 'Heavy excavation equipment',
      baseCost: new BigNumber(1000),
      baseProduction: new BigNumber(5),
      costMultiplier: 1.15,
      icon: '🚜',
      tier: 2,
    });
  }

  // Optional: Override for custom production logic
  getProductionRate(context: GameContext): BigNumber {
    let rate = super.getProductionRate(context);
    // Add custom logic here
    return rate;
  }
}

// 2. Add to factory in src/features/producers/config/producers.config.ts
export function createProducers(): Map<string, Producer> {
  return new Map([
    // ... existing producers
    ['excavator', new Excavator()],
  ]);
}

// 3. UI automatically updates (ProducersTab shows all producers)
```

## Anti-Patterns to Avoid

### ❌ Don't Do This
- Mutating props or state directly
- Using component state for game logic
- Tight coupling between UI and game logic
- Large monolithic components (>300 lines)
- JavaScript numbers for game calculations
- Magic numbers/strings
- Unhandled promise rejections
- Missing error boundaries
- Using `any` type
- Nested conditionals (use early returns)

### ✅ Do This Instead
- Immutable updates (Zustand handles this)
- Game logic in `core/engine/`, UI in `features/`
- Dependency injection via GameContext
- Split components into smaller pieces
- Always use BigNumber
- Constants in config files
- Add `.catch()` to all promises
- Use ErrorBoundary wrapper (already in App.tsx)
- Use proper types or `unknown`
- Early returns for cleaner flow

## Debug Tools

**Settings Menu** (`src/shared/components/SettingsMenu.tsx`)
- Add resources
- Add producers
- Add prestige points
- Reset game
- View save data
- Export/import saves

**Access:** Click settings icon in header

## Testing Strategy (TODO)

**Current Status:** No tests implemented

**Recommended:**
1. **Unit tests** - Game logic (entities, formulas, utilities)
2. **Integration tests** - GameEngine, managers
3. **Property-based tests** - Numerical calculations (fast-check)
4. **No UI tests initially** - Focus on logic first

**Setup:**
- Jest for unit/integration tests
- React Testing Library (if UI tests needed later)
- fast-check for property-based testing

## Decision Log

### Decision 1: break_infinity.js for Number Handling
**Date:** Initial implementation
**Context:** Idle games reach numbers beyond JavaScript's safe integer range (2^53)
**Decision:** Use break_infinity.js (not Decimal.js) for all game numeric values
**Consequences:**
- Supports up to 1e308 (JavaScript MAX_VALUE)
- Slightly slower than native numbers
- Custom BigNumber wrapper for convenience methods
- All arithmetic must use BigNumber methods

### Decision 2: Feature-Based Architecture
**Date:** Recent refactor (commit 979d701)
**Context:** Original structure was hard to navigate and scale
**Decision:** Organize by feature (resources, producers, upgrades, etc.) instead of type (components, hooks, utils)
**Consequences:**
- Easier to locate related code
- Better encapsulation
- Clear separation: core (engine) / features (UI+config) / shared (common UI)
- More folders but better organization

### Decision 3: Zustand for State Management
**Date:** Initial implementation
**Context:** Redux too heavy for this use case
**Decision:** Use Zustand for global state with persist middleware
**Consequences:**
- Minimal boilerplate
- Built-in persistence
- Simple API (no actions/reducers)
- Easy to debug

### Decision 4: Separate Game Logic from React
**Date:** Initial implementation
**Context:** Game logic should be testable and framework-agnostic
**Decision:** Core game systems are pure TypeScript classes, React is just a view layer
**Consequences:**
- GameEngine has no React dependencies
- Can test game logic without React
- Could swap UI framework if needed
- More boilerplate (factories, serialization)

### Decision 5: Mobile-Only Focus
**Date:** Initial implementation
**Context:** Optimizing for all screen sizes adds complexity
**Decision:** Design exclusively for mobile portrait (375-430px width)
**Consequences:**
- Simpler CSS
- Better mobile UX
- No desktop support
- Could add responsive later if needed

### Decision 6: Strategy Pattern for Prestige Formulas
**Date:** Prestige system implementation
**Context:** Different games need different prestige curves
**Decision:** Use strategy pattern with factory for runtime formula selection
**Consequences:**
- Easy to add new formulas
- Can change formula without code changes (just update config)
- Testable in isolation
- Slightly more complex initial setup

### Decision 7: 500ms UI Update Rate
**Date:** Performance optimization
**Context:** 60 FPS UI updates wasteful for incremental game
**Decision:** Decouple UI updates (500ms) from game loop (50ms at 20 FPS)
**Consequences:**
- Better performance (less React re-renders)
- Slightly less smooth number updates
- Configurable if needed
- Significant battery savings on mobile

## Quick Reference

### File Locations
| What | Where |
|------|-------|
| Game engine | `src/core/engine/GameEngine.ts` |
| Global state | `src/core/store/gameStore.ts` |
| Resource configs | `src/features/resources/config/` |
| Producer configs | `src/features/producers/config/` |
| Upgrade configs | `src/features/upgrades/config/` |
| Achievement configs | `src/features/achievements/config/` |
| Number formatting | `src/core/utils/NumberFormatter.ts` |
| Formulas | `src/core/utils/Formulas.ts` |
| Base classes | `src/core/engine/Entity.ts`, `Producer.ts` |

### Common Tasks
| Task | How |
|------|-----|
| Add resource | Create class in `core/engine/resources/`, add to factory |
| Add producer | Create class in `core/engine/producers/`, add to factory |
| Add upgrade | Add to `createUpgrades()` in config |
| Add achievement | Add to `createAchievements()` in config |
| Change prestige formula | Update `PrestigeFormulaFactory` call in config |
| Adjust game balance | Edit config files in `features/*/config/` |
| Debug game state | Open settings menu, use debug tools |
| Change UI update rate | Modify `useGameLoop(500)` parameter in App.tsx |
| Change auto-save interval | Modify `useAutoSave(30000)` parameter in App.tsx |

### Key Constants
| Constant | Value | Location |
|----------|-------|----------|
| Game FPS | 20 | `src/core/constants/gameConfig.ts` |
| UI update rate | 500ms | `src/core/hooks/useGameLoop.ts` |
| Auto-save interval | 30s | `src/core/hooks/useAutoSave.ts` |
| Offline progress max | 1h | `src/core/engine/GameEngine.ts` |
| Min prestige requirement | 1T ore | `src/features/prestige/config/prestige.config.ts` |
| Prestige bonus per point | 10% | `src/features/prestige/config/prestige.config.ts` |

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Classes | PascalCase | `GameEngine`, `Miner`, `BigNumber` |
| Files (TS) | PascalCase | `GameEngine.ts`, `Producer.ts` |
| Files (config) | camelCase | `producers.config.ts`, `gameConfig.ts` |
| Functions | camelCase | `createProducers()`, `calculateCost()` |
| Constants | UPPER_SNAKE_CASE | `MAX_OFFLINE_TIME`, `DEFAULT_FPS` |
| Components | PascalCase | `ProducerCard`, `TouchButton` |
| Hooks | camelCase with `use` | `useGameLoop`, `useAutoSave` |
| Types/Interfaces | PascalCase | `GameContext`, `SaveData` |

---

**Last Updated:** 2025-10-18
**Codebase Version:** Post-feature-based refactor (commit 979d701)
**Total Files:** 81 TypeScript/TSX files
**Lines of Code:** ~6000+ (estimated)
