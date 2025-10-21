# 🗺️ Implementation Roadmap - Automation Imperium

**Purpose:** Step-by-step plan to migrate from current ore-based game to full Automation Imperium.

---

## 🎯 Overall Strategy

**Approach:** Incremental migration, not big-bang rewrite

1. ✅ Build new systems alongside old
2. ✅ Test each component in isolation
3. ✅ Migrate UI gradually
4. ✅ Keep game playable at all times
5. ✅ Deprecate old system only when new is proven

**Timeline:** 10 weeks for full V1.0 release

---

## 📅 Detailed Phase Breakdown

### **WEEK 1: Core Architecture**

#### **Monday-Tuesday: Building Base Class**
**Goal:** Replace `Producer` with `Building` hierarchy

**Tasks:**
- [ ] Create `src/core/engine/Building.ts`
  - Copy `Producer.ts` as starting point
  - Add `powerConsumption` field
  - Add `tier` field
  - Add `isActive` and `currentEfficiency` state
  - Update methods to handle power
- [ ] Update `src/core/types/core.ts`
  - Add `BuildingConfig` interface
  - Add `CraftingJob` interface
  - Add `Recipe` interface
- [ ] Write unit tests
  - Test building creation
  - Test power consumption calculation
  - Test efficiency scaling

**Deliverable:** `Building` base class working, tested

---

#### **Wednesday-Thursday: Extractor Implementation**
**Goal:** Create resource gathering buildings

**Tasks:**
- [ ] Create `src/core/engine/buildings/Extractor.ts`
  - Implement cycle-based production
  - Add progress tracking
  - Handle power efficiency slowdown
- [ ] Create first extractor config
  - Iron Drill Mk1
  - Coal Drill Mk1
- [ ] Write unit tests
  - Test production cycle
  - Test power efficiency impact
  - Test serialization

**Deliverable:** Extractors working, producing resources

---

#### **Friday: Processor Implementation**
**Goal:** Create resource conversion buildings

**Tasks:**
- [ ] Create `src/core/engine/buildings/Processor.ts`
  - Implement recipe system
  - Add crafting queue (5 slots)
  - Handle multi-input recipes
- [ ] Create first processor config
  - Iron Smelter (2 ore → 1 ingot)
  - Constructor (1 ingot → 1 plate)
- [ ] Write unit tests
  - Test recipe crafting
  - Test queue management
  - Test input consumption

**Deliverable:** Processors converting resources correctly

---

### **WEEK 2: Power & Integration**

#### **Monday-Tuesday: Power System**
**Goal:** Global power management

**Tasks:**
- [ ] Create `src/core/engine/PowerManager.ts`
  - Calculate total generation/consumption
  - Implement power ratio calculation
  - Apply efficiency to buildings
- [ ] Create `src/core/engine/buildings/Generator.ts`
  - Implement power output
  - Add fuel consumption
  - Handle active/inactive state
- [ ] Create generator configs
  - Coal Generator Mk1
  - Solar Panel (later unlock)
- [ ] Write unit tests
  - Test power pool calculation
  - Test efficiency distribution
  - Test fuel consumption

**Deliverable:** Power system working, buildings slow down when low power

---

#### **Wednesday-Thursday: GameEngine Integration**
**Goal:** Wire new buildings into game loop

**Tasks:**
- [ ] Update `src/core/engine/GameEngine.ts`
  - Add `buildings: Record<BuildingId, Building>`
  - Add `powerManager: PowerManager`
  - Update `tick()` method:
    1. Update power calculations
    2. Apply efficiency to buildings
    3. Tick all buildings
  - Add `addBuilding()` method
  - Keep old `producers` for now (parallel systems)
- [ ] Update game context
  - Add `buildings` to `GameContext`
  - Add `powerManager` to `GameContext`
- [ ] Test full game loop
  - Create test scenario with 5 buildings
  - Verify production rates
  - Verify power consumption

**Deliverable:** Buildings fully integrated into game engine

---

#### **Friday: Save/Load Migration**
**Goal:** Update save system for new format

