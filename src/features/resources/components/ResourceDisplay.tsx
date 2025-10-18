import { useGameStore } from '@core/store';
import { NumberFormatter } from '@core/utils';

export function ResourceDisplay() {
  const { engine } = useGameStore();

  if (!engine) {
    return null;
  }

  const resources = Object.values(engine.resources).filter((r) => r.unlocked);

  if (resources.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-[73px] tech-hud px-4 py-3 shadow-glow-blue z-[45] border-b-2 border-helix-blue">
      {/* Grid pattern background */}
      <div className="pattern-grid absolute inset-0 opacity-20"></div>

      <div className="relative z-10">
        {resources.map((resource) => {
          const amount = resource.amount;
          const maxAmount = resource.maxAmount;
          const percentFull = maxAmount ? resource.getPercentFull().toNumber() : 0;
          const isFull = percentFull >= 100;

          return (
            <div key={resource.id} className="mb-2 last:mb-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {/* Hexagonal icon frame */}
                  <div className="relative">
                    <span className="text-2xl">{resource.icon}</span>
                    {isFull && (
                      <div
                        key={`${resource.id}-full-indicator`}
                        className="absolute -top-1 -right-1 w-3 h-3 bg-tech-amber rounded-full"
                        style={{ animation: 'pulse 2s ease-in-out infinite' }}
                      ></div>
                    )}
                  </div>
                  <span className="text-white font-medium">{resource.name}</span>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${isFull ? 'tech-text-glow--blue' : 'text-white'}`}>
                    {NumberFormatter.format(amount)}
                  </div>
                  {maxAmount && (
                    <div className="text-xs text-tertiary">
                      / {NumberFormatter.format(maxAmount)}
                    </div>
                  )}
                </div>
              </div>

              {maxAmount && (
                <div className="tech-progress">
                  <div
                    className="tech-progress__fill"
                    style={{ width: `${Math.min(percentFull, 100)}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
