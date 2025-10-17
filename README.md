# Idle Miner - Mobile Incremental Game

A mobile-first idle/incremental game built with React, TypeScript, and Tailwind CSS. Inspired by Idle Planet Miner.

## Features

- **TypeScript Throughout**: Fully typed codebase with strict type checking
- **Mobile-First Design**: Optimized for smartphones (375-430px width)
- **Big Number Support**: Uses break_infinity.js to handle extremely large numbers
- **Class-Based Architecture**: Clean OOP design with inheritance and composition
- **Multiple Producer Tiers**: 6 tiers of producers (Miners, Drills, Complexes, Quantum Devices)
- **Upgrade System**: Permanent improvements with multiplier effects
- **Achievement System**: Track progress with rewards
- **Manual Clicking**: Optional click power system with crits and upgrades
- **Prestige System**: Reset for permanent production bonuses
- **Auto-Save**: Automatic saving every 30 seconds
- **Offline Progress**: Earn resources while away (up to 1 hour)

## Tech Stack

- **React 18** - UI framework
- **TypeScript 5.7** - Type safety
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **break_infinity.js** - Big number handling

## Project Structure

```
src/
├── engine/              # Core game logic
│   ├── Entity.ts        # Base classes (Entity, Resource, Purchasable)
│   ├── Producer.ts      # Producer and Upgrade classes
│   ├── GameEngine.ts    # Main game loop
│   ├── BigNumber.ts     # Number wrapper
│   ├── Achievement.ts   # Achievement system
│   ├── ClickPower.ts    # Manual clicking system
│   ├── Prestige.ts      # Prestige mechanics
│   ├── producers/       # Specialized producer types
│   │   ├── Miner.ts
│   │   ├── Drill.ts
│   │   ├── Complex.ts
│   │   └── QuantumDevice.ts
│   └── resources/       # Specialized resource types
│       └── Ore.ts
├── components/          # React components
│   ├── layout/          # Header, Navigation
│   ├── resources/       # Resource display
│   ├── click/           # Click area
│   ├── tabs/            # Tab content (Producers, Upgrades, etc.)
│   ├── producers/       # Producer cards
│   ├── upgrades/        # Upgrade cards
│   ├── achievements/    # Achievement cards
│   └── ui/              # Reusable UI components
├── store/               # Zustand store
│   └── gameStore.ts
├── config/              # Game data configuration
│   └── gameData.ts
├── utils/               # Utility functions
│   ├── NumberFormatter.ts
│   └── Formulas.ts
├── types/               # TypeScript type definitions
│   └── core.ts
└── App.tsx              # Main app component
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run typecheck
```

## Game Progression

### Early Game (0-1000 ore)
1. Click manually to get your first ore
2. Buy your first Miner
3. Purchase "Better Pickaxes" upgrade
4. Unlock Excavator at 10 miners

### Mid Game (1K-1M ore)
1. Unlock Drill at 25 excavators
2. Purchase Efficiency Training upgrades
3. Reach milestone achievements for multipliers
4. Unlock Laser Drill

### Late Game (1M+ ore)
1. Unlock Mining Complex (synergy bonuses)
2. Unlock Quantum Miner (exponential scaling)
3. Build towards prestige (1 trillion ore)

### Prestige
- Requirement: 1 trillion (1e12) ore
- Gain: Prestige Points based on cubic root formula
- Bonus: 10% production per prestige point
- Keeps: Achievements
- Resets: Resources, Producers, Upgrades

## Architecture Highlights

### BigNumber System
All game values use BigNumber to support numbers beyond JavaScript's safe integer range:
```typescript
const amount = BigNumber.from(1000);
const doubled = amount.mul(2); // Returns BigNumber
```

### Class Hierarchy
```
Entity (abstract)
├── Resource
│   └── Ore
├── Purchasable (abstract)
    ├── Producer
    │   ├── Miner (Tier 1-2)
    │   ├── Drill (Tier 3-4)
    │   ├── Complex (Tier 5)
    │   └── QuantumDevice (Tier 6+)
    ├── Upgrade
    ├── ClickPower
    └── ClickUpgrade
```

### Game Loop
- Target: 20 FPS (50ms per tick)
- Updates: Resources, unlocks, multipliers, achievements
- Auto-save: Every 30 seconds
- UI refresh: 10 times per second

## Development Guidelines

### Adding New Producers
1. Create class in `src/engine/producers/`
2. Extend `Producer` or specialized class
3. Add to `createProducers()` in `gameData.ts`
4. Set unlock conditions

### Adding New Upgrades
1. Create upgrade in `createUpgrades()` in `gameData.ts`
2. Set target (producer/all/resource)
3. Define effect type and value
4. Set unlock condition

### Adding New Achievements
1. Create achievement in `createAchievements()` in `gameData.ts`
2. Use appropriate achievement class (Milestone, Production, Purchase)
3. Define reward if applicable

## Performance Considerations

- React components are memoized where beneficial
- Game logic runs separately from React updates
- BigNumber operations are optimized for common cases
- Virtual scrolling for long lists (if needed)

## Mobile Optimization

- Touch targets: Minimum 44x44px
- Viewport: Designed for 375-430px width
- No hover states - touch-only interaction
- Bottom navigation for easy thumb access
- Safe area handling for notches

## Credits

- Inspired by **Idle Planet Miner**
- Built with **React**, **TypeScript**, and **Vite**
- Number handling by **break_infinity.js**

## License

MIT

---

**Built with TypeScript from the ground up!** 🚀
