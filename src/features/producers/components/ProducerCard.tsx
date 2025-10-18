import { useGameStore } from '@core/store';
import { NumberFormatter } from '@core/utils';
import { TouchButton } from '@shared/components';
import type { Producer } from '@core/engine';

interface ProducerCardProps {
  producer: Producer;
}

export function ProducerCard({ producer }: ProducerCardProps) {
  const { engine, purchaseProducer } = useGameStore();

  if (!engine) {
    return null;
  }

  const isUnlocked = producer.unlocked;
  const level = producer.level;
  const isMaxLevel = producer.isMaxLevel();

  if (!isUnlocked) {
    return (
      <div className="tech-card opacity-50">
        <div className="tech-card__content p-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🔒</div>
            <div>
              <div className="text-white font-medium">{producer.name}</div>
              <div className="text-secondary text-sm">Locked</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const maxAffordable = producer.getMaxAffordable(engine.resources);
  const production = producer.getProductionRate();

  const handlePurchase = (amount: number | 'max') => {
    const buyAmount = amount === 'max' ? maxAffordable : amount;
    if (buyAmount > 0) {
      purchaseProducer(producer.id, buyAmount);
    }
  };

  // Available buy amounts
  const buyOptions: (number | 'max')[] = [1];
  if (maxAffordable >= 10) buyOptions.push(10);
  if (maxAffordable >= 100) buyOptions.push(100);
  if (maxAffordable > 1) buyOptions.push('max');

  const canAffordAny = maxAffordable > 0;

  return (
    <div className={`tech-card ${canAffordAny ? 'tech-card--glow' : ''}`}>
      <div className="tech-card__content p-4">
        {/* Particle effects for affordable producers */}
        {canAffordAny && (
          <div className="tech-particles">
            <div className="tech-particle"></div>
            <div className="tech-particle"></div>
            <div className="tech-particle"></div>
          </div>
        )}

        {/* Header with inline production */}
        <div className="flex items-center gap-3 mb-3">
          <div className="text-3xl">{producer.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-bold truncate">{producer.name}</span>
              <span className="hex-badge">
                Lv {level}
              </span>
            </div>
            <div className="text-secondary text-xs mt-0.5">{producer.description}</div>
            {level > 0 && Object.entries(production).map(([resourceId, amount]) => (
              <div key={resourceId} className="tech-text-glow--green text-sm font-semibold mt-1">
                {NumberFormatter.formatRate(amount)}
              </div>
            ))}
          </div>
        </div>

      {/* Buy Buttons with Integrated Cost */}
      {!isMaxLevel && (
        <div className="grid grid-cols-4 gap-2">
          {buyOptions.map((amount) => {
            const buyAmount = amount === 'max' ? maxAffordable : amount;
            const btnCost = producer.getNextCost(buyAmount);
            const btnCanAfford = buyAmount > 0 && Object.entries(btnCost).every(([resourceId, costAmount]) => {
              const resource = engine.resources[resourceId];
              return resource && resource.canAfford(costAmount);
            });

            // Format cost for display (show first resource)
            const costEntries = Object.entries(btnCost);
            const costText = costEntries.length > 0
              ? NumberFormatter.format(costEntries[0][1])
              : '—';

            return (
              <TouchButton
                key={amount}
                onClick={() => handlePurchase(amount)}
                disabled={!btnCanAfford}
                variant="tech"
                size="md"
                className="flex flex-col items-center justify-center text-sm py-2"
              >
                <span className="text-base font-black">
                  {amount === 'max' ? 'Max' : `x${amount}`}
                </span>
                <span className="text-xs mt-0.5 font-semibold opacity-80">
                  {amount === 'max' ? `(${buyAmount})` : costText}
                </span>
              </TouchButton>
            );
          })}
        </div>
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
