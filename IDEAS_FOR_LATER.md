# 💡 Ideas for Later - Future Features

**Purpose:** Track great ideas that aren't in the initial release but should be considered for future updates.

---

## 🏪 Deferred from Initial Design

### **1. Resource Storage Caps & Warehouses**
**From:** Question 3 discussion
**Description:** Add maximum storage limits for resources, require warehouse buildings to expand capacity

**Why It's Good:**
- Adds strategic depth (balance production vs storage)
- Creates resource sinks (spend resources on warehouses)
- Prevents infinite stockpiling exploits
- Realistic industrial feel

**Why Deferred:**
- Adds complexity to initial learning curve
- Current game has no caps (simpler to implement first)
- Can frustrate players early game ("Why did my production stop?")

**Implementation Ideas:**
```typescript
class Warehouse extends Building {
  storageCapacity: { [resourceId: string]: BigNumber };
  tier: number; // Higher tier = more capacity
}

// Example: Basic Warehouse
{
  name: "Basic Warehouse",
  cost: { iron_plates: 1000 },
  storageCapacity: {
    iron_ore: 10000,
    iron_ingots: 5000,
    iron_plates: 2500
  }
}
```

**When to Add:** Version 1.2 or 2.0
**Corp XP Unlock:** Level 35 ("Unlock: Advanced Logistics")

---

### **2. Purchasable Bottleneck Detection**
**From:** Question 13 discussion
**Description:** Auto-detect production bottlenecks and suggest fixes (initially enabled, later require Corp XP unlock)

**Why It's Good:**
- Quality of life feature for casual players
- Creates progression (unlock better tools with Corp XP)
- Makes game accessible while rewarding veterans

**Why Deferred:**
- Core bottleneck detection should be free (mobile-friendly)
- Can layer advanced features on top later
- Need to test if bottleneck hints are too hand-holdy first

**Implementation Tiers:**
```typescript
// Tier 1: Free (Always Available)
- Visual indicators (⚠️ bottleneck icon)
- Simple tooltip ("This building is backed up")

// Tier 2: Corp Level 15 Unlock
- Specific suggestions ("Build 2 more smelters")
- Production chain graphs with flow visualization

// Tier 3: Corp Level 30 Unlock
- Auto-balance button (auto-build to fix bottleneck)
- Efficiency optimizer (suggests best building placements)
- Predictive warnings ("In 10 minutes, drills will bottleneck")
```

**When to Add:** Version 1.3
**Corp XP Cost:**
- Tier 2: Unlock at Corp Level 15 (free unlock)
- Tier 3: Purchase with 5,000 Corp XP

---

## 🎮 Gameplay Enhancements

### **3. Building Templates & Blueprints**
**Description:** Save building configurations as templates, instantly build entire production chains

**Example:**
```
"Iron Production Line" template:
- 3x Iron Drill Mk1
- 2x Iron Smelter
- 4x Constructor
Total cost: 5,000 iron plates
[Build Template]
```

**When to Add:** Version 1.4
**Corp XP Unlock:** Level 20

---

### **4. Automation Research Tree**
**Description:** Unlock automation features via Corp XP

**Examples:**
- Auto-upgrade buildings when affordable (toggle per building)
- Auto-sell excess resources (prevent storage overflow)
- Auto-balance production chains (keep ratios optimal)
- Smart power management (prioritize critical buildings when low power)

**When to Add:** Version 2.0
**Corp XP Cost:** 1,000-10,000 per node

---

### **5. Building Specializations**
**Description:** Choose specialization when building (trade-offs)

**Example:**
```
Iron Drill Mk1 Specializations:
A) Speed Focus: +50% output, +100% power consumption
B) Efficiency Focus: -50% power consumption, -25% output
C) Balanced: No bonuses (default)
```

**When to Add:** Version 2.1
**Unlock:** Corp Level 40

---

### **6. Events & Challenges**
**Description:** Time-limited events with special rewards

