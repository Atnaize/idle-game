import { type FC } from 'react';
import { Modal, ModalContent, ModalFooter } from './Modal';
import { TouchButton } from './TouchButton';

interface OfflineProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeAway: number; // in seconds
  maxOfflineTime: number; // in seconds
  resourcesGained?: Record<string, string>;
}

/**
 * OfflineProgressModal - Shows summary when player returns after being away
 */
export const OfflineProgressModal: FC<OfflineProgressModalProps> = ({
  isOpen,
  onClose,
  timeAway,
  maxOfflineTime,
  resourcesGained = {},
}) => {
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const effectiveTime = Math.min(timeAway, maxOfflineTime);
  const wasCapped = timeAway > maxOfflineTime;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-purple-400 mb-4">Welcome Back!</h2>

          {/* Time away */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Time Away</div>
            <div className="text-2xl font-bold text-blue-400">
              {formatTime(timeAway)}
            </div>
            {wasCapped && (
              <div className="text-xs text-yellow-400 mt-2">
                ⚠️ Offline progress capped at {formatTime(maxOfflineTime)}
              </div>
            )}
          </div>

          {/* Resources gained */}
          {Object.keys(resourcesGained).length > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-3">Resources Gained</div>
              <div className="space-y-2">
                {Object.entries(resourcesGained).map(([resource, amount]) => (
                  <div
                    key={resource}
                    className="flex justify-between items-center"
                  >
                    <span className="text-gray-300 capitalize">{resource}</span>
                    <span className="text-green-400 font-semibold">
                      +{amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info text */}
          <div className="text-center text-sm text-gray-400">
            {wasCapped ? (
              <>
                You've been away longer than the maximum offline time.
                <br />
                Progress was calculated for {formatTime(effectiveTime)}.
              </>
            ) : (
              <>Your progress has been calculated while you were away!</>
            )}
          </div>
        </div>
      </ModalContent>

      <ModalFooter>
        <TouchButton onClick={onClose} variant="primary" fullWidth>
          Continue Playing
        </TouchButton>
      </ModalFooter>
    </Modal>
  );
};
