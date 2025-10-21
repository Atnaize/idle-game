# 🔄 Design Changes Summary - Automation Imperium

**Date:** 2025-10-21
**Status:** Refinements based on user feedback

---

## 🎯 Key Changes Overview

### **1. Core Terminology Changes**

| OLD TERM | NEW TERM | Reason |
|----------|----------|--------|
| Processor | **Smelter** | Specifically converts ore → ingot (nothing else) |
| Corp XP | **Influence** | More engaging, corporate-themed currency |
| Corporation Level | **(Removed)** | No automatic levels, spend Influence directly on Tech Tree |
| Iron Drill | **Drill** | Generic - can drill any basic ore (iron, coal, copper) |
| "Destroy Building" | **(Removed)** | Doesn't make sense in this context |

---

## 🏗️ Corrected Building Architecture

### **Building Types (3 Main Categories)**

```
Building (Base Class)
├── Extractor - Gathers raw ores
│   └── Drill (can mine iron, coal, copper - build multiple instances)
│
├── Smelter - Converts ores → ingots ONLY
│   ├── Takes multiple ores as input
│   └── Outputs ingots (iron ingot, steel ingot, etc.)
│
└── Assembler - Converts ingots → resources
    ├── Basic: 1 input → 1 output (iron ingot → iron plate)
    └── Advanced: 2+ inputs → 1 output (iron plate + copper wire → circuit)
```

**Class Hierarchy Decision:** **Option B - Shared logic**
- Extractor (no inputs, produces ore)
- **Processor** (base class for Smelter + Assembler)
  - Both have inputs/outputs
  - Both use recipe system
  - Smelter specialization: ore → ingot
  - Assembler specialization: ingot → resource

**Generators:**
- Use Processor base class
- Special case: consumes coal → produces power
- Treated as buildings with special output (power pool)

---

## 📦 Resource Flow (Corrected)

### **Complete Production Chain**

```
1. EXTRACTION
   Manual Click → Ore (in inventory)
        OR
   Drill (Mk1/2/3) → Ore (iron, coal, copper)

2. SMELTING (NEW STEP)
   Smelter: Multiple Ores → Ingot
   Example: 2 iron ore + 1 coal → 1 steel ingot

3. ASSEMBLY
   Assembler: Ingots → Resources
   Example 1: 1 iron ingot → 1 iron plate
   Example 2: 2 iron plate + 3 copper wire → 1 circuit

4. POWER GENERATION
   Generator: Coal → Power (MW)
   Power: Global pool consumed by all buildings
```

**Key Changes:**
- ❌ **Removed:** "Sell ore" mechanic (was a mistake)
- ✅ **Added:** Smelting step (ore → ingot)
- ✅ **Clarified:** Drills mine any basic ore (not ore-specific)

---

## 🎓 Prestige System Redesign

### **OLD System (Removed)**
```
Prestige → Earn Corp XP → Corp Level increases → Automatic bonuses unlock
```

### **NEW System (Influence + Tech Tree)**
```
Prestige → Earn Influence Points → Spend on Tech Tree → Unlock permanent bonuses
```

**How It Works:**
1. Player reaches production wall (configurable timing)
2. Clicks "Launch Colony Ship" (prestige button)
3. Earns **Influence** based on progress:
   - Total tier 4/5 components produced
   - Unique production chains completed
   - Time efficiency bonus (under 2 hours)
4. **Tech Tree appears** with purchasable bonuses:
   - "Drill Speed +15%" (Level 1/5) - Costs 100 Influence
   - Buy Level 2 for more bonus (+30% total) - Costs 250 Influence
   - Level 3 unlocks new nodes (previously hidden)
5. All resources/buildings reset
6. Restart colony with purchased bonuses active

**Benefits:**
- Player chooses progression path (freedom)
- Visible meta-progression (tech tree fills up)
- Replayability (try different build orders)
- Existing skill tree system already implements this!

---

## 🗂️ File Structure Changes

### **Resource Organization**