**Examples:**
- **Speed Challenge:** "Reach 1,000 circuits in under 1 hour" → Reward: +500 Corp XP
- **Efficiency Challenge:** "Produce 10K iron using <500 MW power" → Unlock special generator
- **Mega Production Day:** "All production 2x for 24 hours" (random event)

**When to Add:** Version 2.2
**Frequency:** Weekly rotating challenges

---

### **7. Colony Naming & Customization**
**Description:** Personalize colonies with names, colors, icons

**Examples:**
- Name your colony ("New Terra", "Mining Outpost #47")
- Choose color theme (blue, red, green industrial themes)
- Custom building icons (cosmetic only)

**Monetization Potential:** Premium feature ($1.99) or Corp Level 50 unlock
**When to Add:** Version 1.5

---

### **8. Multi-Colony Management** (Advanced)
**Description:** Run multiple colonies simultaneously (late-game complexity)

**How It Works:**
- Unlock at Corp Level 60
- Each colony produces different primary resource
- Can trade resources between colonies
- Mega Projects require resources from multiple colonies

**Why Deferred:**
- Massive scope increase
- Requires complete UI overhaul
- Risk of over-complexity

**When to Add:** Version 3.0 or spin-off game

---

## 🌟 New Horizons Expansion Ideas

### **9. Quantum Cores & Mega Projects**
**Description:** Permanent endgame currency and long-term goals

**Mega Projects (V2.0):**
```typescript
interface MegaProject {
  name: string;
  description: string;
  cost: { quantum_cores: BigNumber };
  buildTime: number; // Real-time days
  reward: string;
}

// Examples:
{
  name: "Dyson Sphere",
  cost: { quantum_cores: 100000 },
  buildTime: 7, // 7 days real-time
  reward: "+1000% power generation globally"
}

{
  name: "Galactic Trading Hub",
  cost: { quantum_cores: 50000 },
  buildTime: 5,
  reward: "Passive income: 1000 iron/hour offline"
}

{
  name: "Corporate Headquarters",
  cost: { quantum_cores: 200000 },
  buildTime: 14,
  reward: "Unlock prestige specializations"
}
```

**When to Add:** Version 2.0

---

### **10. Prestige Specializations**
**Description:** Choose specialization path when prestiging (mutually exclusive bonuses)

**Examples:**
```
Choose ONE per prestige:

A) Mining Focus
   +100% ore production
   -50% smelting speed

B) Industrial Focus
   +100% smelting/processing speed
   -50% ore production

C) Power Focus
   +200% power generation
   -25% all production

D) Efficiency Focus
   -50% building costs
   No production bonuses

E) Balanced (default)
   +25% everything
```

**When to Add:** Version 2.1
**Unlock:** Corp Level 75 or build Corporate HQ

---

### **11. Leaderboards & Competitions**
**Description:** Optional competitive features

