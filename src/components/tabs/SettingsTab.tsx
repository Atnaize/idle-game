import { StyleShowcase } from '@components/ui/StyleShowcase';
import { SectionCard } from '@components/ui/SectionCard';
import { StatCard } from '@components/ui/StatCard';

export function SettingsTab() {
  return (
    <div className="pt-4 space-y-4">
      <SectionCard title="Settings" titleIcon="⚙️" glow>
        <p className="text-secondary text-sm mb-4">
          Game configuration and design system showcase
        </p>

        <div className="space-y-3">
          <StatCard
            label="Game Version"
            value="v0.1.0"
            borderColor="blue"
            valueClassName="text-lg font-medium text-white"
          />

          <StatCard
            label="Theme"
            value="DNA Helix"
            sublabel="Sci-fi double helix aesthetic"
            borderColor="blue"
            valueClassName="text-lg font-medium text-white"
          />
        </div>
      </SectionCard>

      <SectionCard title="Design System Showcase" titleIcon="🎨" glowColor="purple">
        <StyleShowcase />
      </SectionCard>
    </div>
  );
}
