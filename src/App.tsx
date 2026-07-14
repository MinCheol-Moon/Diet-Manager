import { useState } from 'react'
import { useMeals, useSettings } from './lib/store'
import { useMealReminders } from './lib/useMealReminders'
import { todayKey } from './lib/date'
import BottomNav, { type Screen } from './components/BottomNav'
import TodayScreen from './screens/TodayScreen'
import AddScreen from './screens/AddScreen'
import HistoryScreen from './screens/HistoryScreen'
import StatsScreen from './screens/StatsScreen'
import SettingsScreen from './screens/SettingsScreen'

export default function App() {
  const [screen, setScreen] = useState<Screen>('today')
  const [addDate, setAddDate] = useState(todayKey())
  const [addReturn, setAddReturn] = useState<Screen>('today')
  const settings = useSettings()
  const meals = useMeals()

  useMealReminders(settings, meals)

  function openAdd(date: string, from: Screen) {
    setAddDate(date)
    setAddReturn(from)
    setScreen('add')
  }

  const dateLabel = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })

  return (
    <div className="min-h-screen bg-canvas">
      <header className="bg-surface/85 backdrop-blur-md sticky top-0 z-40 border-b border-line">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-14">
          <span className="text-ink font-extrabold text-[17px]">🥗 식단관리</span>
          <span className="text-faint text-xs font-medium">{dateLabel}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5">
        {screen === 'today' && <TodayScreen onAdd={() => openAdd(todayKey(), 'today')} />}
        {screen === 'add' && <AddScreen date={addDate} onDone={() => setScreen(addReturn)} onCancel={() => setScreen(addReturn)} />}
        {screen === 'history' && <HistoryScreen onAddForDate={d => openAdd(d, 'history')} />}
        {screen === 'stats' && <StatsScreen onGoSettings={() => setScreen('settings')} />}
        {screen === 'settings' && <SettingsScreen />}
      </main>

      <BottomNav screen={screen} onChange={setScreen} onAdd={() => openAdd(todayKey(), 'today')} />
    </div>
  )
}