**Tasks:**
- [ ] Update `src/core/engine/SaveManager.ts`
  - Add V2.0 save format
  - Implement V1→V2 migration
  - Serialize building states
  - Serialize power stats
- [ ] Add migration logic
  - Convert old `producers` → `buildings` (as extractors)
  - Initialize power system
  - Keep achievements/upgrades
- [ ] Test migration
  - Load old save files
  - Verify data preserved
  - Test round-trip (save → load → save)

**Deliverable:** Save/load working with new format, old saves migrate cleanly

---

### **WEEK 3: Resource Expansion**

#### **Monday: Add New Resources**
**Goal:** Expand beyond just ore

**Tasks:**
- [ ] Create new resource classes
  - `Iron` (rename from Ore)
  - `Coal`
  - `Copper`
  - `Steel`
  - `IronPlate`, `CopperWire`, `Circuit`
- [ ] Update `src/features/resources/config/resources.config.ts`
  - Add 10+ new resources
  - Define colors, icons, descriptions
- [ ] Update UI to show multiple resources
  - Resource list component
  - Individual resource displays

**Deliverable:** 10+ resources in game, displayed correctly

---

#### **Tuesday-Wednesday: Production Chains**
**Goal:** Build iron → ingot → plate chain

**Tasks:**
- [ ] Create building configs in `src/features/buildings/config/`
  - Iron Drill → Iron Ore
  - Coal Drill → Coal
  - Iron Smelter → Iron Ingot (2 ore)
  - Constructor → Iron Plate (1 ingot)
- [ ] Create Assembler class
  - Copy Processor (same behavior)
  - Add to building hierarchy
- [ ] Create first assembler
  - Basic Assembler → Circuit (2 iron plates + 3 copper wire)
- [ ] Test full chain
  - Place 1 of each building
  - Verify resources flow correctly
  - Check production rates

**Deliverable:** Iron production chain working (drill → smelt → construct)

---

#### **Thursday-Friday: Copper & Steel Chains**
**Goal:** Add complexity with multiple resources

**Tasks:**
- [ ] Add copper production chain
  - Copper Drill → Copper Ore
  - Copper Smelter → Copper Ingot
  - Wire Mill → Copper Wire
- [ ] Add steel production chain
  - Steel Furnace (3 iron + 1 coal → steel ingot)
  - Heavy Press → Steel Plate
- [ ] Test multi-resource production
  - Build both chains
  - Verify no conflicts
  - Check power consumption

**Deliverable:** 3 production chains working (iron, copper, steel)

---

### **WEEK 4: UI Implementation**

#### **Monday-Tuesday: Buildings UI**
**Goal:** Replace producer UI with building UI

**Tasks:**
- [ ] Create `src/features/buildings/components/BuildingList.tsx`
  - List all buildings by type
  - Show production rates
  - Show power consumption
- [ ] Create `src/features/buildings/components/BuildingCard.tsx`
  - Individual building display
  - Progress bar for crafting
  - Queue status
- [ ] Create `src/features/buildings/components/BuildingDetail.tsx`
  - Detailed view when tapped
  - Show recipe
  - Show stats (uptime, total crafted)
  - Upgrade buttons

**Deliverable:** Buildings UI working, can view all buildings

---

#### **Wednesday: Power UI**
**Goal:** Display power stats clearly

**Tasks:**
- [ ] Create `src/features/buildings/components/PowerDisplay.tsx`
  - Show total generation / consumption
  - Show power ratio (visual bar)
  - Warning when low power
- [ ] Add power display to main dashboard
  - Always visible at top
  - Color-coded (green/yellow/red)
- [ ] Add power info to building cards
  - Show individual consumption
  - Show if building is slowed by power

**Deliverable:** Power stats visible and understandable

---

#### **Thursday-Friday: Production Chain Visualization**
**Goal:** Help players understand production flow

**Tasks:**
- [ ] Create `src/features/buildings/components/ProductionChain.tsx`
  - Visual tree of buildings
  - Show resource flow (arrows)
  - Highlight bottlenecks
