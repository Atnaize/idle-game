/**
 * Reusable SectionCard Component
 *
 * A tech-themed card with optional glow and title.
 * Used for grouping related content.
 */

import { ReactNode } from 'react';

interface SectionCardProps {
  title?: string;
  titleIcon?: string;
  children: ReactNode;
  glow?: boolean;
  glowColor?: 'blue' | 'purple' | 'green';
}

export function SectionCard({
  title,
  titleIcon,
  children,
  glow = false,
  glowColor = 'blue'
}: SectionCardProps) {
  const glowClass = glow ? 'tech-card--glow' : '';
  const borderClass = {
    blue: 'border-helix-blue',
    purple: 'border-helix-purple',
    green: 'border-tech-green',
  }[glowColor];

  return (
    <div className={`tech-card ${glowClass} ${glow ? borderClass : ''}`}>
      <div className="tech-card__content p-6">
        {title && (
          <h2 className={`text-2xl font-bold text-white mb-4 ${glow ? `tech-text-glow--${glowColor}` : ''}`}>
            {titleIcon && <span className="mr-2">{titleIcon}</span>}
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
