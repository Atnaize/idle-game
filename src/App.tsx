import { useEffect } from 'react';
import { useGameStore } from '@store/gameStore';
import { useTheme } from '@hooks/useTheme';
import { useMobileLayout } from '@hooks/useMobileLayout';
import { Header } from '@components/layout/Header';
import { ResourceDisplay } from '@components/resources/ResourceDisplay';
import { ClickArea } from '@components/click/ClickArea';
import { BottomNavigation } from '@components/layout/BottomNavigation';
import { ProducersTab } from '@components/tabs/ProducersTab';
import { SkillTreeTab } from '@components/tabs/SkillTreeTab';
import { AchievementsTab } from '@components/tabs/AchievementsTab';
import { PrestigeTab } from '@components/tabs/PrestigeTab';

function App() {
  const { initialized, initializeGame, selectedTab, tick } = useGameStore();
  const layout = useMobileLayout();

  // Initialize theme system
  useTheme();

  // Initialize game on mount
  useEffect(() => {
    if (!initialized) {
      initializeGame();
    }
  }, [initialized, initializeGame]);

  // Force re-render when tick changes
  useEffect(() => {
    // This effect runs on every tick, ensuring UI updates
  }, [tick]);

  if (!initialized) {
    return (
      <div className="min-h-screen pattern-radial-space flex items-center justify-center">
        <div className="text-white text-2xl tech-text-glow--blue">Initializing game...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col pattern-radial-space overflow-hidden">
      <div id="app-wrapper" className="h-full flex flex-col transition-all duration-300 overflow-hidden">
        {/* Fixed Header */}
        <Header />

        {/* Sticky Resource Display (below header) */}
        <ResourceDisplay />

        {/* Scrollable Content Area - flex-1 allows it to fill remaining space */}
        <div
          id="app-content"
          className={layout.classes.scrollContainer}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Tab Content */}
          <div
            className={`px-4 ${layout.classes.contentBottomPadding}`}
          >
            {selectedTab === 'producers' && <ProducersTab />}
            {selectedTab === 'skilltree' && <SkillTreeTab />}
            {selectedTab === 'achievements' && <AchievementsTab />}
            {selectedTab === 'prestige' && <PrestigeTab />}
          </div>
        </div>

        {/* Fixed Click Area - Above Bottom Nav */}
        <div
          className="fixed left-0 right-0 px-4 pb-2"
          style={{
            bottom: `${layout.clickButtonBottom}px`,
            zIndex: layout.zIndex.clickButton
          }}
        >
          <ClickArea />
        </div>

        {/* Fixed Bottom Navigation */}
        <BottomNavigation />
      </div>
    </div>
  );
}

export default App;
