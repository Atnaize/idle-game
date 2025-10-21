# 🏭 Automation Imperium - Complete Game Design Specification

**Version:** 2.0 (Revised)
**Date:** 2025-10-21
**Status:** Ready for Implementation

---

## 📖 Core Concept

**Genre:** Mobile-first incremental automation game
**Theme:** Build industrial colonies across the galaxy, prestige to gain permanent Influence bonuses
**Target:** Casual mobile players who enjoy optimization and progression
**Session Length:** Check-ins every 1-2 hours, prestige every 2-3 hours initially (configurable)

---

## 🎮 Game Loop Summary

1. **Tap to gather** basic ores (iron, coal, copper)
2. **Build Drills** to automate ore gathering (select which ore each drill mines)
3. **Build Smelters** to convert ores into ingots (multiple ores → ingot)
4. **Build Assemblers** to convert ingots into resources (plates, wires, circuits)
5. **Hit production wall** after 2-3 hours (tunable)
6. **Prestige (Launch Colony Ship)** to earn Influence Points
7. **Spend Influence** on Tech Tree for permanent bonuses
8. **Repeat faster** with each prestige run

---

## 📦 Complete Resource List

### **Tier 1: Basic Ores** (Minutes 0-30)

| Resource | Icon | Source | Used For | Notes |
|----------|------|--------|----------|-------|
| **Iron Ore** | ⛏️ | Manual click, Drill | Smelting → Iron Ingot | Base resource |
| **Coal** | 🪨 | Manual click, Drill | Fuel for generators, Steel smelting | Essential for power |
| **Copper Ore** | 🟠 | Manual click, Drill | Smelting → Copper Ingot | Unlocks at 1K iron plates |

### **Tier 2: Ingots** (Minutes 30-90)

| Resource | Icon | Source | Used For | Smelter Recipe |
|----------|------|--------|----------|----------------|
| **Iron Ingot** | 🔩 | Smelter | → Iron Plates | 2 Iron Ore → 1 Iron Ingot |
| **Copper Ingot** | 🔶 | Smelter | → Copper Wire | 2 Copper Ore → 1 Copper Ingot |
| **Steel Ingot** | 🔷 | Smelter | → Steel Plates | 3 Iron Ore + 1 Coal → 1 Steel Ingot |

### **Tier 3: Basic Materials** (Hours 1-2)

| Resource | Icon | Source | Used For | Assembler Recipe |
|----------|------|--------|----------|------------------|
| **Iron Plate** | 📦 | Assembler | Circuits, buildings | 1 Iron Ingot → 1 Iron Plate |
| **Copper Wire** | 🧵 | Assembler | Circuits, electronics | 1 Copper Ingot → 2 Copper Wire |
| **Steel Plate** | 🛡️ | Assembler | Advanced buildings | 1 Steel Ingot → 1 Steel Plate |

### **Tier 4: Complex Components** (Hours 2-3)

| Resource | Icon | Source | Used For | Assembler Recipe |
|----------|------|--------|----------|------------------|
| **Circuit** | 🔌 | Assembler | Computers, automation | 2 Iron Plate + 3 Copper Wire → 1 Circuit |
| **Reinforced Rod** | 🔧 | Assembler | Structures | 2 Steel Plate → 1 Reinforced Rod |
| **Battery** | 🔋 | Assembler | Power cores | 3 Copper Ingot + 2 Plastic → 1 Battery |

### **Tier 5: Colony Ship Components** (Hours 3+)

| Resource | Icon | Source | Used For | Assembler Recipe |
|----------|------|--------|----------|------------------|
| **Basic Computer** | 💻 | Advanced Assembler | Ship component | 10 Circuit + 5 Plastic → 1 Basic Computer |
| **Steel Frame** | 🏗️ | Advanced Assembler | Ship component | 8 Steel Plate + 4 Reinforced Rod → 1 Steel Frame |
| **Power Core** | ⚡ | Advanced Assembler | Ship component | 6 Advanced Circuit + 4 Battery → 1 Power Core |

### **Special Resources**

| Resource | Icon | Source | Used For | Notes |
|----------|------|--------|----------|-------|
| **Power (MW)** | ⚡ | Generators | All buildings consume | Pool system, not stored |
| **Influence** | 🌟 | Prestige | Tech Tree purchases | Permanent currency, never lost |

---

## 🏗️ Complete Building List

### **Category 1: EXTRACTORS** (Gather raw ores)

Base class: `Extractor extends Building`