**NEW Structure:**
```
src/core/engine/resources/
├── ores/               # NEW: Ore-specific folder
│   ├── IronOre.ts
│   ├── CoalOre.ts
│   ├── CopperOre.ts
│   ├── RareOre.ts     # Advanced ores (tier 2+)
│   └── index.ts
├── ingots/             # NEW: Smelted products
│   ├── IronIngot.ts
│   ├── SteelIngot.ts
│   ├── CopperIngot.ts
│   └── index.ts
├── materials/          # NEW: Assembled resources
│   ├── IronPlate.ts
│   ├── CopperWire.ts
│   ├── Circuit.ts
│   └── index.ts
└── index.ts            # Export all
```

**Why:**
- Clear separation by production stage
- Easier to find/add new resources
- Scalable for 50+ resources

---

## ⚙️ Balance Configuration

### **Tunable Parameters (New File)**

**File:** `src/core/constants/balanceConfig.ts`

```typescript
export const BALANCE_CONFIG = {
  // === PRESTIGE TIMING ===
  PRESTIGE: {
    TARGET_TIME_FIRST: 7200,      // 2 hours (first prestige)
    TARGET_TIME_LATER: 1800,       // 30 min (later runs)
    WALL_MULTIPLIER: 0.75,         // Production wall at 75% of target

    INFLUENCE_RATE: {
      TIER_4_COMPONENT: 1.0,       // 1 Influence per Tier 4 component
      TIER_5_COMPONENT: 5.0,       // 5 Influence per Tier 5 component
      UNIQUE_CHAIN: 10,            // 10 Influence per unique chain
      SPEED_BONUS: 1.5,            // 1.5x if under 2 hours
    },
  },

  // === PRODUCTION RATES ===
  PRODUCTION: {
    // Cycle times (seconds)
    EXTRACTOR_BASE_CYCLE: 0.5,     // Drills produce every 0.5s
    SMELTER_BASE_CYCLE: 1.0,       // Smelters take 1s per craft
    ASSEMBLER_BASIC_CYCLE: 2.0,    // Basic assemblers take 2s
    ASSEMBLER_ADVANCED_CYCLE: 5.0, // Advanced assemblers take 5s

    // Scaling factors
    EARLY_GAME_MULT: 1.0,
    MID_GAME_MULT: 0.6,
    LATE_GAME_MULT: 0.2,           // Forces prestige
  },

  // === COSTS ===
  COSTS: {
    DRILL_BASE_COST: 50,           // Iron plates
    SMELTER_BASE_COST: 200,
    ASSEMBLER_BASE_COST: 1000,
    COST_MULTIPLIER: 1.15,         // Exponential scaling
  },

  // === POWER ===
  POWER: {
    DRILL_CONSUMPTION: 10,         // MW per drill
    SMELTER_CONSUMPTION: 30,
    ASSEMBLER_CONSUMPTION: 50,
    GENERATOR_OUTPUT: 50,          // Coal generator output
  },
};
```

**Benefits:**
- All tuning in ONE file
- Easy to playtest and adjust
- No magic numbers scattered in code
- Can create "easy mode" / "hard mode" presets

---

## 🎨 Visual Style (Reference Existing)

**Current Theme:** DNA Helix / Sci-Fi Tech

