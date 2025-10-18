/**
 * Reusable StatCard Component
 *
 * Displays a label-value pair in a styled card.
 * Used throughout the app for consistent stat display.
 */

import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  sublabel?: ReactNode;
  borderColor?: 'blue' | 'purple' | 'green' | 'amber';
  valueClassName?: string;
}

export function StatCard({
  label,
  value,
  sublabel,
  borderColor = 'blue',
  valueClassName = 'text-2xl font-bold text-white'
}: StatCardProps) {
  const borderColorClass = {
    blue: 'border-helix-blue',
    purple: 'border-helix-purple',
    green: 'border-tech-green',
    amber: 'border-tech-amber',
  }[borderColor];

  return (
    <div className={`bg-bg-elevated rounded-lg p-3 border ${borderColorClass} border-opacity-30`}>
      <div className="text-tertiary text-sm mb-1">{label}</div>
      <div className={valueClassName}>
        {value}
      </div>
      {sublabel && (
        <div className="text-sm text-secondary mt-1">
          {sublabel}
        </div>
      )}
    </div>
  );
}
