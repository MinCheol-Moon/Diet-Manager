import { useMemo, useState } from 'react'
import { deleteMeal, useMeals } from '../lib/store'
import { toDateKey } from '../lib/date'
import { MEAL_TYPE_ICON, MEAL_TYPE_LABEL, type Meal, type MealType } from '../lib/types'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

export default function HistoryScreen() {
  const meals = useMeals()
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [selected, setSelected] = useState(toDateKey(now))

  const kcalByDate = useMemo(() => {
    const m = new Map<string, number>()
    for (const meal of meals) m.set(meal.date, (m.get(meal.date) ?? 0) + meal.calories)
    return m
  }, [meals])

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`

  const monthDays = Array.from(kcalByDate.entries()).filter(([d]) => d.startsWith(monthPrefix))
  const loggedDays = monthDays.length
  const monthTotal = monthDays.reduce((s, [, v]) => s + v, 0)
  const avgKcal = loggedDays > 0 ? Math.round(monthTotal / loggedDays) : 0

  const selectedMeals = meals
    .filter(m => m.date === selected)
    .sort((a, b) => a.loggedAt.localeCompare(b.loggedAt))
  const selectedTotal = selectedMeals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
      sodium: acc.sodium + m.sodium,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 0 },
  )

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear(y => y - 1)
      setViewMonth(11)
    } else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear(y => y + 1)
      setViewMonth(0)
    } else setViewMonth(m => m + 1)
  }

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const todayKeyStr = toDateKey(now)
  const selDate = selected.split('-').map(Number)
  const selLabel = `${selDate[1]}월 ${selDate[2]}일 (${WEEKDAYS[new Date(selected).getDay()]})`

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-ink text-2xl font-extrabold">기록</h1>
        <p className="text-muted text-sm mt-1">날짜별로 뭘 먹었는지 한눈에 확인하세요</p>
      </div>

      {/* 달력 */}
      <section className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="w-9 h-9 rounded-full bg-canvas hover:bg-line text-muted text-lg flex items-center justify-center">
            ‹
          </button>
          <div className="text-center">
            <p className="text-ink font-bold">{viewYear}년 {viewMonth + 1}월</p>
            <p className="text-faint text-xs mt-0.5">{loggedDays}일 기록 · 평균 {avgKcal}kcal</p>
          </div>
          <button onClick={nextMonth} className="w-9 h-9 rounded-full bg-canvas hover:bg-line text-muted text-lg flex items-center justify-center">
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((w, i) => (
            <div key={w} className={`text-center text-[11px] font-semibold ${i === 0 ? 'text-danger' : i === 6 ? 'text-sodium' : 'text-faint'}`}>
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (day === null) return <div key={`e${idx}`} />
            const dateKey = `${monthPrefix}-${String(day).padStart(2, '0')}`
            const kcal = kcalByDate.get(dateKey)
            const isSelected = dateKey === selected
            const isToday = dateKey === todayKeyStr
            return (
              <button
                key={dateKey}
                onClick={() => setSelected(dateKey)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-colors ${
                  isSelected ? 'bg-navy text-white' : kcal ? 'bg-navy/[0.06] text-ink hover:bg-navy/10' : 'text-faint hover:bg-canvas'
                } ${isToday && !isSelected ? 'ring-1 ring-navy/40' : ''}`}
              >
                <span className="text-sm leading-none">{day}</span>
                {kcal ? (
                  <span className={`text-[9px] mt-0.5 leading-none font-medium ${isSelected ? 'text-white/80' : 'text-gold'}`}>
                    {Math.round(kcal)}
                  </span>
                ) : (
                  <span className="text-[9px] mt-0.5 leading-none opacity-0">·</span>
                )}
              </button>
            )
          })}
        </div>
      </section>

      {/* 선택한 날 상세 */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-ink font-bold text-base">{selLabel}</h2>
          {selectedMeals.length > 0 && <span className="text-gold text-sm font-bold">{Math.round(selectedTotal.calories)}kcal</span>}
        </div>

        {selectedMeals.length === 0 ? (
          <div className="card p-8 text-center text-faint text-sm">이 날은 기록이 없어요</div>
        ) : (
          <div className="space-y-3">
            {MEAL_ORDER.map(type => {
              const items = selectedMeals.filter(m => m.mealType === type)
              if (items.length === 0) return null
              return <MealGroup key={type} type={type} items={items} />
            })}

            <div className="card px-4 py-3 flex items-center justify-between text-sm">
              <span className="text-muted font-medium">하루 합계</span>
              <span className="text-ink">
                {Math.round(selectedTotal.calories)}kcal · 단 {Math.round(selectedTotal.protein)} · 탄 {Math.round(selectedTotal.carbs)} · 지 {Math.round(selectedTotal.fat)} · 나트륨 {Math.round(selectedTotal.sodium)}mg
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function MealGroup({ type, items }: { type: MealType; items: Meal[] }) {
  const total = items.reduce((s, m) => s + m.calories, 0)
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        <span>{MEAL_TYPE_ICON[type]}</span>
        <span className="text-ink text-sm font-bold">{MEAL_TYPE_LABEL[type]}</span>
        <span className="text-faint text-xs ml-auto">{Math.round(total)}kcal</span>
      </div>
      {items.map(meal => (
        <div key={meal.id} className="flex items-center gap-3 px-4 py-2.5 border-t border-line">
          <div className="flex-1 min-w-0">
            <p className="text-ink text-sm truncate">{meal.menuName}</p>
            <p className="text-faint text-xs mt-0.5">{Math.round(meal.calories)}kcal · 나트륨 {Math.round(meal.sodium)}mg</p>
          </div>
          <button onClick={() => deleteMeal(meal.id)} aria-label="삭제" className="text-faint hover:text-danger text-sm shrink-0 px-1">
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
