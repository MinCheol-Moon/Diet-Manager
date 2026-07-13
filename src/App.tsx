import { useState } from 'react'
import { useMeals, useSettings } from './lib/store'
import { useMealReminders } from './lib/useMealReminders'
import BottomNav, { type Screen } from './components/BottomNav'
import TodayScreen from './screens/TodayScreen'
import AddScreen from './screens/AddScreen'
import HistoryScreen from './screens/HistoryScreen'
import StatsScreen from './screens/StatsScreen'
import SettingsScreen from './screens/SettingsScreen'

export default function App() {
  const [screen, setScreen] = useState<Screen>('today')
  const settings = useSettings()
  const meals = useMeals()

  useMealReminders(settings, meals)

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 flex items-center h-12">
          <span className="text-white font-bold text-base">🥗 식단관리</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5">
        {screen === 'today' && <TodayScreen onAdd={() => setScreen('add')} />}
        {screen === 'add' && <AddScreen onDone={() => setScreen('today')} onCancel={() => setScreen('today')} />}
        {screen === 'history' && <HistoryScreen />}
        {screen === 'stats' && <StatsScreen onGoSettings={() => setScreen('settings')} />}
        {screen === 'settings' && <SettingsScreen />}
      </main>

      <BottomNav screen={screen} onChange={setScreen} />
    </div>
  )
}
