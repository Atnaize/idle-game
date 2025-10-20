import { useState } from 'react';
import { useGameStore } from '@core/store';
import { StyleShowcase } from './StyleShowcase';
import { BigNumber } from '@core/engine';
import { Logger } from '@core/utils';
import { Modal, ModalContent, ModalFooter } from './Modal';
import { TouchButton } from './TouchButton';

type Page = 'menu' | 'designSystem' | 'version' | 'credits';

export function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('menu');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { engine, saveGame, loadGame } = useGameStore();

  const giveDebugCredits = () => {
    if (!engine) return;

    // Give 1 trillion of each resource
    Object.values(engine.resources).forEach(resource => {
      resource.add(BigNumber.from(1000000000000));
    });

    // Don't close the menu - let user add more if needed
  };

  const handleManualSave = () => {
    saveGame();
    Logger.debug('Manual save triggered');
  };

  const handleTestLoad = () => {
    loadGame();
    Logger.debug('Manual load triggered');
  };

  const handleResetEverything = () => {
    // Clear all localStorage
    localStorage.clear();

    Logger.info('Game reset: All data cleared');

    // Reload the page to start fresh
    window.location.reload();
  };

  const closePage = () => {
    setCurrentPage('menu');
    setIsOpen(false);
  };

  const openPage = (page: Page) => {
    setCurrentPage(page);
  };

  return (
    <>
      {/* Settings Icon Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-helix-blue bg-helix-blue bg-opacity-10 text-white hover:bg-opacity-20 transition-all relative z-50"
        aria-label="Settings"
      >
        ⚙️
      </button>

      {/* Settings Modal */}
      <Modal isOpen={isOpen} onClose={closePage} size="md">
        <ModalContent>
          {currentPage === 'menu' && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white mb-4 pb-3 border-b-2 border-helix-blue">Settings</h2>

              <button
                onClick={() => openPage('designSystem')}
                className="w-full text-left px-4 py-3 rounded-lg text-white bg-helix-blue bg-opacity-10 hover:bg-opacity-20 transition-all border-2 border-helix-blue border-opacity-30 hover:border-opacity-60"
              >
                <div className="text-2xl mb-1">🎨</div>
                <div className="font-bold">Design System Showcase</div>
                <div className="text-xs text-secondary mt-1">View all UI components</div>
              </button>

              <button
                onClick={() => openPage('version')}
                className="w-full text-left px-4 py-3 rounded-lg text-white bg-helix-blue bg-opacity-10 hover:bg-opacity-20 transition-all border-2 border-helix-blue border-opacity-30 hover:border-opacity-60"
              >
                <div className="text-2xl mb-1">ℹ️</div>
                <div className="font-bold">Game Version</div>
                <div className="text-xs text-secondary mt-1">About this game</div>
              </button>

              <button
                onClick={() => openPage('credits')}
                className="w-full text-left px-4 py-3 rounded-lg text-white bg-helix-blue bg-opacity-10 hover:bg-opacity-20 transition-all border-2 border-helix-blue border-opacity-30 hover:border-opacity-60"
              >
                <div className="text-2xl mb-1">👥</div>
                <div className="font-bold">Credits</div>
                <div className="text-xs text-secondary mt-1">Made by</div>
              </button>

              <div className="border-t-2 border-helix-amber border-opacity-30 pt-3 mt-4 space-y-2">
                <div className="text-sm text-tech-amber font-bold mb-2">Debug Tools</div>

                <button
                  onClick={giveDebugCredits}
                  className="w-full text-left px-4 py-3 rounded-lg text-tech-amber bg-tech-amber bg-opacity-10 hover:bg-opacity-20 transition-all border-2 border-tech-amber border-opacity-50 hover:border-opacity-100 font-bold"
                >
                  <div className="text-2xl mb-1">💰</div>
                  <div>Add 1M Resources</div>
                  <div className="text-xs opacity-80 mt-1">For testing purposes</div>
                </button>

                <button
                  onClick={handleManualSave}
                  className="w-full text-left px-4 py-3 rounded-lg text-green-400 bg-green-400 bg-opacity-10 hover:bg-opacity-20 transition-all border-2 border-green-400 border-opacity-50 hover:border-opacity-100 font-bold"
                >
                  <div className="text-2xl mb-1">💾</div>
                  <div>Manual Save</div>
                  <div className="text-xs opacity-80 mt-1">Test save system</div>
                </button>

                <button
                  onClick={handleTestLoad}
                  className="w-full text-left px-4 py-3 rounded-lg text-blue-400 bg-blue-400 bg-opacity-10 hover:bg-opacity-20 transition-all border-2 border-blue-400 border-opacity-50 hover:border-opacity-100 font-bold"
                >
                  <div className="text-2xl mb-1">📂</div>
                  <div>Test Load</div>
                  <div className="text-xs opacity-80 mt-1">Reload from save</div>
                </button>

                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full text-left px-4 py-3 rounded-lg text-red-400 bg-red-400 bg-opacity-10 hover:bg-opacity-20 transition-all border-2 border-red-400 border-opacity-50 hover:border-opacity-100 font-bold"
                >
                  <div className="text-2xl mb-1">🗑️</div>
                  <div>Reset Everything</div>
                  <div className="text-xs opacity-80 mt-1">Clear all data & restart</div>
                </button>
              </div>
            </div>
          )}

          {currentPage === 'designSystem' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4 pb-3 border-b-2 border-helix-blue">Design System Showcase</h2>
              <StyleShowcase />
            </div>
          )}

          {currentPage === 'version' && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">⛏️</div>
              <h2 className="text-2xl font-bold text-white mb-2">Idle Miner</h2>
              <div className="text-helix-blue font-bold text-xl mb-6">v0.0.1</div>
              <p className="text-secondary mb-4">Built with React + TypeScript</p>
              <p className="text-tertiary text-sm">An incremental mining game</p>
            </div>
          )}

          {currentPage === 'credits' && (
            <div className="text-center py-8">
              <div className="text-6xl mb-6">🏆</div>
              <h2 className="text-2xl font-bold text-white mb-4">Credits</h2>
              <div className="space-y-4">
                <div className="tech-card bg-helix-blue bg-opacity-10 p-4">
                  <p className="text-secondary text-sm mb-2">Created by</p>
                  <p className="text-white font-bold text-lg">Eric Debleumortier</p>
                </div>
                <div className="tech-card bg-helix-purple bg-opacity-10 p-4">
                  <p className="text-secondary text-sm mb-2">Built with</p>
                  <p className="text-white font-bold">Claude Code</p>
                </div>
                <p className="text-tertiary text-xs mt-6">Design inspired by Idle Planet Miner</p>
              </div>
            </div>
          )}
        </ModalContent>

        <ModalFooter>
          <TouchButton
            onClick={closePage}
            fullWidth
            size="lg"
            variant="primary"
          >
            Close
          </TouchButton>
        </ModalFooter>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal isOpen={showResetConfirm} onClose={() => setShowResetConfirm(false)} size="sm">
        <ModalContent>
          <div className="text-center py-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-400 mb-4">Reset Everything?</h2>
            <p className="text-gray-300 mb-2">
              This will <span className="text-red-400 font-bold">permanently delete</span> all your game progress:
            </p>
            <ul className="text-left text-gray-400 text-sm mb-4 space-y-1 bg-gray-800/50 rounded-lg p-4">
              <li>• All resources</li>
              <li>• All producers and upgrades</li>
              <li>• All achievements</li>
              <li>• Prestige points and stats</li>
              <li>• Save data</li>
            </ul>
            <p className="text-yellow-400 text-sm font-semibold">
              This action cannot be undone!
            </p>
          </div>
        </ModalContent>

        <ModalFooter>
          <div className="flex gap-3 w-full">
            <TouchButton
              onClick={() => setShowResetConfirm(false)}
              variant="secondary"
              fullWidth
            >
              Cancel
            </TouchButton>
            <TouchButton
              onClick={handleResetEverything}
              variant="danger"
              fullWidth
            >
              Reset Everything
            </TouchButton>
          </div>
        </ModalFooter>
      </Modal>
    </>
  );
}
