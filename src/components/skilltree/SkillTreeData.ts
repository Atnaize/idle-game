/**
 * Skill Tree Visual Layout Configuration
 * Defines positioning and connections for tech tree visualization
 */

export interface SkillNodePosition {
  id: string;
  x: number; // 0-100 (percentage)
  y: number; // 0-100 (percentage)
  tier: number; // Visual tier for styling
  category: 'click' | 'miner' | 'drill' | 'global' | 'prestige';
  prerequisites?: string[]; // IDs of upgrades that must be purchased first
}

/**
 * Visual layout for skill tree
 * DNA helix-inspired layout with branching paths
 */
export const SKILL_TREE_LAYOUT: SkillNodePosition[] = [
  // === CLICK PATH (Left helix strand) ===
  {
    id: 'clickPower1',
    x: 15,
    y: 20,
    tier: 1,
    category: 'click',
  },
  {
    id: 'critChance1',
    x: 10,
    y: 40,
    tier: 2,
    category: 'click',
    prerequisites: ['clickPower1'],
  },
  {
    id: 'critMultiplier1',
    x: 15,
    y: 60,
    tier: 3,
    category: 'click',
    prerequisites: ['critChance1'],
  },

  // === MINER PATH (Center-left) ===
  {
    id: 'minerBoost1',
    x: 35,
    y: 15,
    tier: 1,
    category: 'miner',
  },
  {
    id: 'minerBoost2',
    x: 35,
    y: 35,
    tier: 2,
    category: 'miner',
    prerequisites: ['minerBoost1'],
  },

  // === GLOBAL PATH (Center) ===
  {
    id: 'globalProduction1',
    x: 50,
    y: 45,
    tier: 2,
    category: 'global',
    prerequisites: ['minerBoost2'],
  },
  {
    id: 'globalProduction2',
    x: 50,
    y: 65,
    tier: 3,
    category: 'global',
    prerequisites: ['globalProduction1'],
  },

  // === DRILL PATH (Right helix strand) ===
  {
    id: 'drillEfficiency1',
    x: 70,
    y: 25,
    tier: 2,
    category: 'drill',
  },
  {
    id: 'drillSpeed1',
    x: 75,
    y: 45,
    tier: 3,
    category: 'drill',
    prerequisites: ['drillEfficiency1'],
  },
  {
    id: 'drillDepth1',
    x: 70,
    y: 65,
    tier: 3,
    category: 'drill',
    prerequisites: ['drillSpeed1'],
  },

  // === PRESTIGE PATH (Bottom center) ===
  {
    id: 'prestigeBonus1',
    x: 50,
    y: 85,
    tier: 4,
    category: 'prestige',
    prerequisites: ['globalProduction2', 'drillDepth1'],
  },
];

/**
 * Connection lines between nodes (for visual DNA helix effect)
 */
export interface SkillConnection {
  from: string;
  to: string;
  type: 'direct' | 'curved';
}

export const SKILL_CONNECTIONS: SkillConnection[] = [
  // Click path
  { from: 'clickPower1', to: 'critChance1', type: 'curved' },
  { from: 'critChance1', to: 'critMultiplier1', type: 'curved' },

  // Miner path
  { from: 'minerBoost1', to: 'minerBoost2', type: 'direct' },
  { from: 'minerBoost2', to: 'globalProduction1', type: 'curved' },

  // Global path
  { from: 'globalProduction1', to: 'globalProduction2', type: 'direct' },

  // Drill path
  { from: 'drillEfficiency1', to: 'drillSpeed1', type: 'curved' },
  { from: 'drillSpeed1', to: 'drillDepth1', type: 'curved' },

  // Convergence to prestige
  { from: 'globalProduction2', to: 'prestigeBonus1', type: 'curved' },
  { from: 'drillDepth1', to: 'prestigeBonus1', type: 'curved' },
];

/**
 * Get node position by ID
 */
export const getNodePosition = (id: string): SkillNodePosition | undefined => {
  return SKILL_TREE_LAYOUT.find((node) => node.id === id);
};

/**
 * Get prerequisites for a node
 */
export const getPrerequisites = (id: string): string[] => {
  const node = getNodePosition(id);
  return node?.prerequisites || [];
};

/**
 * Check if all prerequisites are met
 */
export const arePrerequisitesMet = (
  nodeId: string,
  upgrades: Record<string, { purchased: boolean; level: number }>
): boolean => {
  const prerequisites = getPrerequisites(nodeId);
  if (prerequisites.length === 0) {
    return true;
  }

  return prerequisites.every((prereqId) => {
    const upgrade = upgrades[prereqId];
    return upgrade && (upgrade.purchased || upgrade.level > 0);
  });
};
