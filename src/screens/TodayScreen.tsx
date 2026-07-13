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
    <div className="space-y-5">
      {/* 히어로 */}
      <section className="hero p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/55 text-xs">{now.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}</p>
            <h1 className="text-white text-xl font-bold mt-1">오늘의 식단</h1>
          </div>
          <FmdBadge cycle={cycle} />
        </div>
        <CalorieGauge consumed={totals.calories} targetMin={target.min} targetMax={target.max} />
      </section>

      {/* 미기록 리마인더 */}
      {missed.length > 0 && (
        <button onClick={onAdd} className="w-full card px-4 py-3 flex items-center gap-3 text-left">
          <span className="text-lg">🍽️</span>
          <span className="text-ink text-sm">
            아직 오늘 <span className="font-semibold">{missed.join(', ')}</span> 기록 안 하셨어요
          </span>
          <span className="ml-auto text-faint text-sm">＋</span>
        </button>
      )}

      {/* 즐겨찾는 메뉴 */}
      <div>
        <p className="text-muted text-xs font-medium mb-2 px-1">즐겨찾는 메뉴 · 탭하면 바로 기록</p>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {quickMenus.map(menu => (
            <button
              key={menu.id}
              onClick={() => quickLog(menu)}
              className="shrink-0 card px-3.5 py-2.5 text-left active:scale-[0.97] transition-transform"
            >
              <p className="text-ink text-xs font-semibold whitespace-nowrap max-w-[150px] truncate">{menu.menuName}</p>
              <p className="text-gold text-[11px] font-medium mt-0.5">{menu.calories}kcal</p>
            </button>
          ))}
        </div>
      </div>

      {/* 영양소 비율 */}
      <section className="card p-5">
        <h2 className="text-ink font-bold text-sm mb-3">영양소 비율</h2>
        <MacroDonut protein={totals.protein} carbs={totals.carbs} fat={totals.fat} />
      </section>

      {/* 나트륨 */}
      <section className="card p-5">
        <SodiumBar sodium={totals.sodium} target={settings.targetSodiumMg} />
      </section>

      {/* 오늘의 식사 */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-ink font-bold text-base">오늘의 식사</h2>
          <button onClick={onAdd} className="text-navy text-sm font-semibold">＋ 기록하기</button>
        </div>
        {meals.length === 0 ? (
          <button onClick={onAdd} className="w-full card p-8 text-center text-faint text-sm">
            오늘 뭐 드셨나요? <span className="text-navy font-semibold">탭해서 기록하기</span>
          </button>
        ) : (
          <div className="card overflow-hidden">
            {meals.map((meal, i) => (
              <div key={meal.id} className={`flex items-center gap-3 px-4 py-3 ${i !== 0 ? 'border-t border-line' : ''}`}>
                <span className="text-xl shrink-0">{MEAL_TYPE_ICON[meal.mealType]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-ink text-sm font-medium truncate">{meal.menuName}</p>
                  <p className="text-faint text-xs mt-0.5">
                    {MEAL_TYPE_LABEL[meal.mealType]} · {Math.round(meal.calories)}kcal · 나트륨 {Math.round(meal.sodium)}mg
                  </p>
                </div>
                <button
                  onClick={() => deleteMeal(meal.id)}
                  aria-label="삭제"
                  className="text-faint hover:text-danger text-sm shrink-0 px-1"
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
