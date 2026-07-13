import { useMeals, useSettings } from '../lib/store'
import { addDays, toDateKey } from '../lib/date'
import CalorieTrendChart from '../components/CalorieTrendChart'
import WeightSection from '../components/WeightSection'
import FmdCalendar from '../components/FmdCalendar'

export default function StatsScreen({ onGoSettings }: { onGoSettings: () => void }) {
  const settings = useSettings()
  const meals = useMeals()

  const today = new Date()
  const start = addDays(today, -6)

  const byDate = new Map<string, number>()
  for (const m of meals) byDate.set(m.date, (byDate.get(m.date) ?? 0) + m.calories)

  const weekly = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(start, i)
    return { label: `${d.getMonth() + 1}/${d.getDate()}`, calories: byDate.get(toDateKey(d)) ?? 0 }
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-ink text-2xl font-extrabold">통계</h1>
        <p className="text-muted text-sm mt-1">주간 추이와 체중 변화를 확인하세요</p>
      </div>

      <section className="card p-5">
        <h2 className="text-ink font-bold text-sm mb-3">주간 칼로리 추이</h2>
        <CalorieTrendChart data={weekly} targetMax={settings.targetCaloriesMax} />
      </section>

      <WeightSection />

      <FmdCalendar fmdCycleStartDate={settings.fmdCycleStartDate} onGoSettings={onGoSettings} />
    </div>
  )
}
