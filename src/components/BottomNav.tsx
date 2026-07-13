export type Screen = 'today' | 'add' | 'history' | 'stats' | 'settings'

const TABS: { screen: Screen; label: string; icon: string }[] = [
  { screen: 'today', label: '오늘', icon: '🥗' },
  { screen: 'history', label: '기록', icon: '📅' },
  { screen: 'stats', label: '통계', icon: '📊' },
  { screen: 'settings', label: '설정', icon: '⚙️' },
]

export default function BottomNav({ screen, onChange }: { screen: Screen; onChange: (s: Screen) => void }) {
  return (
    <>
      <div className="h-20" />

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-800">
        <div className="max-w-2xl mx-auto flex">
          {TABS.map(tab => (
            <button
              key={tab.screen}
              onClick={() => onChange(tab.screen)}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
                screen === tab.screen ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {screen !== 'add' && (
        <button
          onClick={() => onChange('add')}
          aria-label="식사 기록 추가"
          className="fixed right-4 bottom-20 z-50 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-3xl flex items-center justify-center shadow-lg shadow-emerald-950/50 transition-colors"
        >
          +
        </button>
      )}
    </>
  )
}
