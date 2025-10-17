import { useGameStore } from '@store/gameStore';
import { ProducerCard } from '@components/producers/ProducerCard';

export function ProducersTab() {
  const { engine } = useGameStore();

  if (!engine) {
    return null;
  }

  const producers = Object.values(engine.producers)
    .filter((p) => p.visible)
    .sort((a, b) => a.tier - b.tier);

  return (
    <div className="space-y-4 pt-4">
      {producers.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          No producers available yet
        </div>
      )}

      {producers.map((producer) => (
        <ProducerCard key={producer.id} producer={producer} />
      ))}
    </div>
  );
}