| Building | Tier | Produces | Cycle Time | Power | Base Cost | Unlock | Notes |
|----------|------|----------|------------|-------|-----------|--------|-------|
| **Drill Mk1** | 1 | 1 ore | 0.5s | 10 MW | 50 iron plates | Start | **Select ore:** iron, coal, or copper |
| **Drill Mk2** | 2 | 2 ore | 0.4s | 15 MW | 500 iron + 100 circuits | Tech Tree | Same ore selection |
| **Drill Mk3** | 3 | 4 ore | 0.3s | 25 MW | 5K iron + 1K circuits | Tech Tree | Fast extraction |
| **Advanced Drill** | 4 | 1 rare ore | 1.0s | 30 MW | 50K iron + 10K circuits | Tech Tree | Mines rare/advanced ores |

**Design Notes:**
- When building a Drill, player selects which ore it mines (iron/coal/copper)
- Build multiple Drills for different ores
- Mk2/3 unlocked via Tech Tree (Influence purchases)
- Advanced Drill unlocks new ore types via Tech Tree

---

### **Category 2: SMELTERS** (Convert ores → ingots)

Base class: `Smelter extends Processor`

| Building | Tier | Recipe | Cycle Time | Power | Base Cost | Unlock |
|----------|------|--------|------------|-------|-----------|--------|
| **Iron Smelter** | 1 | 2 Iron Ore → 1 Iron Ingot | 1.0s | 20 MW | 100 iron plates | Start |
| **Copper Smelter** | 2 | 2 Copper Ore → 1 Copper Ingot | 1.0s | 20 MW | 500 iron plates | Have copper drill |
| **Steel Furnace** | 2 | 3 Iron Ore + 1 Coal → 1 Steel Ingot | 2.0s | 50 MW | 2K iron + 500 copper | 5K iron ingots total |
| **Advanced Smelter** | 3 | Custom recipes | 1.5s | 40 MW | 10K iron + 3K circuits | Tech Tree |

**Design Notes:**
- Smelters ONLY convert ore → ingot (nothing else)
- Multiple inputs supported (2-4 ores)
- Single output (always 1 ingot)
- Cycle times increase with complexity (1s → 2s)
- Queue system: 5 jobs max

---

### **Category 3: ASSEMBLERS** (Convert ingots → resources)

Base class: `Assembler extends Processor`

| Building | Tier | Recipe Examples | Cycle Time | Power | Base Cost | Unlock |
|----------|------|-----------------|------------|-------|-----------|--------|
| **Basic Assembler** | 1 | 1 Iron Ingot → 1 Iron Plate | 0.5s | 15 MW | 200 iron plates | 500 iron ingots |
| **Wire Mill** | 2 | 1 Copper Ingot → 2 Copper Wire | 0.8s | 25 MW | 1K iron + 200 copper | Have copper smelter |
| **Press** | 2 | 1 Steel Ingot → 1 Steel Plate | 1.2s | 40 MW | 3K iron + 1K steel | Have steel furnace |
| **Circuit Assembler** | 3 | 2 Iron Plate + 3 Copper Wire → 1 Circuit | 3.0s | 60 MW | 5K iron + 2K circuits | 1K copper wire |
| **Advanced Assembler** | 4 | 4+ inputs → 1 output | 5.0s | 100 MW | 50K iron + 20K circuits | Tech Tree |
| **Fabrication Plant** | 5 | 10 Circuit + 5 Plastic → 1 Computer | 10.0s | 150 MW | 200K iron + 50K circuits | Tech Tree |

**Design Notes:**
- **Basic:** 1 input → 1 or 2 outputs (simple conversion)
- **Advanced:** 2 inputs → 1 output (combining materials)
- **Fabrication:** 3-4+ inputs → 1 output (complex crafting)
- Cycle times scale with complexity (0.5s → 10s)
- Later upgrades can have even more inputs

---

### **Category 4: GENERATORS** (Produce power)

Base class: `Generator extends Processor`

| Building | Tier | Produces | Fuel Cost | Power Output | Base Cost | Unlock |
|----------|------|----------|-----------|--------------|-----------|--------|
| **Coal Generator Mk1** | 1 | Power | 1 coal/2s | 50 MW | 500 iron plates | Start |
| **Coal Generator Mk2** | 2 | Power | 1 coal/2s | 100 MW | 5K iron + 2K steel | Tech Tree |
| **Coal Generator Mk3** | 3 | Power | 1 coal/1.5s | 200 MW | 30K iron + 10K steel | Tech Tree |
| **Solar Panel** | 3 | Power | None | 75 MW | 40K iron + 15K circuits | Tech Tree |
| **Hydro Plant** | 4 | Power | 10 water/s | 300 MW | 100K steel + 50K circuits | Tech Tree |
| **Nuclear Reactor** | 5 | Power | 1 uranium/10s | 1000 MW | 500K steel + 200K circuits | Tech Tree |