- [ ] Add bottleneck detection
  - Identify slowest building in chain
  - Show warning icon
  - Suggest fix ("Build 2 more smelters")
- [ ] Polish UI
  - Animations for crafting progress
  - Smooth transitions
  - Touch-friendly sizing

**Deliverable:** Production chain UI complete, intuitive

---

### **WEEK 5: Prestige System**

#### **Monday-Tuesday: Corporation XP**
**Goal:** Implement prestige currency

**Tasks:**
- [ ] Update `GameEngine` with corp progression
  - Add `corporationXP: number`
  - Add `corporationLevel: number`
  - Add `totalPrestiges: number`
- [ ] Implement XP calculation
  - Track tier 4/5 components produced
  - Calculate XP on prestige trigger
  - Formula from BALANCED_GAME_DESIGN.md
- [ ] Track production stats
  - Total components per tier
  - Unique production chains completed
  - Time played this run

**Deliverable:** Corp XP calculation working

---

#### **Wednesday-Thursday: Prestige Bonuses**
**Goal:** Define and apply corp level bonuses

**Tasks:**
- [ ] Create `src/features/prestige/config/corpLevels.config.ts`
  - Define bonuses for levels 1-60
  - Production speed, cost reduction, unlocks
- [ ] Implement bonus application
  - Apply bonuses on game start
  - Update building stats with bonuses
  - Show bonuses in UI
- [ ] Create prestige UI
  - Update `PrestigeTab.tsx`
  - Show Corp XP earned
  - Show new level
  - Show unlocked bonuses
  - Big "LAUNCH COLONY SHIP" button

**Deliverable:** Prestige bonuses applied, visible in UI

---

#### **Friday: Prestige Reset Logic**
**Goal:** Full prestige cycle working

**Tasks:**
- [ ] Implement reset logic in GameEngine
  - Reset all resources to 0
  - Destroy all buildings
  - Keep Corp XP, level, achievements
- [ ] Add starting bonuses
  - Give starter resources based on level
  - Pre-build starter buildings (if level high enough)
- [ ] Test full prestige cycle
  - Play for 30 min
  - Prestige
  - Verify bonuses applied
  - Verify faster progression

**Deliverable:** Full prestige loop working

---

### **WEEK 6: Content Expansion**

#### **Monday-Tuesday: More Buildings**
**Goal:** Add 10+ more building types

**Tasks:**
- [ ] Add Tier 2 buildings
  - Copper buildings (drill, smelter, wire mill)
  - Stone Quarry
  - Water Pump
- [ ] Add Tier 3 buildings
  - Oil Pump
  - Refinery (oil → plastic)
  - Chemical Plant (oil → rubber)
  - Battery Plant
- [ ] Add Tier 4 buildings
  - Fabrication Plant (circuits + plastic → computer)
  - Heavy Foundry (steel + rods → frame)
  - Core Assembly (circuits + batteries → power core)
- [ ] Test all buildings
  - Verify recipes work
  - Check balance (production rates)

**Deliverable:** 20+ buildings in game, all working

---

#### **Wednesday-Thursday: Achievements**
**Goal:** Expand achievement system

**Tasks:**
- [ ] Create new achievement strategies
  - `ProductionRateStrategy` (reach X/s production)
  - `PowerGenerationStrategy` (reach X MW power)
  - `BuildingCountStrategy` (own X buildings)
- [ ] Add 20+ new achievements
  - Resource milestones (1K iron, 1M iron, etc.)
  - Building milestones (10 drills, 100 drills)
  - Production milestones (100/s production)
  - Prestige milestones (reach level 10, level 25)
- [ ] Test achievement triggers
  - Verify conditions work
  - Check rewards applied

**Deliverable:** 25+ achievements, rewarding progress

---

#### **Friday: Upgrades**
**Goal:** Adapt upgrade system to new buildings

**Tasks:**
- [ ] Create building-specific upgrades
  - Efficiency (reduce cycle time)
  - Output (increase output amount)
  - Power efficiency (reduce consumption)
