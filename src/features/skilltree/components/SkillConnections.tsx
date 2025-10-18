import { memo } from 'react';
import { SKILL_CONNECTIONS, type SkillNodePosition } from '../data/SkillTreeData';

interface SkillConnectionsProps {
  nodes: SkillNodePosition[];
  upgrades: Record<string, { purchased: boolean; level: number; unlocked: boolean }>;
  containerWidth: number;
  containerHeight: number;
}

export const SkillConnections = memo<SkillConnectionsProps>(({
  nodes,
  upgrades,
  containerWidth,
  containerHeight,
}) => {
  const getNodeCoordinates = (nodeId: string): { x: number; y: number } | null => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) {
      return null;
    }

    return {
      x: (node.x / 100) * containerWidth,
      y: (node.y / 100) * containerHeight,
    };
  };

  const getConnectionStatus = (fromId: string, toId: string): 'locked' | 'active' | 'available' => {
    const fromUpgrade = upgrades[fromId];
    const toUpgrade = upgrades[toId];

    if (!fromUpgrade || !toUpgrade) {
      return 'locked';
    }

    // Active: from is purchased and to is unlocked
    if ((fromUpgrade.purchased || fromUpgrade.level > 0) && toUpgrade.unlocked) {
      return 'active';
    }

    // Available: from is purchased
    if (fromUpgrade.purchased || fromUpgrade.level > 0) {
      return 'available';
    }

    return 'locked';
  };

  const renderConnection = (fromId: string, toId: string, type: 'direct' | 'curved', index: number) => {
    const from = getNodeCoordinates(fromId);
    const to = getNodeCoordinates(toId);

    if (!from || !to) {
      return null;
    }

    const status = getConnectionStatus(fromId, toId);

    if (type === 'direct') {
      return (
        <line
          key={`${fromId}-${toId}-${index}`}
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          className={`skill-connection skill-connection--${status}`}
          strokeDasharray={status === 'locked' ? '5,5' : 'none'}
        />
      );
    }

    // Curved connection (Bezier curve for DNA helix effect)
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const controlX = midX + (to.y - from.y) * 0.3; // Offset perpendicular
    const controlY = midY - (to.x - from.x) * 0.3;

    const path = `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;

    return (
      <path
        key={`${fromId}-${toId}-${index}`}
        d={path}
        className={`skill-connection skill-connection--${status}`}
        fill="none"
        strokeDasharray={status === 'locked' ? '5,5' : 'none'}
      />
    );
  };

  return (
    <svg
      className="skill-connections"
      width={containerWidth}
      height={containerHeight}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
    >
      <defs>
        {/* Glow filter for active connections */}
        <filter id="connection-glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Animated gradient for active connections */}
        <linearGradient id="connection-gradient-active" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(16, 185, 129, 0.8)">
            <animate
              attributeName="stop-color"
              values="rgba(16, 185, 129, 0.8); rgba(59, 130, 246, 0.8); rgba(16, 185, 129, 0.8)"
              dur="3s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="50%" stopColor="rgba(59, 130, 246, 0.8)">
            <animate
              attributeName="stop-color"
              values="rgba(59, 130, 246, 0.8); rgba(168, 85, 247, 0.8); rgba(59, 130, 246, 0.8)"
              dur="3s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor="rgba(168, 85, 247, 0.8)">
            <animate
              attributeName="stop-color"
              values="rgba(168, 85, 247, 0.8); rgba(16, 185, 129, 0.8); rgba(168, 85, 247, 0.8)"
              dur="3s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>
      </defs>

      {/* Background DNA helix pattern */}
      <g className="skill-connections__background" opacity="0.1">
        {Array.from({ length: 8 }).map((_, i) => {
          const y = (i / 7) * containerHeight;
          const waveOffset = Math.sin((i / 7) * Math.PI * 2) * 50;
          return (
            <line
              key={`bg-${i}`}
              x1={containerWidth * 0.2 + waveOffset}
              y1={y}
              x2={containerWidth * 0.8 + waveOffset}
              y2={y}
              stroke="rgba(59, 130, 246, 0.3)"
              strokeWidth="1"
            />
          );
        })}
      </g>

      {/* Connection lines */}
      {SKILL_CONNECTIONS.map((connection, index) =>
        renderConnection(connection.from, connection.to, connection.type, index)
      )}
    </svg>
  );
});

SkillConnections.displayName = 'SkillConnections';