**Design Notes:**
- Coal generators early, clean energy late
- Power is a POOL system (total generation - total consumption)
- Buildings slow down/stop when power insufficient
- Strategic: build more generators vs optimize consumption
- Solar/Hydro require Tech Tree unlocks

---

## ⚙️ Building Mechanics

### **Cycle Time System**

All buildings (except Extractors with no inputs) use a **crafting queue** system:

```typescript
// Example: Circuit Assembler
{
  recipe: {
    inputs: { ironPlate: 2, copperWire: 3 },
    outputs: { circuit: 1 }
  },
  cycleTime: 3.0, // 3 seconds to craft
  queueSize: 5    // Can queue 5 circuits
}
```

**How It Works:**
1. Check if inputs available
2. If yes: Deduct inputs, add job to queue
3. Job processes over cycle time (progress bar visible)
4. When complete: Output added to resources
5. Automatically tries to queue next job

**Power Efficiency:**
- If power ratio = 1.0 (enough power) → full speed
- If power ratio = 0.5 (half power) → half speed (2x cycle time)
- If power ratio = 0.0 (no power) → stopped

---

## 💫 Prestige System: Influence & Tech Tree

### **How Prestige Works**

1. **Trigger:** Player clicks "Launch Colony Ship" button
2. **Requirements:** Build at least 100 total Tier 4+ components
3. **Calculation:**
   ```typescript
   influence = Math.floor(
     (tier4Components * 1.0) +
     (tier5Components * 5.0) +
     (uniqueProductionChains * 10) +
     (timeBonus) // 1.5x if under 2 hours
   )
   ```
4. **Reset:** All resources → 0, all buildings → destroyed
5. **Keep:** Total Influence, Tech Tree purchases, achievements
6. **Restart:** Fresh colony with Tech Tree bonuses active

---

### **Tech Tree System**

**Uses Existing Skill Tree Component!**

**How It Works:**
- Tree visualized like current skill tree (nodes, connections)
- Spend Influence to purchase nodes
- Nodes have levels (1/5, 2/5, etc.) - costs increase per level
- Purchasing nodes unlocks connected nodes (previously hidden)
- All purchases are **permanent** (survive prestige)

**Example Tech Tree Nodes:**

```
        [Drill Speed I] (100 Influence)
         +15% drill speed
               ↓
        [Drill Speed II] (250 Influence)
         +30% total (unlocks after I)
               ↓
        [Advanced Drills] (500 Influence)
         Unlock Mk3 drills + rare ores
               ↓
    ┌───────────┴───────────┐
[Automation I]         [Efficiency I]
Auto-queue enabled     -10% cycle times
(750 Influence)        (600 Influence)
```

**Node Categories:**
1. **Production Speed** - Reduce cycle times (5 levels, stacking)
2. **Building Unlocks** - New building types (one-time)
3. **Starting Bonuses** - Begin with resources/buildings (5 levels)
4. **Power Efficiency** - Reduce consumption (5 levels)
5. **Cost Reduction** - Cheaper buildings (5 levels)
6. **Quality of Life** - Auto-queue, bulk build (one-time)
7. **Advanced Resources** - Unlock rare ores, new materials (one-time)

**Progression:**
- Early nodes cheap (50-200 Influence)
- Mid nodes moderate (500-1500 Influence)
- Late nodes expensive (3000-10000 Influence)
- End-game nodes very expensive (50000+ Influence)

---

### **Influence Earn Rates** (Tunable)

**Configuration in code:**
```typescript
// src/core/constants/balanceConfig.ts
export const BALANCE = {
  PRESTIGE: {
    TARGET_TIME_FIRST: 7200,    // 2 hours (easily changeable)
    TARGET_TIME_LATER: 1800,     // 30 min later runs

    INFLUENCE_RATES: {
      TIER_4_COMPONENT: 1.0,     // 1 Influence per component
      TIER_5_COMPONENT: 5.0,     // 5 Influence per component
      UNIQUE_CHAIN: 10,          // 10 Influence per unique chain
      SPEED_BONUS_MULT: 1.5,     // 1.5x if under 2 hours
    },
  },
};
```

