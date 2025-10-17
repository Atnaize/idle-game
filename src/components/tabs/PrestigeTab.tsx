import { useState } from 'react';
import { useGameStore } from '@store/gameStore';
import { NumberFormatter } from '@utils/NumberFormatter';
import { SectionCard } from '@components/ui/SectionCard';
import { StatCard } from '@components/ui/StatCard';
import { Modal, ModalContent, ModalFooter } from '@components/ui/Modal';
import { TouchButton } from '@components/ui/TouchButton';

export function PrestigeTab() {
  const { engine, performPrestige } = useGameStore();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!engine?.prestige) {
    return null;
  }

  const prestige = engine.prestige;
  const context = engine.getGameContext();
  const canPrestige = prestige.canPrestige(context);
  const pointsGain = prestige.calculatePointsGain(context);
  const currentPoints = prestige.prestigePoints;
  const currentMultiplier = prestige.getMultiplier();
  const nextMultiplier = currentPoints.add(pointsGain).mul(prestige.bonusPerPoint).add(1);

  const oreResource = engine.resources[prestige.currencyId];
  const currentOre = oreResource?.amount;

  const handlePrestige = () => {
    if (!canPrestige) {
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmPrestige = () => {
    performPrestige();
    setShowConfirmModal(false);
  };

  return (
    <div className="pt-4 space-y-4">
      <SectionCard title="Prestige" titleIcon="✨" glow glowColor="purple">
        <p className="text-secondary text-sm mb-4">
          Reset your progress to gain permanent production bonuses
        </p>

        <div className="space-y-3">
          <StatCard
            label="Current Prestige Points"
            value={NumberFormatter.format(currentPoints)}
            borderColor="purple"
            valueClassName="text-2xl font-bold tech-text-glow--purple"
          />

          <StatCard
            label="Current Multiplier"
            value={`${currentMultiplier.toNumber().toFixed(2)}x`}
            borderColor="purple"
            valueClassName="text-2xl font-bold tech-text-glow--blue"
          />

          <StatCard
            label="On Prestige, Gain"
            value={`+${NumberFormatter.format(pointsGain)} PP`}
            sublabel={pointsGain.gt(0) ? `→ ${nextMultiplier.toNumber().toFixed(2)}x multiplier` : undefined}
            borderColor="blue"
            valueClassName="text-2xl font-bold tech-text-glow--blue"
          />

          <StatCard
            label="Requirement"
            value={`${NumberFormatter.format(prestige.minRequirement)} ore`}
            sublabel={currentOre ? `You have: ${NumberFormatter.format(currentOre)}` : undefined}
            borderColor="amber"
            valueClassName="text-lg tech-text-glow--blue"
          />
        </div>

        <TouchButton
          onClick={handlePrestige}
          disabled={!canPrestige}
          fullWidth
          size="lg"
          variant="primary"
          className="mt-4"
          style={canPrestige ? {
            background: 'linear-gradient(135deg, var(--helix-purple) 0%, var(--helix-pink) 100%)'
          } : undefined}
        >
          {canPrestige ? '✨ Prestige Now ✨' : '🔒 Not Enough Resources'}
        </TouchButton>
      </SectionCard>

      <SectionCard>
        <h3 className="text-white font-bold mb-2">How Prestige Points Work</h3>
        <div className="tech-card bg-helix-purple bg-opacity-10 p-3 border-2 border-helix-purple mb-3">
          <p className="text-white text-sm font-semibold mb-1">💡 PP Formula</p>
          <p className="text-secondary text-xs">
            PP gained = √(Total Ore / {NumberFormatter.format(prestige.minRequirement)})
          </p>
          <p className="text-tertiary text-xs mt-1">
            More ore = exponentially more PP!
          </p>
        </div>
        <ul className="text-secondary text-sm space-y-1">
          <li>✓ Gain PP based on total ore collected</li>
          <li>✓ Each PP gives +{NumberFormatter.formatPercent(prestige.bonusPerPoint, 0)} permanent production boost</li>
          <li>✓ Keep all achievements</li>
          <li>✗ Reset all resources to 0</li>
          <li>✗ Reset all producers to level 0</li>
          <li>✗ Reset all upgrades</li>
        </ul>
      </SectionCard>

      {/* Prestige Confirmation Modal */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} size="md">
        <ModalContent>
          {/* Icon and Title */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-3 animate-pulse">✨</div>
            <h2 className="text-2xl font-bold text-white mb-2">Prestige Confirmation</h2>
            <p className="text-secondary text-sm">Are you ready to ascend?</p>
          </div>

          {/* Stats Preview */}
          <div className="space-y-3 mb-6">
            <div className="tech-card bg-helix-purple bg-opacity-20 p-3 border-2 border-helix-purple">
              <p className="text-secondary text-xs mb-1">You will gain</p>
              <p className="text-white font-bold text-xl tech-text-glow--purple">
                +{NumberFormatter.format(pointsGain)} Prestige Points
              </p>
            </div>

            <div className="tech-card bg-helix-blue bg-opacity-20 p-3 border-2 border-helix-blue">
              <p className="text-secondary text-xs mb-1">New multiplier</p>
              <p className="text-white font-bold text-xl tech-text-glow--blue">
                {currentMultiplier.toNumber().toFixed(2)}x → {nextMultiplier.toNumber().toFixed(2)}x
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="tech-card bg-red-900 bg-opacity-20 p-3 border-2 border-red-500 mb-6">
            <p className="text-red-400 font-bold text-sm mb-1">⚠️ Warning</p>
            <p className="text-red-300 text-xs">All resources, producers, and upgrades will be reset!</p>
          </div>
        </ModalContent>

        <ModalFooter>
          <div className="flex gap-3 w-full">
            <TouchButton
              onClick={() => setShowConfirmModal(false)}
              variant="secondary"
              size="lg"
              className="flex-1"
            >
              Cancel
            </TouchButton>
            <TouchButton
              onClick={confirmPrestige}
              variant="primary"
              size="lg"
              className="flex-1 font-bold"
              style={{
                background: 'linear-gradient(135deg, var(--helix-purple) 0%, var(--helix-pink) 100%)'
              }}
            >
              ✨ Prestige ✨
            </TouchButton>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
}
