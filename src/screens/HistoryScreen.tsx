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
  const [viewMonth, setViewMonth] = useState(now.getMonth()) // 0-based
  const [selected, setSelected] = useState(toDateKey(now))

  // 날짜별 합계 칼로리
  const kcalByDate = useMemo(() => {
    const m = new Map<string, number>()
    for (const meal of meals) m.set(meal.date, (m.get(meal.date) ?? 0) + meal.calories)
    return m
  }, [meals])

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`

  // 이번 달 요약
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
    <div className="space-y-6">
      <h1 className="text-white text-xl font-bold">기록</h1>

      {/* 월 네비게이션 + 요약 */}
      <section className="bg-gray-900 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 text-lg flex items-center justify-center">
            ‹
          </button>
          <div className="text-center">
            <p className="text-white font-bold">{viewYear}년 {viewMonth + 1}월</p>
            <p className="text-gray-500 text-xs mt-0.5">{loggedDays}일 기록 · 평균 {avgKcal}kcal</p>
          </div>
          <button onClick={nextMonth} className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 text-lg flex items-center justify-center">
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((w, i) => (
            <div key={w} className={`text-center text-[11px] font-medium ${i === 0 ? 'text-red-400' : i === 6 ? 'text-sky-400' : 'text-gray-500'}`}>
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
                  isSelected ? 'bg-emerald-600 text-white' : kcal ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-800'
                } ${isToday && !isSelected ? 'ring-1 ring-emerald-500/60' : ''}`}
              >
                <span className="text-sm leading-none">{day}</span>
                {kcal ? (
                  <span className={`text-[9px] mt-0.5 leading-none ${isSelected ? 'text-emerald-100' : 'text-emerald-400'}`}>
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
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-base">{selLabel}</h2>
          {selectedMeals.length > 0 && (
            <span className="text-emerald-400 text-sm font-medium">{Math.round(selectedTotal.calories)}kcal</span>
          )}
        </div>

        {selectedMeals.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl p-6 text-center text-gray-400 text-sm">이 날은 기록이 없어요</div>
        ) : (
          <div className="space-y-4">
            {MEAL_ORDER.map(type => {
              const items = selectedMeals.filter(m => m.mealType === type)
              if (items.length === 0) return null
              return <MealGroup key={type} type={type} items={items} />
            })}

            <div className="bg-gray-900 rounded-2xl px-4 py-3 flex items-center justify-between text-sm">
              <span className="text-gray-400">하루 합계</span>
              <span className="text-gray-300">
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
    <div className="bg-gray-900 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        <span>{MEAL_TYPE_ICON[type]}</span>
        <span className="text-white text-sm font-semibold">{MEAL_TYPE_LABEL[type]}</span>
        <span className="text-gray-500 text-xs ml-auto">{Math.round(total)}kcal</span>
      </div>
      {items.map(meal => (
        <div key={meal.id} className="flex items-center gap-3 px-4 py-2.5 border-t border-gray-800/70">
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm truncate">{meal.menuName}</p>
            <p className="text-gray-500 text-xs mt-0.5">
              {Math.round(meal.calories)}kcal · 나트륨 {Math.round(meal.sodium)}mg
            </p>
          </div>
          <button onClick={() => deleteMeal(meal.id)} aria-label="삭제" className="text-gray-600 hover:text-red-400 text-sm shrink-0 px-1">
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