**Example Runs:**
| Prestige # | Time | Tier 4 Made | Tier 5 Made | Influence Earned | Total Influence |
|------------|------|-------------|-------------|------------------|-----------------|
| 1st | 2.5h | 100 | 0 | 100 | 100 |
| 2nd | 2h | 150 | 10 | 275 (speed bonus!) | 375 |
| 5th | 1.5h | 250 | 50 | 650 | 2,500 |
| 10th | 45min | 400 | 150 | 1,600 | 10,000 |
| 20th | 30min | 600 | 300 | 3,000 | 50,000 |

---

## 🎯 Progression Milestones & Pacing

### **Target Timings** (Configurable - See balanceConfig.ts)

| Phase | Time | Goal | Feeling |
|-------|------|------|---------|
| **Tutorial** | 0-5 min | Build first drill, smelter, assembler | Learning loop |
| **Early Game** | 5-30 min | Automate iron → ingots → plates | "It's working!" |
| **Expansion** | 30-60 min | Add copper, build circuits | Complexity increases |
| **Scaling** | 1-2 hours | Build 10+ buildings, power bottlenecks | Strategic planning |
| **Wall** | 2-3 hours | Tier 4 components too slow | "Time to prestige!" |
| **Prestige** | 3 hours | Launch colony ship, earn ~100-200 Influence | Dopamine hit |

### **Subsequent Prestige Runs**

| Prestige # | Time to Wall | Total Influence | Power Feeling |
|------------|--------------|-----------------|---------------|
| 1st | 2.5h | 100 | "Starting over is slow" |
| 2nd | 2h | 375 | "Getting faster!" |
| 5th | 1.5h | 2,500 | "I'm crushing this" |
| 10th | 45min | 10,000 | "Speed running!" |
| 20th | 30min | 50,000 | "Unstoppable" |

---

## 🎨 UI/UX Design - Mobile-First

### **Main Screen: Production Dashboard**

```
╔═══════════════════════════════════╗
║   🏭 COLONY ALPHA-7               ║
╠═══════════════════════════════════╣
║                                   ║
║ ⚡ POWER: 450 / 800 MW [████░░]   ║
║                                   ║
║ 📦 KEY RESOURCES                  ║
║ ┌───────────────────────────────┐ ║
║ │ Iron Plates    1.2K  +8.5/s  │ ║
║ │ Copper Wire      890  +4.2/s  │ ║
║ │ Circuits         124  +1.1/s  │ ║
║ │ Steel Plates      45  +0.5/s  │ ║
║ └───────────────────────────────┘ ║
║                                   ║
║ 🎯 CURRENT GOAL                   ║
║ Build 100 Circuits for Prestige   ║
║ Progress: [████░░░░] 124/100 (124%)║
║ Ready to Prestige! → +145 Influence║
║                                   ║
║ [⚙️ Build] [📊 Stats] [💫 Prestige]║
╚═══════════════════════════════════╝
```

**Uses existing DNA Helix theme:**
- `.tech-card` for containers
- `.tech-button` for buttons
- Gradient backgrounds (blue → purple → pink)
- Glow effects on important elements

---

### **Buildings Screen: Production Chains**

```
╔═══════════════════════════════════╗
║      ⛏️ IRON PRODUCTION CHAIN     ║
╠═══════════════════════════════════╣
║                                   ║
║ 🔵 Drill Mk1 (x3) → Iron Ore      ║
║ Mining: Iron Ore                  ║
║ Output: 3 ore/s total             ║
║ Power: 30 MW                      ║
║ [⬆️ Upgrade] [➕ Build] 200 plates║
║                                   ║
║         ↓ (6 ore/s total)         ║
║                                   ║
║ 🔴 Iron Smelter (x2)              ║
║ Recipe: 2 Ore → 1 Ingot           ║
║ Output: 3 ingots/s total          ║
║ Queue: [▓▓▓░░] 3/5 jobs           ║
║ Power: 40 MW                      ║
║ [⬆️ Upgrade] [➕ Build] 500 plates║
║                                   ║
║         ↓ (3 ingots/s)            ║
║                                   ║
║ 🟢 Basic Assembler (x3)           ║
║ Recipe: 1 Ingot → 1 Plate         ║
║ Output: 6 plates/s total          ║
║ Power: 45 MW                      ║
║ [⬆️ Upgrade] [➕ Build] 1K plates ║
║                                   ║
║ [🔙 Back] [🔍 Optimize]           ║
╚═══════════════════════════════════╝
```