- [ ] Add global upgrades
  - All buildings +X% production
  - All buildings -X% cost
  - Power generation +X%
- [ ] Update upgrade UI
  - Show building-specific upgrades in detail view
  - Show global upgrades in separate tab
- [ ] Test upgrades
  - Verify effects apply correctly
  - Check cost scaling

**Deliverable:** Upgrade system working with new buildings

---

### **WEEK 7: Balance & Polish**

#### **Monday-Tuesday: Playtesting**
**Goal:** Play full prestige cycles, gather data

**Tasks:**
- [ ] Playtest Session 1 (Fresh start)
  - Play for 3 hours
  - Track time to milestones
  - Note frustrations/confusion
- [ ] Playtest Session 2 (After prestige)
  - Verify bonuses feel good
  - Check progression speed
- [ ] Playtest Session 3 (High level)
  - Fast-forward to Corp Level 20
  - Test late-game buildings
  - Check balance

**Deliverable:** Playtest notes, balance issues identified

---

#### **Wednesday-Thursday: Balance Tuning**
**Goal:** Adjust numbers based on playtesting

**Tasks:**
- [ ] Tune production rates
  - Adjust cycle times
  - Adjust output amounts
  - Goal: 2-3 hour first prestige
- [ ] Tune costs
  - Adjust building costs
  - Adjust upgrade costs
  - Goal: Smooth progression curve
- [ ] Tune Corp XP
  - Adjust XP formula
  - Goal: Level 10 after 5 prestiges
- [ ] Re-test after changes
  - Quick playtest
  - Verify improvements

**Deliverable:** Balanced game, smooth progression

---

#### **Friday: Visual Polish**
**Goal:** Make it feel great

**Tasks:**
- [ ] Add animations
  - Building crafting progress bars
  - Resource count-up animations
  - Prestige screen confetti
- [ ] Add sound effects
  - Building placed (thunk)
  - Resource produced (ding)
  - Prestige (fanfare)
  - Power warning (buzz)
- [ ] Polish UI
  - Smooth transitions
  - Better icons
  - Consistent spacing
  - Mobile-friendly tap targets

**Deliverable:** Game feels polished, satisfying to play

---

### **WEEK 8: Tutorial & Onboarding**

#### **Monday-Wednesday: Tutorial System**
**Goal:** Teach players the loop

