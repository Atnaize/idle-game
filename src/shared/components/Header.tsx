import { useGameStore } from '@core/store';
import { NumberFormatter } from '@core/utils';
import { SettingsMenu } from './SettingsMenu';

export function Header() {
  const { engine } = useGameStore();

  if (!engine?.prestige) {
    return null;
  }

  const prestigePoints = engine.prestige.prestigePoints;
  const prestigeMultiplier = engine.prestige.getMultiplier();

  return (
    <header className="sticky top-0 tech-hud px-4 py-4 shadow-glow-blue z-40 border-b-2 border-helix-blue pattern-tech-corners">
      {/* Subtle DNA helix pattern background */}
      <div className="pattern-dna-helix absolute inset-0 opacity-30"></div>

      <div className="flex items-center justify-between max-w-lg mx-auto relative z-10">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            ⛏️ Idle Miner
          </h1>
          <p className="text-xs text-secondary">Tap to mine!</p>
        </div>

        <div className="flex items-center gap-3">
          {prestigePoints.gt(0) && (
            <div className="text-right bg-helix-purple bg-opacity-20 rounded-lg px-3 py-1 border-2 border-helix-purple shadow-glow-purple backdrop-blur-sm hex-badge--purple">
              <div className="text-base font-bold tech-text-glow--purple">
                {NumberFormatter.format(prestigePoints, 0)} PP
              </div>
              <div className="text-xs opacity-80">
                {prestigeMultiplier.toNumber().toFixed(2)}x boost
              </div>
            </div>
          )}

          <SettingsMenu />
        </div>
      </div>
    </header>
  );
}
