import React, { memo, useRef, useEffect, useState } from 'react';
import { SkillNode } from './SkillNode';
import { SkillConnections } from './SkillConnections';
import { SKILL_TREE_LAYOUT, arePrerequisitesMet } from './SkillTreeData';
import './SkillTree.css';

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

interface SkillTreeProps {
  upgrades: Record<string, Upgrade>;
  resources: Record<string, { amount: number }>;
  onPurchaseUpgrade: (id: string) => void;
}

export const SkillTree = memo<SkillTreeProps>(({
  upgrades,
  resources,
  onPurchaseUpgrade,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Memoize particle properties so they don't change on every render
  const particles = useRef(
    Array.from({ length: 20 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 6,
    }))
  ).current;

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const canAffordUpgrade = (upgrade: Upgrade): boolean => {
    return Object.entries(upgrade.baseCost).every(([resourceId, cost]) => {
      const resource = resources[resourceId];
      if (!resource) {
        return false;
      }

      // Calculate actual cost based on level
      const actualCost = cost * Math.pow(upgrade.costMultiplier, upgrade.level);
      return resource.amount >= actualCost;
    });
  };

  const getUpgradeCost = (upgrade: Upgrade): Record<string, number> => {
    const cost: Record<string, number> = {};
    Object.entries(upgrade.baseCost).forEach(([resourceId, baseCost]) => {
      cost[resourceId] = baseCost * Math.pow(upgrade.costMultiplier, upgrade.level);
    });
    return cost;
  };

  return (
    <div className="skill-tree" ref={containerRef}>
      {/* Background effects */}
      <div className="skill-tree__background">
        <div className="skill-tree__grid" />
        <div className="skill-tree__particles">
          {particles.map((particle, i) => (
            <div
              key={i}
              className="skill-tree__particle"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Connection lines */}
      <SkillConnections
        nodes={SKILL_TREE_LAYOUT}
        upgrades={upgrades}
        containerWidth={dimensions.width}
        containerHeight={dimensions.height}
      />

      {/* Skill nodes */}
      <div className="skill-tree__nodes">
        {SKILL_TREE_LAYOUT.map((node) => {
          const upgrade = upgrades[node.id];
          if (!upgrade) {
            return null;
          }

          const prerequisitesMet = arePrerequisitesMet(node.id, upgrades);
          const canAfford = canAffordUpgrade(upgrade);
          const cost = getUpgradeCost(upgrade);

          return (
            <SkillNode
              key={node.id}
              id={node.id}
              name={upgrade.name}
              description={upgrade.description}
              icon={upgrade.icon}
              level={upgrade.level}
              maxLevel={upgrade.maxLevel}
              cost={cost}
              x={node.x}
              y={node.y}
              tier={node.tier}
              category={node.category}
              unlocked={upgrade.unlocked}
              canAfford={canAfford}
              prerequisitesMet={prerequisitesMet}
              purchased={upgrade.purchased}
              onPurchase={() => onPurchaseUpgrade(node.id)}
            />
          );
        })}
      </div>

      {/* DNA helix overlay */}
      <svg className="skill-tree__helix-overlay" width="100%" height="100%">
        <defs>
          <linearGradient id="helix-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
            <stop offset="50%" stopColor="rgba(168, 85, 247, 0.15)" />
            <stop offset="100%" stopColor="rgba(236, 72, 153, 0.1)" />
          </linearGradient>
        </defs>

        {/* Left helix strand */}
        <path
          d={`M ${dimensions.width * 0.15} 0
              Q ${dimensions.width * 0.1} ${dimensions.height * 0.25}, ${dimensions.width * 0.15} ${dimensions.height * 0.5}
              Q ${dimensions.width * 0.2} ${dimensions.height * 0.75}, ${dimensions.width * 0.15} ${dimensions.height}`}
          stroke="url(#helix-gradient)"
          strokeWidth="2"
          fill="none"
          opacity="0.3"
        />

        {/* Right helix strand */}
        <path
          d={`M ${dimensions.width * 0.85} 0
              Q ${dimensions.width * 0.9} ${dimensions.height * 0.25}, ${dimensions.width * 0.85} ${dimensions.height * 0.5}
              Q ${dimensions.width * 0.8} ${dimensions.height * 0.75}, ${dimensions.width * 0.85} ${dimensions.height}`}
          stroke="url(#helix-gradient)"
          strokeWidth="2"
          fill="none"
          opacity="0.3"
        />
      </svg>

    </div>
  );
});

SkillTree.displayName = 'SkillTree';
