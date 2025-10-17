import { useGameStore } from '@store/gameStore';
import { NumberFormatter } from '@utils/NumberFormatter';
import type { Upgrade } from '@engine/Producer';

interface UpgradeCardProps {
  upgrade: Upgrade;
}

export function UpgradeCard({ upgrade }: UpgradeCardProps) {
  const { engine, purchaseUpgrade } = useGameStore();

  if (!engine) {
    return null;
  }

  const isMaxLevel = upgrade.isMaxLevel();
  const level = upgrade.level;
  const effect = upgrade.getEffect();

  const cost = upgrade.getNextCost();
  const canAfford = Object.entries(cost).every(([resourceId, amount]) => {
    const resource = engine.resources[resourceId];
    return resource && resource.canAfford(amount);
  });

  const handlePurchase = () => {
    purchaseUpgrade(upgrade.id);
  };

  return (
    <div className={`tech-card ${canAfford && !isMaxLevel ? 'tech-card--glow' : ''}`}>
      <div className="tech-card__content p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="text-3xl">{upgrade.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="text-white font-bold">{upgrade.name}</div>
              <span className="hex-badge hex-badge--purple">
                {level}/{upgrade.maxLevel}
              </span>
            </div>
            <div className="text-secondary text-sm">{upgrade.description}</div>
          </div>
        </div>

        {/* Effect */}
        <div className="bg-bg-elevated rounded-lg p-3 mb-3 border border-helix-purple border-opacity-30">
          <div className="text-tertiary text-sm mb-1">Current Effect</div>
          <div className="tech-text-glow--green font-medium">
            {upgrade.effectType === 'multiplier' && `${effect.toFixed(2)}x`}
            {upgrade.effectType === 'additive' && `+${effect.toFixed(0)}`}
            {upgrade.effectType === 'flat' && effect.toFixed(0)}
          </div>
        </div>

        {/* Cost */}
        {!isMaxLevel && (
          <>
            <div className="bg-bg-elevated rounded-lg p-3 mb-3 border border-helix-blue border-opacity-30">
              <div className="text-tertiary text-sm mb-1">Cost</div>
              {Object.entries(cost).map(([resourceId, amount]) => {
                const resource = engine.resources[resourceId];
                const hasEnough = resource && resource.canAfford(amount);
                return (
                  <div
                    key={resourceId}
                    className={`font-medium ${hasEnough ? 'text-white' : 'tech-text-glow--purple opacity-80'}`}
                  >
                    {NumberFormatter.format(amount)} {resource?.name || resourceId}
                  </div>
                );
              })}
            </div>

            {/* Buy Button */}
            <button
              onClick={handlePurchase}
              disabled={!canAfford}
              className={`tech-button w-full py-3 min-h-[44px] ${!canAfford ? 'opacity-50' : ''}`}
            >
              {canAfford ? 'Purchase' : 'Cannot Afford'}
            </button>
          </>
        )}

        {isMaxLevel && (
          <div className="border-2 border-tech-green rounded-lg p-3 text-center tech-text-glow--green font-medium bg-tech-green bg-opacity-10">
            ✓ Maxed Out
          </div>
        )}
      </div>
    </div>
  );
}
