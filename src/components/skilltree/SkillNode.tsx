import React, { memo } from 'react';
import './SkillNode.css';

export interface SkillNodeProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  maxLevel: number;
  cost: Record<string, number>;
  x: number;
  y: number;
  tier: number;
  category: 'click' | 'miner' | 'drill' | 'global' | 'prestige';
  unlocked: boolean;
  canAfford: boolean;
  prerequisitesMet: boolean;
  purchased: boolean;
  onPurchase: () => void;
}

export const SkillNode = memo<SkillNodeProps>(({
  id,
  name,
  description,
  icon,
  level,
  maxLevel,
  cost,
  x,
  y,
  tier,
  category,
  unlocked,
  canAfford,
  prerequisitesMet,
  purchased,
  onPurchase,
}) => {
  const isMaxed = level >= maxLevel;
  const isLocked = !prerequisitesMet;
  const isAvailable = unlocked && prerequisitesMet && !isMaxed;

  // Smart tooltip positioning based on node location
  const isTopNode = y < 30; // Top 30% - show tooltip below
  const isLeftEdge = x < 20; // Left 20% - show tooltip to the right
  const isRightEdge = x > 80; // Right 20% - show tooltip to the left

  const getStatusClass = (): string => {
    if (isLocked) {
      return 'locked';
    }

    if (isMaxed) {
      return 'maxed';
    }

    if (!canAfford) {
      return 'unavailable';
    }

    return 'available';
  };

  const getCostString = (): string => {
    const entries = Object.entries(cost);
    if (entries.length === 0) {
      return '';
    }

    return entries
      .map(([resource, amount]) => {
        if (amount >= 1000000) {
          return `${(amount / 1000000).toFixed(1)}M`;
        }

        if (amount >= 1000) {
          return `${(amount / 1000).toFixed(1)}K`;
        }

        return amount.toString();
      })
      .join(' / ');
  };

  const handleClick = (): void => {
    if (isAvailable && canAfford) {
      onPurchase();
    }
  };

  // Build tooltip position classes
  const tooltipClasses = [
    isTopNode ? 'skill-node--tooltip-bottom' : '',
    isLeftEdge ? 'skill-node--tooltip-right' : '',
    isRightEdge ? 'skill-node--tooltip-left' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={`skill-node skill-node--${category} skill-node--tier-${tier} skill-node--${getStatusClass()} ${tooltipClasses}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
      onClick={handleClick}
      role="button"
      tabIndex={isAvailable ? 0 : -1}
      aria-label={`${name}: ${description}`}
      aria-disabled={!isAvailable || !canAfford}
    >
      {/* Hexagonal Border */}
      <div className="skill-node__border">
        <svg viewBox="0 0 100 100" className="skill-node__hexagon">
          <polygon
            points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5"
            className="skill-node__hexagon-fill"
          />
          <polygon
            points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5"
            className="skill-node__hexagon-stroke"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="skill-node__content">
        <div className="skill-node__icon">{icon}</div>
        {level > 0 && (
          <div className="skill-node__level">
            {level}/{maxLevel}
          </div>
        )}
      </div>

      {/* Glow Effect */}
      {!isLocked && <div className="skill-node__glow" />}

      {/* Particle Effect for Available Nodes */}
      {isAvailable && canAfford && (
        <>
          <div className="skill-node__particle skill-node__particle--1" />
          <div className="skill-node__particle skill-node__particle--2" />
          <div className="skill-node__particle skill-node__particle--3" />
        </>
      )}

      {/* Tooltip */}
      <div className="skill-node__tooltip">
        <div className="skill-node__tooltip-header">
          <span className="skill-node__tooltip-icon">{icon}</span>
          <span className="skill-node__tooltip-name">{name}</span>
        </div>
        <div className="skill-node__tooltip-description">{description}</div>
        {!isMaxed && (
          <div className="skill-node__tooltip-cost">
            <span className="skill-node__tooltip-cost-label">Cost:</span>
            <span className="skill-node__tooltip-cost-value">{getCostString()}</span>
          </div>
        )}
        {level > 0 && (
          <div className="skill-node__tooltip-progress">
            Level: {level}/{maxLevel}
          </div>
        )}
        {isLocked && (
          <div className="skill-node__tooltip-locked">
            ⚠️ Prerequisites not met
          </div>
        )}
        {isMaxed && (
          <div className="skill-node__tooltip-maxed">
            ✅ Maxed Out
          </div>
        )}
      </div>
    </div>
  );
});

SkillNode.displayName = 'SkillNode';
