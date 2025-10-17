import { useGameStore } from '@store/gameStore';

export function TabNavigation() {
  const { selectedTab, setSelectedTab } = useGameStore();

  const tabs = [
    { id: 'producers' as const, label: 'Producers', icon: '⚙️' },
    { id: 'upgrades' as const, label: 'Upgrades', icon: '⬆️' },
    { id: 'achievements' as const, label: 'Achievements', icon: '🏆' },
    { id: 'prestige' as const, label: 'Prestige', icon: '✨' },
  ];

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`flex-1 py-3 text-center font-medium transition-colors min-h-[44px] ${
              selectedTab === tab.id
                ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            <span className="text-sm">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