**Visual Indicators:**
- 🔵 Blue = Extractor (Drill)
- 🔴 Red = Smelter
- 🟢 Green = Assembler
- ⚠️ Yellow = Bottleneck warning

---

### **Prestige Screen: Launch Colony Ship**

```
╔═══════════════════════════════════╗
║    💫 LAUNCH COLONY SHIP 🚀       ║
╠═══════════════════════════════════╣
║                                   ║
║ Ready to move to greener pastures!║
║ Time played: 2h 15m               ║
║                                   ║
║ 🎁 YOU WILL GAIN:                 ║
║ ┌───────────────────────────────┐ ║
║ │ Influence Earned: +187        │ ║
║ │ Total Influence: 100 → 287    │ ║
║ │                                │ ║
║ │ 🌳 NEW TECH TREE NODES:       │ ║
║ │ • Drill Speed II (unlocked!)  │ ║
║ │ • Smelter Efficiency I        │ ║
║ │ • Starting Resources I        │ ║
║ │                                │ ║
║ │ 📈 Active Bonuses:             │ ║
║ │ • Drill Speed: +15%            │ ║
║ │ • Building Cost: -10%          │ ║
║ └───────────────────────────────┘ ║
║                                   ║
║ ⏭️ NEXT RUN ESTIMATE: ~1h 45m    ║
║ (This run: 2h 15m)                ║
║                                   ║
║ ⚠️ All buildings and resources    ║
║ will be reset!                    ║
║                                   ║
║ [❌ Not Yet] [✅ LAUNCH SHIP! 🚀] ║
╚═══════════════════════════════════╝
```

---

### **Tech Tree Screen** (Uses Existing Skill Tree Component)

```
╔═══════════════════════════════════╗
║   🌳 TECH TREE - 287 Influence    ║
╠═══════════════════════════════════╣
║                                   ║
║    [Drill Speed I] ✅             ║
║         ↓                         ║
║    [Drill Speed II] 🔓            ║
║    +30% total (250 Influence)     ║
║    [PURCHASE]                     ║
║         ↓                         ║
║    [Advanced Drills] 🔒           ║
║    (Unlock Drill Speed II first)  ║
║                                   ║
║  [Smelter Speed I] 🔓             ║
║  +15% speed (150 Influence)       ║
║  [PURCHASE]                       ║
║                                   ║
║ Legend:                           ║
║ ✅ Purchased  🔓 Available        ║
║ 🔒 Locked     ⭐ Rare Node        ║
║                                   ║
║ [🔙 Back] [💡 Reset Tree]         ║
╚═══════════════════════════════════╝
```

---

## 🔧 Technical Specifications

### **Building Class Hierarchy**

```typescript
// Base building class
abstract class Building extends Purchasable {
  tier: number;
  powerConsumption: BigNumber;
  currentEfficiency: number; // 0.0-1.0 based on power

  abstract tick(deltaTime: number, context: GameContext): void;
}

// Extractors: No inputs, produce ore
class Extractor extends Building {
  selectedOre: 'iron' | 'coal' | 'copper'; // Player chooses
  outputAmount: BigNumber;
  cycleTime: number;
  currentProgress: number;
}

// Processor base: Has inputs/outputs, queue system
abstract class Processor extends Building {
  recipe: {
    inputs: { [resourceId: string]: BigNumber };
    outputs: { [resourceId: string]: BigNumber };
  };
  cycleTime: number;
  queue: CraftingJob[];
  maxQueueSize: number;
  currentJob: CraftingJob | null;
}

// Smelter: Ore → Ingot only
class Smelter extends Processor {
  // Specialization: inputs must be ores, output must be ingot
}

// Assembler: Ingot → Resource
class Assembler extends Processor {
  // Specialization: inputs are ingots/materials, outputs are resources
}

// Generator: Fuel → Power
class Generator extends Processor {
  powerOutput: BigNumber;
  fuelType: string | null; // null = no fuel (solar)
}
```

---

### **Resource Organization**

```
src/core/engine/resources/
├── ores/
│   ├── IronOre.ts
│   ├── CoalOre.ts
│   ├── CopperOre.ts
│   ├── RareOre.ts
│   └── index.ts
├── ingots/
│   ├── IronIngot.ts
│   ├── SteelIngot.ts
│   ├── CopperIngot.ts
│   └── index.ts
├── materials/
│   ├── IronPlate.ts
│   ├── CopperWire.ts
│   ├── Circuit.ts
│   ├── Battery.ts
│   └── index.ts
└── index.ts
```

