# Idle Game Project - Claude Code Instructions

## Project Overview
This is a mobile-first idle game inspired by Idle Planet Miner, built with React and TypeScript. The game features resource management, incremental progression, prestige mechanics, and handles extremely large numbers.

## Core Principles

### 1. Architecture Patterns
- **Use design patterns extensively**: Strategy, Factory, Observer, Command, State patterns
- **Composition over inheritance**: Favor small, composable classes
- **Dependency Injection**: All dependencies should be injectable for testability
- **Single Responsibility**: Each class should do ONE thing well
- **Open/Closed Principle**: Open for extension, closed for modification

### 2. Code Organization
```
src/
├── core/           # Abstract base classes, interfaces, types
├── systems/        # Game systems (resources, upgrades, progression)
├── entities/       # Game entities (resources, buildings, upgrades)
├── managers/       # High-level managers (GameManager, SaveManager)
├── utils/          # Utility functions, big number handling
├── ui/             # React components organized by feature
├── hooks/          # Custom React hooks
└── config/         # Game balance configuration
```

### 3. TypeScript Standards
- **Strict mode enabled**: Always use strict TypeScript
- **No any types**: Use unknown or proper generics instead
- **Explicit return types**: Always declare return types on functions
- **Readonly where possible**: Use readonly for immutable data
- **Branded types**: Use type branding for domain-specific primitives
- **Discriminated unions**: For state machines and variants

### 4. Big Numbers
- **Always use Decimal.js** for any numeric game values
- **Never use JavaScript numbers** for game currency/resources
- **Create type aliases**: `type GameNumber = Decimal`
- **Centralize number formatting**: All display formatting in one utility

### 5. Performance
- **React.memo for all components** except very simple ones
- **useMemo and useCallback**: Memoize expensive computations
- **Virtualization**: Use virtual scrolling for long lists
- **Debounce/Throttle**: All user input that triggers calculations
- **Web Workers**: Consider for heavy computations (offline progress)
- **Immutable updates**: Never mutate state directly

### 6. Mobile-First UI
- **Touch targets**: Minimum 44x44px touch areas
- **Viewport units**: Use vh/vw for full-screen layouts
- **No hover states**: Design for touch-only interaction
- **Safe areas**: Account for notches and system UI
- **Vertical scrolling**: Primary navigation should be vertical
- **Single column layouts**: Avoid multi-column on mobile

### 7. Game Systems

#### Resource System
- Abstract `Resource` base class
- `ResourceManager` with Observer pattern for updates
- Support for: production rate, storage capacity, multipliers
- Efficient tick-based updates

#### Upgrade System
- Abstract `Upgrade` base class with cost formulas
- Strategy pattern for different cost scaling (linear, exponential, custom)
- `UpgradeManager` to handle purchase validation
- Effect system for upgrade bonuses

#### Progression System
- Milestone system with rewards
- Achievement tracking
- Prestige mechanics with permanent bonuses
- Difficulty scaling with soft/hard caps

#### Save System
- Auto-save every 30 seconds
- LocalStorage with fallback
- Versioned save format for migrations
- Offline progress calculation on load

### 8. Refactoring First
- **Always check existing code** before creating new classes
- **Extract common patterns**: If you see duplication, refactor immediately
- **Simplify before adding**: Remove complexity before adding features
- **Tests guide refactoring**: Write tests before major refactors

### 9. Code Style
- **Functional where possible**: Prefer pure functions
- **Early returns**: Avoid nested conditionals
- **Descriptive names**: `calculateOfflineResourceGain` not `calc`
- **No magic numbers**: All game constants in config files
- **Comments for "why"**: Code explains "what", comments explain "why"

### 10. Testing Strategy
- Unit tests for all game logic (systems, entities, utilities)
- Integration tests for manager classes
- No UI tests initially (focus on logic)
- Property-based testing for numerical calculations

## Example Patterns

### Abstract Resource
```typescript
abstract class Resource {
  abstract readonly id: string;
  abstract readonly name: string;
  protected amount: Decimal;
  protected capacity: Decimal;

  abstract calculateProductionRate(): Decimal;

  tick(deltaTime: number): void {
    // Common tick logic
  }
}
```

### Strategy Pattern for Costs
```typescript
interface CostStrategy {
  calculateCost(baseAmount: Decimal, level: number): Decimal;
}

class ExponentialCostStrategy implements CostStrategy {
  constructor(private multiplier: number) {}

  calculateCost(baseAmount: Decimal, level: number): Decimal {
    return baseAmount.mul(Decimal.pow(this.multiplier, level));
  }
}
```

### Observer Pattern for Events
```typescript
interface GameEventListener {
  onResourceChanged(resource: Resource): void;
  onUpgradePurchased(upgrade: Upgrade): void;
}
```

## When Adding New Features
1. Check if similar functionality exists - reuse/extend it
2. Design the abstraction first - what interface makes sense?
3. Create the abstract base class/interface
4. Implement concrete classes
5. Add to appropriate manager
6. Update configuration files
7. Add tests for new logic
8. Create UI components last

## Anti-Patterns to Avoid
- ❌ Mutating props or state directly
- ❌ Using component state for game logic
- ❌ Tight coupling between UI and game logic
- ❌ Large monolithic components (>200 lines)
- ❌ JavaScript numbers for game calculations
- ❌ Magic numbers/strings
- ❌ Unhandled promise rejections
- ❌ Missing error boundaries in React

## Decision Log
Document major architectural decisions here as the project evolves.

### Decision 1: Decimal.js for Number Handling
**Context**: Idle games reach numbers beyond JavaScript's safe integer range (2^53)
**Decision**: Use Decimal.js for all game numeric values
**Consequences**: Slightly slower than native numbers, but handles arbitrary precision

### Decision 2: Separate Game Logic from React
**Context**: Game logic should be testable and framework-agnostic
**Decision**: Core game systems are pure TypeScript classes, React is just a view layer
**Consequences**: More boilerplate, but better separation of concerns and testability

### Decision 3: Mobile-Only Focus
**Context**: Optimizing for all screen sizes adds complexity
**Decision**: Design exclusively for mobile portrait (375-430px width)
**Consequences**: Simpler CSS, better mobile UX, but no desktop support
