import type { Achievement } from '@core/engine';
import { NumberFormatter } from '@core/utils';

interface AchievementCardProps {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const isCompleted = achievement.completed;
  const progress = achievement.progress;
  const progressPercent = Math.min(progress * 100, 100);

  return (
    <div
      className={`tech-card transition-all ${
        isCompleted ? 'tech-card--glow border-tech-green' : ''
      }`}
    >
      <div className="tech-card__content p-4">
        <div className="flex items-start gap-3">
          <div className={`text-3xl ${!isCompleted && 'grayscale opacity-50'}`}>
            {achievement.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div className="text-white font-bold">{achievement.name}</div>
              {isCompleted && <div className="tech-text-glow--green text-xl">✓</div>}
            </div>
            <div className="text-secondary text-sm mb-2">{achievement.description}</div>

            {/* Progress Bar */}
            {!isCompleted && (
              <div className="mb-2">
                <div className="flex justify-between text-xs text-tertiary mb-1">
                  <span>Progress</span>
                  <span>{NumberFormatter.formatPercent(progress, 1)}</span>
                </div>
                <div className="tech-progress">
                  <div
                    className="tech-progress__fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Reward */}
            {achievement.reward && (
              <div className="text-sm tech-text-glow--blue flex items-center gap-1">
                <span>🎁</span>
                <span>{achievement.getRewardDescription()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