**Colors:**
- Primary: Blue (#3b82f6) → Purple (#a855f7) → Pink (#ec4899)
- Backgrounds: Deep space (dark blues/blacks)
- Accents: Cyan, Green, Amber, Red

**Components:**
- `.tech-card` - Card container with borders
- `.tech-button` - Gradient buttons with glow
- `TouchButton` - Mobile-optimized 44x44px min
- `Modal` - Portal-based with backdrop blur

**Files:**
- `src/styles/theme.css` - Design tokens
- `src/shared/components/` - Reusable components
- `tailwind.config.js` - Extended theme

**New Components Should:**
- Use existing `.tech-card`, `.tech-button` classes
- Follow 44x44px minimum touch targets
- Use CSS custom properties (`var(--helix-blue)`)
- Include hover/active states for feedback

---

## 🔧 Drill System Clarification

### **How Drills Work**

**Question:** Does 1 Drill mine ALL ores, or do you build multiple Drills?

**Answer:** **Option C - Build multiple instances**

**Implementation:**
```typescript
// Drill building (generic)
class Drill extends Extractor {
  // Player chooses which ore to mine when placing
  selectedOre: 'iron' | 'coal' | 'copper';

  // OR: Auto-detect based on available ores
  // OR: Build 3 drills, each configured separately
}

// In UI:
"Build Drill" → Modal: "What should this drill mine?"
  [Iron Ore] [Coal] [Copper Ore]
```

**Tiers:**
- **Drill Mk1:** Mines basic ores (iron, coal, copper)
- **Drill Mk2:** Unlocked at Influence level 10, 2x faster
- **Advanced Drill:** Mines rare ores (unlocked via tech tree)

**Advanced Ores:**
- Unlocked through **tier progression** (tech tree)
- Example: "Unlock Titanium Ore" (200 Influence)
- Requires **Advanced Drill** building type

---

## 📋 Document Update Checklist

### **Files to Update:**

✅ **BALANCED_GAME_DESIGN.md**
- [ ] Replace "Processor" with "Smelter"
- [ ] Replace "Corp XP" with "Influence"
- [ ] Remove Corp Level system
- [ ] Add Tech Tree spending mechanic
- [ ] Update resource flow (add smelting step)
- [ ] Remove "sell ore" references
- [ ] Update building list (3 types, not 4)
- [ ] Add BALANCE_CONFIG references

✅ **TECHNICAL_ARCHITECTURE.md**
- [ ] Update class hierarchy (Extractor, Processor base for Smelter/Assembler)
- [ ] Add resource folder structure (ores/, ingots/, materials/)
- [ ] Remove Corp Level logic from GameEngine
- [ ] Add Influence calculation
- [ ] Add Tech Tree integration
- [ ] Update serialization for new structure

✅ **IMPLEMENTATION_ROADMAP.md**
- [ ] Update Week 1: Build Extractor + Processor (base for Smelter/Assembler)
- [ ] Update Week 5: Influence system (not Corp Level)
- [ ] Add Tech Tree implementation tasks
- [ ] Update terminology throughout

✅ **Create: BALANCE_CONFIG.md**
- [ ] Document all tunable parameters
- [ ] Explain how to adjust timing
- [ ] Provide example presets (easy/normal/hard)

✅ **Create: STYLE_GUIDE.md**
- [ ] Document DNA Helix theme
- [ ] List reusable component classes
- [ ] Show color palette
- [ ] Provide component examples
- [ ] Touch target guidelines (44x44px)

---

## 🚀 Implementation Priority

### **Phase 1: Core Corrections (Week 1-2)**
1. Rename classes (Processor → base, Smelter + Assembler extend it)
2. Reorganize resources folder structure
3. Update GameEngine (remove Corp Level, add Influence)
4. Create BALANCE_CONFIG.ts with tunable values

### **Phase 2: Prestige Redesign (Week 3-4)**
1. Implement Influence calculation on prestige
2. Integrate with existing Skill Tree system
3. Create Tech Tree nodes (bonuses)
4. Test spending/unlocking flow

### **Phase 3: Balance & Test (Week 5+)**
1. Playtest with tunable BALANCE_CONFIG
2. Adjust timing to hit 2-hour target
3. Balance Influence earn rates
4. Iterate on feel

---

## ✅ Key Takeaways

**What Changed:**
- Smelter is now its own distinct step (ore → ingot)
- Influence replaces Corp XP/Level system
- Tech Tree for spending Influence (player choice)
- Drills are generic (build multiple, not ore-specific)
- All timing is configurable in BALANCE_CONFIG

**What Stayed:**
- Recipe system with cycle times
- Power pool system
- Save/load architecture
- Achievement system
- Visual style (DNA Helix theme)

**What Was Removed:**
- "Sell ore" mechanic
- Automatic Corp Level unlocks
- "Destroy building" action
- Ore-specific drill types

---

## 🎯 Next Steps

1. **Review this summary** - Confirm all changes are correct
2. **Update main design docs** - Use this as reference
3. **Create BALANCE_CONFIG.md** - Document tunable parameters
4. **Create STYLE_GUIDE.md** - Document visual system
5. **Start implementation** - Follow refined roadmap

**Questions? Adjustments needed?** Let me know and I'll refine further! 🚀