**Types:**
- Speed leaderboard (fastest to prestige #50)
- Efficiency leaderboard (highest production per MW)
- Total production leaderboard (lifetime ore mined)

**Privacy:** Opt-in only, can play fully offline
**When to Add:** Version 2.3
**Monetization:** Free, builds community

---

## 🔧 Technical Enhancements

### **12. Cloud Save Sync**
**Description:** Sync saves across devices

**Features:**
- Google Play Games / Game Center integration
- Manual export/import codes (alphanumeric)
- Conflict resolution (keep newest save)

**When to Add:** Version 1.6
**Monetization:** Free feature (builds retention)

---

### **13. Statistics Dashboard**
**Description:** Deep analytics for optimization nerds

**Metrics:**
- Total resources produced (all-time, per prestige)
- Production efficiency graphs (resources/second over time)
- Building uptime percentages
- Bottleneck history (where you got stuck)
- Prestige comparison (run #5 vs run #10)

**When to Add:** Version 1.7
**Unlock:** Corp Level 25

---

### **14. Advanced Notifications**
**Description:** Smart push notifications (opt-in)

**Examples:**
- "Your generators ran out of coal! (30 min ago)"
- "Production bottleneck detected in iron line"
- "You can prestige now! Est. +450 Corp XP"
- "Offline progress ready: +15K resources"

**When to Add:** Version 1.8
**Privacy:** Completely opt-in, disabled by default

---

### **15. Mod Support / Custom Content**
**Description:** Allow community to create custom buildings, recipes, challenges

**Format:**
```json
{
  "modId": "super-drills-pack",
  "version": "1.0",
  "buildings": [
    {
      "id": "mega_iron_drill",
      "name": "Mega Iron Drill",
      "tier": 2,
      "cost": { "iron_plates": 10000 },
      "recipe": { "outputs": { "iron_ore": 10 } },
      "cycleTime": 0.3
    }
  ]
}
```

**When to Add:** Version 3.0+
**Risk:** Balance issues, requires moderation

---

## 💰 Monetization Ideas (Ethical Only)

### **16. Premium Pass ($2.99 one-time)**
**Benefits:**
- Remove ads (if we add them)
- 2x offline production cap (16 hours vs 8 hours)
- Cloud save sync
- Custom colony colors/icons
- Support development

**NOT Included:** No pay-to-win, no resource packs, no speed boosts

---

### **17. Optional Ads (Rewarded Video)**
**Frequency:** Once per hour max
**Reward:**
- 2x production for 30 minutes
- Small Corp XP boost (+50 XP)
- Instant craft completion (skip 1 queue)

**Implementation:** Completely optional, never forced

---

### **18. Cosmetic DLC Packs**
**Examples:**
- "Neon Industrial" theme ($0.99)
- "Retro Pixel" building sprites ($0.99)
- "Sci-Fi Soundtrack" pack ($1.99)

**When to Add:** Version 2.5+

---

## 🏆 Achievement System Enhancements

### **19. Entertaining & Funny Achievements**
**Description:** Make achievements more engaging with humor, personality, and variety

**Examples of Funny Achievements:**
```
"Oops, All Drills!"
- Own 100 iron drills but no smelters
- Reward: +5% drill efficiency
- Description: "Who needs processed ore anyway?"

"The Accountant"
- Reach exactly 1,337 iron plates (not 1,336 or 1,338)
- Reward: Unlock special calculator building icon
- Description: "Perfectly balanced, as all things should be"

"Energy Crisis Survivor"
- Run out of power 10 times in a single colony
- Reward: +10% generator efficiency
- Description: "You've learned from your mistakes... right?"

"Speed Demon"
- Complete first prestige in under 90 minutes
- Reward: +5% permanent production speed
- Description: "Gotta go fast!"

"Hoarder Extraordinaire"
- Reach 1M of any resource without prestiging
- Reward: ???
- Description: "You like big numbers and you cannot lie"

"Clicker's Remorse"
- Click manually 10,000 times total
- Reward: +50% click power
- Description: "Your poor fingers deserve this"

"The Minimalist"
- Reach prestige using only 3 building types
- Reward: Unlock efficiency specialist badge
- Description: "Less is more, they said"

"Power Overwhelming"
- Generate 10,000 MW power simultaneously
- Reward: Unlock fusion reactor blueprint
- Description: "UNLIMITED POWEEEER!"

"Broke But Happy"
- Prestige with exactly 0 resources remaining
- Reward: +100 Corp XP bonus
- Description: "Perfect timing!"

"Night Owl"
- Play for 6+ hours straight
- Reward: +50% offline production cap
- Description: "Don't forget to sleep!"
```

**Achievement Categories:**
1. **Milestones** - Normal progression (1K ore, 1M ore, etc.)
2. **Challenges** - Specific conditions (speed runs, restrictions)
3. **Silly/Hidden** - Funny discoveries (exact numbers, weird combos)
4. **Mastery** - Skill-based (efficiency, optimization)
5. **Dedication** - Time-based (play 100 hours, 50 prestiges)
6. **Secrets** - Hidden achievements (unlock via experimentation)

**Notification System:**
```
═══════════════════════════════════
    🏆 ACHIEVEMENT UNLOCKED! 🏆
═══════════════════════════════════

     "Oops, All Drills!"

  You own 100 iron drills but no
  smelters. Bold strategy!

  Reward: +5% drill efficiency

[✨ AWESOME! ✨]
═══════════════════════════════════
```

**Features:**
- Big, celebratory popup when earned
- Sound effect + particle animation
- Track progress for multi-step achievements
- "Recently unlocked" tab in achievements menu
- Share achievements (optional social feature)

**Modular Achievement System:**
```typescript
// Achievement condition strategies (extensible)
interface AchievementCondition {
  check(context: GameContext): boolean;
  getProgress(context: GameContext): number;
  getDescription(): string;
}

// Examples of condition types:
class TimePlayedCondition implements AchievementCondition {
  requiredSeconds: number;
  check(ctx) { return ctx.stats.totalPlayTime >= this.requiredSeconds; }
}

class SpecificUpgradeCondition implements AchievementCondition {
  upgradeId: string;
  check(ctx) { return ctx.upgrades[this.upgradeId]?.purchased; }
}

class ResourceAmountCondition implements AchievementCondition {
  resourceId: string;
  amount: BigNumber;
  check(ctx) { return ctx.resources[this.resourceId].amount.gte(this.amount); }
}

class BuildingCountCondition implements AchievementCondition {
  buildingId: string;
  count: number;
  check(ctx) {
    return Object.values(ctx.buildings)
      .filter(b => b.id === this.buildingId)
      .reduce((sum, b) => sum + b.level, 0) >= this.count;
  }
}

class ExactNumberCondition implements AchievementCondition {
  resourceId: string;
  exactAmount: BigNumber;
  check(ctx) {
    return ctx.resources[this.resourceId].amount.eq(this.exactAmount);
  }
}

class CompoundCondition implements AchievementCondition {
  // Combine multiple conditions (AND/OR logic)
  conditions: AchievementCondition[];
  logic: 'AND' | 'OR';
}

class CustomCondition implements AchievementCondition {
  // Custom lambda function for complex logic
  checkFn: (ctx: GameContext) => boolean;
}
```

**Easy to Add New Achievements:**
```typescript
// In achievements.config.ts
new Achievement('oops_all_drills', {
  name: "Oops, All Drills!",
  description: "Own 100 iron drills but no smelters",
  icon: '🔨',
  category: 'silly',
  hidden: true, // Don't show until unlocked
  reward: {
    type: 'multiplier',
    target: { type: 'building', id: 'iron_drill' },
    value: 1.05
  }
}, new CompoundCondition([
  new BuildingCountCondition('iron_drill', 100),
  new BuildingCountCondition('iron_smelter', 0)
], 'AND'))
```

**When to Add:** Version 1.3
**Corp XP Unlock:** Available from start

---

## 🎯 Quality of Life

### **20. Bulk Building Actions**
**Description:** Build/upgrade multiple buildings at once

**Examples:**
- "Build 5x Iron Drill" (batch purchase)
- "Upgrade all Tier 1 buildings" (mass upgrade)
- "Destroy all idle buildings" (cleanup)

**When to Add:** Version 1.3
**Unlock:** Corp Level 18

---

### **21. Building Groups & Tags**
**Description:** Organize buildings into custom groups

**Example:**
```
Group: "Iron Production"
- 5x Iron Drill Mk1
- 3x Iron Smelter
- 2x Constructor

[Upgrade All] [Toggle All] [View Stats]
```

**When to Add:** Version 1.9
**Unlock:** Corp Level 22

---

### **22. Auto-Prestige Mode**
**Description:** Automatically prestige when optimal (for veterans grinding to level 100+)

**Settings:**
- Trigger: When Corp XP gain >X threshold
- Safety: Require confirmation first time
- Stats: Track auto-prestige efficiency

**When to Add:** Version 2.4
**Unlock:** Corp Level 80

---

## 🌳 Skill Tree / Tech Tree Enhancements

### **23. Advanced Node Interactions**
**Description:** Visual and interactive enhancements to the skill/tech tree system

**Features:**

**Zoom & Pan Navigation:**
```typescript
// For large tech trees (50+ nodes)
- Pinch to zoom in/out (mobile)
- Mouse wheel zoom (web)
- Drag to pan around tree
- Minimap in corner (shows current viewport)
- "Fit to screen" button
- "Center on active path" button
```

**Sound Effects:**
```typescript
interface NodeSounds {
  onHover: 'soft_beep.mp3',          // Hovering over node
  onPurchase: 'powerup_success.mp3', // Successfully purchased
  onUnlock: 'unlock_chime.mp3',      // New node becomes available
  onError: 'error_buzz.mp3',         // Can't afford / locked
}
```

**Particle Effects:**
```typescript
// When unlocking a node
class NodeUnlockEffect {
  particles: Particle[];

  playUnlockAnimation() {
    // 1. Node pulses and glows
    // 2. Particles radiate outward (starburst)
    // 3. Connected nodes highlight briefly
    // 4. Fade to normal state
  }
}

// Special effects for major unlocks
class MajorUnlockEffect {
  // Screenwide celebration for tier unlocks
  // Confetti + sound + screen shake
}
```

**Visual Feedback:**
```
Node States:
🔒 Locked (gray, prerequisites not met)
🔓 Available (glowing, can purchase)
✅ Purchased (colored, active)
⭐ Active Path (highlighted, currently boosting)
💎 Rare Node (special glow, major unlock)
```

**Implementation Ideas:**
```typescript
class SkillTreeNode {
  id: string;
  position: { x: number; y: number };
  prerequisites: string[];

  // Visual
  iconUrl: string;
  glowColor: string;
  rarity: 'common' | 'rare' | 'legendary';

  // Sound
  unlockSound: AudioClip;

  // Effects
  unlockParticles: ParticleEffect;
}

class SkillTreeRenderer {
  zoom: number = 1.0;
  panOffset: { x: number; y: number };

  render() {
    // Draw connection lines between nodes
    // Render nodes with current state
    // Apply zoom/pan transforms
    // Highlight active path
  }

  handlePinchZoom(event: TouchEvent) {
    // Mobile zoom logic
  }

  handleMouseWheel(event: WheelEvent) {
    // Desktop zoom logic
  }
}
```

**When to Add:** Version 2.0 (when tech tree becomes large)
**Dependencies:** Requires skill tree system implementation first

---

## 📱 Mobile UX Enhancements

### **24. Advanced Touch Gestures**
**Description:** Make the game feel native and responsive on mobile

**Swipe Gestures for Tab Navigation:**
```typescript
// Swipe left/right to switch tabs
class TabGestureHandler {
  onSwipeLeft() {
    switchToNextTab();
    playSwipeAnimation('left');
  }

  onSwipeRight() {
    switchToPreviousTab();
    playSwipeAnimation('right');
  }
}

// Visual feedback
- Tab content slides smoothly
- Parallax effect during swipe
- Rubber-band bounce at edges
```

**Pull-to-Refresh:**
```typescript
// Pull down on main screen to force refresh data
class PullToRefreshHandler {
  onPullDown(distance: number) {
    if (distance > threshold) {
      showRefreshSpinner();
      forceGameUpdate();
      syncCloudSave(); // If enabled
    }
  }
}

// Visual feedback
- Spinner icon appears while pulling
- Haptic feedback when threshold reached
- Smooth spring animation back
```

**Long-Press for Bulk Actions:**
```typescript
// Long-press a building to access bulk menu
class LongPressHandler {
  onLongPress(buildingId: string) {
    showBulkActionsMenu({
      'Build 5x': () => buildMultiple(buildingId, 5),
      'Build 10x': () => buildMultiple(buildingId, 10),
      'Build Max': () => buildMultiple(buildingId, 'max'),
      'Upgrade All': () => upgradeAll(buildingId),
      'Destroy All': () => destroyAll(buildingId),
    });
  }
}

// Visual feedback
- Gentle vibration on long-press trigger
- Radial menu appears around finger
- Icons + text for each action
```

**Touch-Hold Tooltips:**
```typescript
// Hold finger on item to see detailed tooltip
class TooltipHandler {
  onTouchHold(element: UIElement, duration: number) {
    if (duration > 500ms) {
      showDetailedTooltip(element, {
        position: 'above_finger',
        content: element.getTooltipContent(),
        dismissOnRelease: true
      });
    }
  }
}

// Example tooltip for building
╔════════════════════════════════╗
║    🔨 IRON DRILL MK1           ║
╠════════════════════════════════╣
║ Level: 5                       ║
║ Production: 5 ore/s            ║
║ Power: 50 MW                   ║
║ Uptime: 94%                    ║
║                                ║
║ Next Upgrade:                  ║
║ +1 ore/s                       ║
║ Cost: 500 iron                 ║
╚════════════════════════════════╝
```

**Gesture-Based Shortcuts:**
```typescript
// Two-finger swipe up = Prestige screen
// Two-finger swipe down = Settings
// Three-finger tap = Screenshot (share progress)
// Shake device = Force save (optional, can be annoying)

class GestureShortcuts {
  twoFingerSwipeUp() {
    navigateTo('prestige');
    playHaptic('light');
  }

  twoFingerSwipeDown() {
    navigateTo('settings');
    playHaptic('light');
  }

  threeFingerTap() {
    takeScreenshot();
    showShareMenu();
    playHaptic('medium');
  }
}
```

**Haptic Feedback Library:**
```typescript
enum HapticType {
  Light = 'light',           // UI interactions
  Medium = 'medium',         // Building placed
  Heavy = 'heavy',           // Major action (prestige)
  Success = 'success',       // Achievement unlocked
  Warning = 'warning',       // Low power warning
  Error = 'error',           // Can't afford
}

class HapticFeedback {
  play(type: HapticType) {
    if (navigator.vibrate && userSettings.hapticsEnabled) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
        success: [10, 50, 10],
        warning: [50, 50, 50],
        error: [100],
      };
      navigator.vibrate(patterns[type]);
    }
  }
}
```

**When to Add:** Version 1.4
**Settings:** All gestures toggleable in settings (accessibility)

---

## 🌈 Wild Ideas (Maybe Never)

### **25. Multiplayer Trading**
**Description:** Trade resources with other players' colonies

**Why Interesting:** Creates economy, social features
**Why Scary:** Balance nightmare, exploits, requires servers
**Verdict:** Probably not, but cool concept

---

### **26. Procedurally Generated Planets**
**Description:** Each prestige = different planet with unique resource modifiers

**Example:**
```
Planet Ferrum-7:
+50% iron production
-25% copper production
Special resource: Magnetite
```

**Why Cool:** Infinite variety, replayability
**Why Hard:** Balancing procedural generation is extremely difficult
**Verdict:** Consider for Version 4.0+

---

### **27. Time Manipulation Mechanics**
**Description:** Unlock "time acceleration" or "rewind" for strategic play

**Example:**
- Speed up production for 5 minutes (costs quantum cores)
- Rewind 1 minute if you made a mistake

**Why Interesting:** Adds unique mechanic
**Why Risky:** Can break idle game feel, exploitable
**Verdict:** Test in prototype, might not fit

---

## 📝 How to Use This Document

**When Adding Ideas:**
1. Add to appropriate section
2. Include "Why It's Good" and "Why Deferred"
3. Estimate version number for implementation
4. Note any Corp XP unlock requirements

**When Implementing:**
1. Move idea from this doc to main design doc
2. Create detailed spec in BALANCED_GAME_DESIGN.md
3. Add to IMPLEMENTATION_ROADMAP.md
4. Update this doc's version notes

**Review Cadence:**
- After each major version release
- When gathering community feedback
- During planning sprints

---

**This document ensures no good idea is lost!**
**Last Updated:** 2025-10-21
