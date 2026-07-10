import { addMeal, deleteMeal, useMeals, useQuickMenus, useSettings } from '../lib/store'
import { DEFAULT_QUICK_MENUS } from '../lib/constants'
import { getCalorieTargetForDate, getFmdCycleInfo, suggestMealTypeByTime } from '../lib/fmd'
import { todayKey } from '../lib/date'
import { MEAL_TYPE_ICON, MEAL_TYPE_LABEL, type QuickMenu } from '../lib/types'
import CalorieGauge from '../components/CalorieGauge'
import MacroDonut from '../components/MacroDonut'
import SodiumBar from '../components/SodiumBar'
import FmdBadge from '../components/FmdBadge'

function toMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export default function TodayScreen({ onAdd }: { onAdd: () => void }) {
  const settings = useSettings()
  const allMeals = useMeals()
  const customMenus = useQuickMenus()

  const today = todayKey()
  const meals = allMeals.filter(m => m.date === today).sort((a, b) => a.loggedAt.localeCompare(b.loggedAt))

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
      sodium: acc.sodium + m.sodium,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 0 },
  )

  const target = getCalorieTargetForDate(settings)
  const cycle = getFmdCycleInfo(settings.fmdCycleStartDate)
  const quickMenus: QuickMenu[] = [...DEFAULT_QUICK_MENUS, ...customMenus]

  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const loggedTypes = new Set(meals.map(m => m.mealType))
  const missed: string[] = []
  if (!loggedTypes.has('breakfast') && nowMin > toMinutes(settings.breakfastTime) + 60) missed.push('아침')
  if (!loggedTypes.has('lunch') && nowMin > toMinutes(settings.lunchTime) + 60) missed.push('점심')
  if (!loggedTypes.has('dinner') && nowMin > toMinutes(settings.dinnerTime) + 60) missed.push('저녁')

  function quickLog(menu: QuickMenu) {
    addMeal({
      date: todayKey(),
      mealType: suggestMealTypeByTime(),
      menuName: menu.menuName,
      calories: menu.calories,
      protein: menu.protein,
      carbs: menu.carbs,
      fat: menu.fat,
      sodium: menu.sodium,
      inputMethod: 'quick',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <button onClick={onAdd} className="w-full text-left">
          <h1 className="text-white text-xl font-bold mb-1">오늘 뭐 드셨나요?</h1>
          <p className="text-gray-500 text-sm">
            {now.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })} · 탭해서 기록하기
          </p>
        </button>
      </div>

      <FmdBadge cycle={cycle} />

      {missed.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-gray-300 text-sm">
          아직 오늘 {missed.join(', ')} 기록 안 하셨어요
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {quickMenus.map(menu => (
          <button
            key={menu.id}
            onClick={() => quickLog(menu)}
            className="shrink-0 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl px-3 py-2 text-left transition-colors"
          >
            <p className="text-white text-xs font-medium whitespace-nowrap max-w-[140px] truncate">{menu.menuName}</p>
            <p className="text-gray-500 text-[11px] mt-0.5">{menu.calories}kcal</p>
          </button>
        ))}
      </div>

      <section className="bg-gray-900 rounded-xl p-5">
        <CalorieGauge consumed={totals.calories} targetMin={target.min} targetMax={target.max} />
      </section>

      <section className="bg-gray-900 rounded-xl p-5">
        <h2 className="text-white font-bold text-sm mb-3">영양소 비율</h2>
        <MacroDonut protein={totals.protein} carbs={totals.carbs} fat={totals.fat} />
      </section>

      <section className="bg-gray-900 rounded-xl p-5">
        <SodiumBar sodium={totals.sodium} target={settings.targetSodiumMg} />
      </section>

      <section>
        <h2 className="text-white font-bold text-sm mb-3">오늘의 식사</h2>
        {meals.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-6 text-center text-gray-400 text-sm">오늘 기록된 식사가 없어요</div>
        ) : (
          <div className="bg-gray-900 rounded-xl overflow-hidden">
            {meals.map((meal, i) => (
              <div key={meal.id} className={`flex items-center gap-3 px-4 py-3 ${i !== 0 ? 'border-t border-gray-800' : ''}`}>
                <span className="text-xl shrink-0">{MEAL_TYPE_ICON[meal.mealType]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{meal.menuName}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {MEAL_TYPE_LABEL[meal.mealType]} · {Math.round(meal.calories)}kcal · 나트륨 {Math.round(meal.sodium)}mg
                  </p>
                </div>
                <button
                  onClick={() => deleteMeal(meal.id)}
                  aria-label="삭제"
                  className="text-gray-600 hover:text-red-400 text-sm shrink-0 px-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