---

### **Balance Configuration**

**File:** `src/core/constants/balanceConfig.ts`

```typescript
export const BALANCE = {
  // Prestige timing (easily adjustable!)
  PRESTIGE: {
    TARGET_TIME_FIRST: 7200,     // 2 hours in seconds
    TARGET_TIME_LATER: 1800,      // 30 min for later runs
    MIN_COMPONENTS: 100,          // Tier 4+ required

    INFLUENCE_RATES: {
      TIER_4_COMPONENT: 1.0,
      TIER_5_COMPONENT: 5.0,
      UNIQUE_CHAIN: 10,
      SPEED_BONUS_MULT: 1.5,      // If under 2 hours
    },
  },

  // Production rates
  PRODUCTION: {
    EXTRACTOR_CYCLE: 0.5,         // Drills
    SMELTER_CYCLE: 1.0,           // Smelters
    ASSEMBLER_BASIC_CYCLE: 0.5,   // Basic assemblers
    ASSEMBLER_ADV_CYCLE: 3.0,     // Advanced assemblers
    FABRICATION_CYCLE: 10.0,      // Fabrication plants
  },

  // Costs
  COSTS: {
    DRILL_BASE: 50,
    SMELTER_BASE: 200,
    ASSEMBLER_BASE: 1000,
    COST_MULTIPLIER: 1.15,        // Exponential scaling
  },

  // Power
  POWER: {
    DRILL_CONSUMPTION: 10,
    SMELTER_CONSUMPTION: 30,
    ASSEMBLER_CONSUMPTION: 50,
    GENERATOR_OUTPUT: 50,
  },
};
```

**Why This Works:**
- All tuning in ONE place
- Easy to test different timings
- Can create difficulty presets
- Balance changes don't require code rewrites

---

## 📊 Game Balance Numbers

### **Target Production Rates** (First Prestige, No Bonuses)

| Time | Iron/s | Copper/s | Circuits/s | Steel/s | Tier 4/s |
|------|--------|----------|------------|---------|----------|
| 10 min | 2 | 0 | 0 | 0 | 0 |
| 30 min | 8 | 0 | 0 | 0 | 0 |
| 1 hour | 15 | 5 | 0.5 | 0 | 0 |
| 2 hours | 30 | 15 | 2.5 | 3 | 0.1 |
| 3 hours | 50 | 30 | 5.0 | 8 | 0.5 |

### **Prestige Requirements**

| Component Tier | Amount Needed | Influence per Component |
|----------------|---------------|-------------------------|
| Tier 4 | 100 | 1.0 |
| Tier 5 | 50 | 5.0 |
| **Total for First Prestige** | **~150** | **~350 Influence** |

---

## ✅ Key Design Principles

### **1. Simplicity First**
- Only 3 building types (Drill, Smelter, Assembler)
- Clear resource flow (ore → ingot → resource)
- No complex placement/logistics
- Tap to build, that's it

### **2. Player Agency**
- Choose which ore each Drill mines
- Choose which Tech Tree nodes to buy
- No forced progression path
- Respec available (reset Tech Tree for Influence cost)

### **3. Scalability**
- Easy to add new ores (just new config)
- Easy to add new recipes (just config)
- Easy to add Tech Tree nodes (existing system)
- Balance config in one file

### **4. Mobile-Optimized**
- Uses existing DNA Helix theme
- Touch-optimized buttons (44x44px min)
- Simple list-based UI
- Offline progress (up to 8 hours)

### **5. Replayability**
- Each prestige run faster
- Tech Tree offers different paths
- Challenge achievements (speed runs)
- Long-term progression (50K+ Influence unlocks)

---

## 🎯 Implementation Notes

### **Phase 1: Core Systems** (Week 1-2)
- Building base class
- Extractor, Processor (Smelter + Assembler)
- Power system
- Resource organization

### **Phase 2: Prestige** (Week 3-4)
- Influence calculation
- Tech Tree integration (use existing skill tree)
- Reset logic

### **Phase 3: Content** (Week 5-6)
- 20+ buildings
- 25+ resources
- 30+ Tech Tree nodes

### **Phase 4: Balance** (Week 7-8)
- Playtest timing
- Adjust BALANCE config
- Iterate on feel

---

**This design is ready for implementation!**
**All systems designed to be easily tunable via balanceConfig.ts**
**Last Updated:** 2025-10-21 (Revised with corrections)
