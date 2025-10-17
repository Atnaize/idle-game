/**
 * Skill Tree Visual Layout Configuration
 * Defines positioning and connections for tech tree visualization
 */

import { CLICK_UPGRADES, UPGRADES } from '@/config';

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
    id: CLICK_UPGRADES.CLICK_POWER_1,
    x: 15,
    y: 20,
    tier: 1,
    category: 'click',
  },
  {
    id: CLICK_UPGRADES.CRIT_CHANCE_1,
    x: 10,
    y: 40,
    tier: 2,
    category: 'click',
    prerequisites: [CLICK_UPGRADES.CLICK_POWER_1],
  },
  {
    id: CLICK_UPGRADES.CRIT_MULTIPLIER_1,
    x: 15,
    y: 60,
    tier: 3,
    category: 'click',
    prerequisites: [CLICK_UPGRADES.CRIT_CHANCE_1],
  },

  // === MINER PATH (Center-left) ===
  {
    id: UPGRADES.MINER_BOOST_1,
    x: 35,
    y: 15,
    tier: 1,
    category: 'miner',
  },
  {
    id: UPGRADES.MINER_BOOST_2,
    x: 35,
    y: 35,
    tier: 2,
    category: 'miner',
    prerequisites: [UPGRADES.MINER_BOOST_1],
  },

  // === GLOBAL PATH (Center) ===
  {
    id: UPGRADES.GLOBAL_PRODUCTION_1,
    x: 50,
    y: 45,
    tier: 2,
    category: 'global',
    prerequisites: [UPGRADES.MINER_BOOST_2],
  },
  {
    id: UPGRADES.GLOBAL_PRODUCTION_2,
    x: 50,
    y: 65,
    tier: 3,
    category: 'global',
    prerequisites: [UPGRADES.GLOBAL_PRODUCTION_1],
  },

  // === DRILL PATH (Right helix strand) ===
  {
    id: UPGRADES.DRILL_EFFICIENCY_1,
    x: 70,
    y: 25,
    tier: 2,
    category: 'drill',
  },
  {
    id: UPGRADES.DRILL_SPEED_1,
    x: 75,
    y: 45,
    tier: 3,
    category: 'drill',
    prerequisites: [UPGRADES.DRILL_EFFICIENCY_1],
  },
  {
    id: UPGRADES.DRILL_DEPTH_1,
    x: 70,
    y: 65,
    tier: 3,
    category: 'drill',
    prerequisites: [UPGRADES.DRILL_SPEED_1],
  },

  // === PRESTIGE PATH (Bottom center) ===
  {
    id: UPGRADES.PRESTIGE_BONUS_1,
    x: 50,
    y: 85,
    tier: 4,
    category: 'prestige',
    prerequisites: [UPGRADES.GLOBAL_PRODUCTION_2, UPGRADES.DRILL_DEPTH_1],
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
  { from: CLICK_UPGRADES.CLICK_POWER_1, to: CLICK_UPGRADES.CRIT_CHANCE_1, type: 'curved' },
  { from: CLICK_UPGRADES.CRIT_CHANCE_1, to: CLICK_UPGRADES.CRIT_MULTIPLIER_1, type: 'curved' },

  // Miner path
  { from: UPGRADES.MINER_BOOST_1, to: UPGRADES.MINER_BOOST_2, type: 'direct' },
  { from: UPGRADES.MINER_BOOST_2, to: UPGRADES.GLOBAL_PRODUCTION_1, type: 'curved' },

  // Global path
  { from: UPGRADES.GLOBAL_PRODUCTION_1, to: UPGRADES.GLOBAL_PRODUCTION_2, type: 'direct' },

  // Drill path
  { from: UPGRADES.DRILL_EFFICIENCY_1, to: UPGRADES.DRILL_SPEED_1, type: 'curved' },
  { from: UPGRADES.DRILL_SPEED_1, to: UPGRADES.DRILL_DEPTH_1, type: 'curved' },

  // Convergence to prestige
  { from: UPGRADES.GLOBAL_PRODUCTION_2, to: UPGRADES.PRESTIGE_BONUS_1, type: 'curved' },
  { from: UPGRADES.DRILL_DEPTH_1, to: UPGRADES.PRESTIGE_BONUS_1, type: 'curved' },
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
