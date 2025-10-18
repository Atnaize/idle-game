import { useGameStore } from '@core/store';
import { TABS } from '@shared/config';

export function BottomNavigation() {
  const { selectedTab, setSelectedTab } = useGameStore();

  const tabs = [
    { id: TABS.PRODUCERS, label: 'Producers', icon: '⚙️' },
    { id: TABS.SKILLTREE, label: 'Tech Tree', icon: '⚛️' },
    { id: TABS.ACHIEVEMENTS, label: 'Achievements', icon: '🏆' },
    { id: TABS.PRESTIGE, label: 'Prestige', icon: '✨' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 tech-hud border-t-2 border-helix-blue shadow-glow-blue z-50 safe-area-bottom">
      {/* Grid pattern background */}
      <div className="pattern-grid absolute inset-0 opacity-20"></div>

      <div className="flex justify-around items-center h-20 max-w-lg mx-auto px-2 relative z-10">
        {tabs.map((tab, index) => {
          const isActive = selectedTab === tab.id;
          const isLast = index === tabs.length - 1;

          return (
            <div key={tab.id} className="flex flex-1 items-center justify-center relative">
              <button
                onClick={() => setSelectedTab(tab.id)}
                className={`flex flex-col items-center justify-center w-full h-full px-2 py-2 transition-all duration-200 rounded-lg relative ${
                  isActive
                    ? 'tech-text-glow--blue scale-105'
                    : 'text-gray-400 active:scale-95'
                }`}
              >
                {/* Hexagonal glow effect for active tab */}
                {isActive && (
                  <div className="absolute inset-0 bg-gray-900 bg-opacity-60 rounded-lg border-2 border-helix-blue"></div>
                )}

                <span className={`text-2xl transition-transform duration-200 relative z-10 ${
                  isActive ? 'scale-110' : ''
                } mb-1`}>
                  {tab.icon}
                </span>
                <span className={`text-xs font-medium transition-all relative z-10 ${
                  isActive ? 'font-bold text-white' : ''
                }`}>
                  {tab.label}
                </span>

                {/* Active indicator line */}
                {isActive && (
                  <div className="absolute top-0 w-12 h-1 bg-gradient-to-r from-helix-blue via-helix-purple to-helix-pink rounded-b-full shadow-glow-blue" />
                )}
              </button>

              {/* Connection line between tabs */}
              {!isLast && (
                <div className="absolute right-0 w-px h-8 bg-helix-blue opacity-20"></div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
