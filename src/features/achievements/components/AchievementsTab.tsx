import { useGameStore } from '@core/store';
import { AchievementCard } from './AchievementCard';

export function AchievementsTab() {
  const { engine } = useGameStore();

  if (!engine) {
    return null;
  }

  const achievements = Object.values(engine.achievements);
  const completed = achievements.filter((a) => a.completed);
  const inProgress = achievements.filter((a) => !a.completed);

  return (
    <div className="space-y-4 pt-4">
      {achievements.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          No achievements available yet
        </div>
      )}

      {inProgress.length > 0 && (
        <div>
          <h2 className="text-white font-bold text-lg mb-3">In Progress</h2>
          <div className="space-y-2">
            {inProgress.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h2 className="text-white font-bold text-lg mb-3">Completed</h2>
          <div className="space-y-2">
            {completed.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
