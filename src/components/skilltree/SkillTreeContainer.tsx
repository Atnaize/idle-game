import { memo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { SkillTree } from './SkillTree';
import { NumberFormatter } from '@utils/NumberFormatter';

interface Upgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  maxLevel: number;
  baseCost: Record<string, number>;
  costMultiplier: number;
  unlocked: boolean;
  purchased: boolean;
}

/**
 * Container component that connects SkillTree to the game store
 */
export const SkillTreeContainer = memo(() => {
  const engine = useGameStore((state) => state.engine);
  const purchaseUpgrade = useGameStore((state) => state.purchaseUpgrade);
  useGameStore((state) => state.tick); // Force re-render on tick

  if (!engine) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '600px',
        color: '#b0c4de',
      }}>
        Loading skill tree...
      </div>
    );
  }

  // Transform engine data to SkillTree format
  const upgrades: Record<string, Upgrade> = {};

  // Access upgrades directly from engine.upgrades (it's a Record)
  Object.values(engine.upgrades).forEach((upgrade) => {
    upgrades[upgrade.id] = {
      id: upgrade.id,
      name: upgrade.name,
      description: upgrade.description,
      icon: upgrade.icon,
      level: upgrade.level,
      maxLevel: upgrade.maxLevel,
      baseCost: NumberFormatter.costToNumbers(upgrade.baseCost),
      costMultiplier: upgrade.costMultiplier,
      unlocked: upgrade.unlocked,
      purchased: upgrade.purchased,
    };
  });

  // Get resources directly from engine.resources
  const resources: Record<string, { amount: number }> = {};

  Object.values(engine.resources).forEach((resource) => {
    resources[resource.id] = {
      amount: resource.amount.toNumber(),
    };
  });

  const handlePurchaseUpgrade = (id: string): void => {
    purchaseUpgrade(id);
  };

  return (
    <SkillTree
      upgrades={upgrades}
      resources={resources}
      onPurchaseUpgrade={handlePurchaseUpgrade}
    />
  );
});

SkillTreeContainer.displayName = 'SkillTreeContainer';
