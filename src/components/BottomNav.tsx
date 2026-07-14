import DraggableFab from './DraggableFab'

export type Screen = 'today' | 'add' | 'history' | 'stats' | 'settings'

const TABS: { screen: Screen; label: string; icon: string }[] = [
  { screen: 'today', label: '오늘', icon: '🥗' },
  { screen: 'history', label: '기록', icon: '📅' },
  { screen: 'stats', label: '통계', icon: '📊' },
  { screen: 'settings', label: '설정', icon: '⚙️' },
]

export default function BottomNav({ screen, onChange, onAdd }: { screen: Screen; onChange: (s: Screen) => void; onAdd: () => void }) {
  return (
    <>
      <div className="h-24" />

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-line pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-2xl mx-auto flex">
          {TABS.map(tab => {
            const active = screen === tab.screen
            return (
              <button
                key={tab.screen}
                onClick={() => onChange(tab.screen)}
                className="flex-1 flex flex-col items-center justify-center pt-2.5 pb-2 gap-1"
              >
                <span
                  className={`w-12 h-8 rounded-2xl flex items-center justify-center text-lg transition-colors ${
                    active ? 'bg-navy' : 'bg-transparent'
                  }`}
                >
                  {tab.icon}
                </span>
                <span className={`text-[11px] font-semibold ${active ? 'text-navy' : 'text-faint'}`}>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {screen !== 'add' && <DraggableFab onOpen={onAdd} />}
    </>
  )
}