**Tasks:**
- [ ] Create tutorial system
  - Step-by-step guide
  - Highlight UI elements
  - Force actions (can't proceed until done)
- [ ] Design tutorial flow
  1. "Tap to gather iron ore" (20 taps)
  2. "Build your first Iron Drill" (auto-give resources)
  3. "Wait for drill to produce" (5 seconds)
  4. "Build a Smelter" (teach recipes)
  5. "Build a Constructor" (teach chains)
  6. "Build a Coal Drill" (multiple extractors)
  7. "Build a Generator" (teach power)
  8. "Build a Basic Assembler" (multi-input recipes)
  9. "You're ready! Good luck!" (end tutorial)
- [ ] Implement tutorial
  - Create tutorial component
  - Add tooltips/highlights
  - Track tutorial progress
- [ ] Test tutorial
  - Give to non-gamer friend
  - Watch them play
  - Note confusion points

**Deliverable:** Tutorial working, teaches core loop

---

#### **Thursday-Friday: Help & Documentation**
**Goal:** In-game help for confused players

**Tasks:**
- [ ] Create help screen
  - Explain resources
  - Explain buildings
  - Explain power
  - Explain prestige
- [ ] Add contextual tooltips
  - Tap "?" icon for help
  - Explain each building type
  - Explain production chains
- [ ] Add prestige explainer
  - Show before first prestige
  - "Don't worry, you'll be stronger!"
  - Show what you keep vs lose
- [ ] Test with fresh players
  - Can they figure it out?
  - What's still confusing?

**Deliverable:** Players understand game without external help

---

### **WEEK 9: Late-Game Content**

#### **Monday-Tuesday: Tier 5 Buildings**
**Goal:** Content for Corp Level 30+

**Tasks:**
- [ ] Add Tier 5 buildings
  - Quantum Fabricator (quantum processors)
  - Nuclear Reactor (1000 MW power)
  - Advanced Foundry (complex components)
- [ ] Add late-game resources
  - Quantum Ore (rare, high-tier)
  - Uranium (fuel for nuclear)
  - Exotic Matter (prestige 30+ only)
- [ ] Test late-game progression
  - Fast-forward to level 40
  - Verify buildings unlock correctly
  - Check balance

**Deliverable:** Late-game content (level 30-50) complete

---

#### **Wednesday-Thursday: Corp Levels 31-60**
**Goal:** Define all prestige bonuses

**Tasks:**
- [ ] Complete corp level config
  - Define bonuses for levels 31-60
  - Include major unlocks (buildings, features)
  - Balance XP requirements
- [ ] Add level-up celebrations
  - Animation when leveling up
  - Show new bonus unlocked
  - Exciting visual feedback
- [ ] Add meta-progression UI
  - Show progress to next level
  - Show all bonuses earned so far
  - Show roadmap to level 50

**Deliverable:** Full 1-60 progression defined

---

#### **Friday: New Horizons Placeholder**
**Goal:** Implement V1.0 endgame popup

**Tasks:**
- [ ] Create New Horizons unlock modal
  - Triggers at Corp Level 50
  - Congratulatory message
  - "Coming in V2.0!" text
  - Particle effects
- [ ] Add New Horizons tracking
  - Show progress toward level 50
  - Show "??? Locked" in UI
  - Build anticipation
- [ ] Test endgame feeling
  - Does reaching 50 feel epic?
  - Is there content beyond 50? (yes, to level 60)

**Deliverable:** New Horizons teaser working

---

### **WEEK 10: Final Polish & Launch**

#### **Monday-Tuesday: Performance Optimization**
**Goal:** 60 FPS on mobile

**Tasks:**
- [ ] Profile game performance
  - Use Chrome DevTools
  - Identify slow tick operations
  - Check memory usage
- [ ] Optimize hot paths
  - Cache production rate calculations
  - Batch building updates
  - Use object pools for CraftingJob
- [ ] Test on real devices
  - Android (mid-range phone)
  - iOS (iPhone 11+)
  - Verify 60 FPS with 100+ buildings

**Deliverable:** Smooth performance on mobile

---

#### **Wednesday: Bug Fixes**
**Goal:** Squash all known bugs

**Tasks:**
- [ ] Go through bug list
  - Prioritize critical bugs
  - Fix UI glitches
  - Fix save/load issues
  - Fix calculation errors
- [ ] Regression testing
  - Test all features
  - Verify nothing broke
- [ ] Edge case testing
  - What if player has 0 power?
  - What if player prestiges immediately?
  - What if player loads old save?

**Deliverable:** Zero critical bugs

---

#### **Thursday: Final Playtest**
**Goal:** Full game playthrough

**Tasks:**
- [ ] Fresh playtest (no debug tools)
  - Play for 6 hours
  - Reach first prestige
  - Continue to prestige 3-5
  - Note any issues
- [ ] High-level playtest
  - Fast-forward to level 30
  - Test late-game content
  - Verify progression feels good
- [ ] Mobile playtest
  - Play on actual phone
  - Check UI responsiveness
  - Verify offline progress

**Deliverable:** Game is ready for launch

---

#### **Friday: Launch Prep**
**Goal:** Prepare for release

**Tasks:**
- [ ] Write release notes
  - Feature list
  - Known issues (if any)
  - Credits
- [ ] Prepare store assets
  - Screenshots
  - App icon
  - Description
- [ ] Set up analytics (optional)
  - Track retention
  - Track prestige rate
  - Track Corp level distribution
- [ ] Deploy to web
  - Build production bundle
  - Deploy to hosting
  - Test deployed version
- [ ] 🚀 **LAUNCH!** 🚀

**Deliverable:** Automation Imperium V1.0 LIVE

---

## 📊 Progress Tracking

### **Milestones**

| Week | Milestone | Status |
|------|-----------|--------|
| 1 | Core architecture complete | ⬜ Not started |
| 2 | Power system working | ⬜ Not started |
| 3 | Production chains functional | ⬜ Not started |
| 4 | UI complete | ⬜ Not started |
| 5 | Prestige loop working | ⬜ Not started |
| 6 | Content expansion done | ⬜ Not started |
| 7 | Game balanced | ⬜ Not started |
| 8 | Tutorial complete | ⬜ Not started |
| 9 | Late-game content done | ⬜ Not started |
| 10 | **LAUNCH** | ⬜ Not started |

### **Success Metrics**

**Technical:**
- [ ] 60 FPS on mobile with 100+ buildings
- [ ] Save/load working 100% reliably
- [ ] Zero critical bugs
- [ ] Offline progress accurate

**Gameplay:**
- [ ] First prestige: 2-3 hours
- [ ] Tutorial completion: 90%+ new players
- [ ] Prestige feels rewarding (playtester feedback)
- [ ] Progression curve smooth (no walls except intended prestige)

**Retention (Post-Launch):**
- [ ] Day 1: 60%+ retention
- [ ] Day 7: 30%+ retention
- [ ] Day 30: 10%+ retention

---

## 🚨 Risk Mitigation

### **Risk 1: Too Complex for New Players**
**Mitigation:**
- Comprehensive tutorial (Week 8)
- Gradual unlock of features
- In-game help tooltips
- Prestige explainer before first prestige

### **Risk 2: Performance Issues**
**Mitigation:**
- Profile early and often
- Set 60 FPS target from Week 1
- Test on real devices (Week 10)
- Optimize hot paths (tick loop, rendering)

### **Risk 3: Balance Issues**
**Mitigation:**
- Playtest every week starting Week 7
- Track time-to-milestones
- Adjust numbers iteratively
- Community beta test (optional)

### **Risk 4: Save File Corruption**
**Mitigation:**
- Extensive save/load testing
- Migration tests from old format
- Backup save files (auto-backup every prestige)
- Export/import feature for manual backup

### **Risk 5: Scope Creep**
**Mitigation:**
- Stick to roadmap
- Defer features to V1.1, V2.0 (use IDEAS_FOR_LATER.md)
- Time-box each week strictly
- Cut features if behind schedule

---

## 📝 Weekly Checklist Template

Use this for each week:

```markdown
## Week X: [Phase Name]

### Goals
- [ ] Goal 1
- [ ] Goal 2
- [ ] Goal 3

### Daily Tasks
**Monday:**
- [ ] Task 1
- [ ] Task 2

**Tuesday:**
- [ ] Task 1
- [ ] Task 2

**Wednesday:**
- [ ] Task 1
- [ ] Task 2

**Thursday:**
- [ ] Task 1
- [ ] Task 2

**Friday:**
- [ ] Task 1
- [ ] Task 2
- [ ] Week review & retrospective

### Deliverables
- [ ] Deliverable 1
- [ ] Deliverable 2

### Blockers
- None / [List any issues]

### Notes
[Any additional notes, learnings, or adjustments]
```

---

## 🎉 Post-Launch Roadmap

### **V1.1 - Quality of Life (Week 11-12)**
- Cloud save sync
- Statistics dashboard
- Bulk building actions
- Building groups/tags

### **V1.2 - Content Update (Week 13-14)**
- 10 new buildings
- 20 new achievements
- Corp Levels 61-80
- New production chains

### **V2.0 - New Horizons (Month 3-4)**
- Permanent mega-colony
- Quantum Cores currency
- 3 Mega Projects
- Weekly challenges
- Leaderboards

---

**This roadmap is your guide to shipping Automation Imperium V1.0!**
**Update status weekly. Adjust as needed. Ship amazing game. 🚀**

**Last Updated:** 2025-10-21
