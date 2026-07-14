import { useState } from 'react'
import { addMeal, addQuickMenu, useQuickMenus, useSettings } from '../lib/store'
import { DEFAULT_QUICK_MENUS } from '../lib/constants'
import { suggestMealTypeByTime } from '../lib/fmd'
import { formatDateKeyKorean, todayKey } from '../lib/date'
import { MEAL_TYPE_LABEL, type InputMethod, type MealType, type Nutrition, type QuickMenu } from '../lib/types'
import { estimateFromPhoto, estimateFromText, friendlyAiError } from '../lib/ai'
import { resizeImageToDataUrl } from '../lib/resizeImage'

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']
const EMPTY: Nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 0 }

interface DraftItem extends Nutrition {
  menuName: string
  inputMethod: InputMethod
  saveAsQuick: boolean
}

export default function AddScreen({ date, onDone, onCancel }: { date: string; onDone: () => void; onCancel: () => void }) {
  const settings = useSettings()
  const customMenus = useQuickMenus()
  const quickMenus: QuickMenu[] = [...DEFAULT_QUICK_MENUS, ...customMenus]

  const [mealDate, setMealDate] = useState(date)
  const [mealType, setMealType] = useState<MealType>(suggestMealTypeByTime())
  const [items, setItems] = useState<DraftItem[]>([])

  // 현재 편집 중인 항목
  const [menuName, setMenuName] = useState('')
  const [nutrition, setNutrition] = useState<Nutrition>(EMPTY)
  const [photo, setPhoto] = useState<string | null>(null)
  const [inputMethod, setInputMethod] = useState<InputMethod>('text')
  const [saveAsQuick, setSaveAsQuick] = useState(false)

  const [estimating, setEstimating] = useState(false)
  const [error, setError] = useState('')

  const hasKey = settings.anthropicApiKey.trim().length > 0
  const currentFilled = menuName.trim().length > 0
  const totalCount = items.length + (currentFilled ? 1 : 0)
  const listCalories = items.reduce((s, it) => s + it.calories, 0)

  async function handleEstimateText() {
    if (!menuName.trim()) return
    if (!hasKey) {
      setError('AI 추정을 쓰려면 설정에서 Anthropic API 키를 먼저 입력해주세요.')
      return
    }
    setEstimating(true)
    setError('')
    try {
      const n = await estimateFromText(menuName, settings.anthropicApiKey, settings.aiModel)
      setNutrition(n)
      setInputMethod('text')
    } catch (e) {
      setError(friendlyAiError(e))
    } finally {
      setEstimating(false)
    }
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!hasKey) {
      setError('사진 인식을 쓰려면 설정에서 Anthropic API 키를 먼저 입력해주세요.')
      return
    }
    setEstimating(true)
    setError('')
    try {
      const dataUrl = await resizeImageToDataUrl(file)
      setPhoto(dataUrl)
      const r = await estimateFromPhoto(dataUrl, settings.anthropicApiKey, settings.aiModel)
      setMenuName(r.menuName)
      setNutrition({ calories: r.calories, protein: r.protein, carbs: r.carbs, fat: r.fat, sodium: r.sodium })
      setInputMethod('photo')
    } catch (err) {
      setError(friendlyAiError(err))
    } finally {
      setEstimating(false)
    }
  }

  function pickQuick(menu: QuickMenu) {
    setMenuName(menu.menuName)
    setNutrition({ calories: menu.calories, protein: menu.protein, carbs: menu.carbs, fat: menu.fat, sodium: menu.sodium })
    setInputMethod('quick')
    setPhoto(null)
  }

  function setField(key: keyof Nutrition, value: string) {
    const n = Number(value)
    setNutrition(prev => ({ ...prev, [key]: Number.isFinite(n) ? n : 0 }))
  }

  function resetCurrent() {
    setMenuName('')
    setNutrition(EMPTY)
    setPhoto(null)
    setInputMethod('text')
    setSaveAsQuick(false)
  }

  function addToList() {
    if (!menuName.trim()) {
      setError('메뉴 이름을 입력해주세요.')
      return
    }
    setItems(prev => [...prev, { menuName: menuName.trim(), ...nutrition, inputMethod, saveAsQuick }])
    resetCurrent()
    setError('')
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  function handleSave() {
    const finalItems = [...items]
    if (currentFilled) finalItems.push({ menuName: menuName.trim(), ...nutrition, inputMethod, saveAsQuick })
    if (finalItems.length === 0) {
      setError('메뉴를 하나 이상 추가해주세요.')
      return
    }
    for (const it of finalItems) {
      addMeal({
        date: mealDate,
        mealType,
        menuName: it.menuName,
        calories: it.calories,
        protein: it.protein,
        carbs: it.carbs,
        fat: it.fat,
        sodium: it.sodium,
        inputMethod: it.inputMethod,
      })
      if (it.saveAsQuick) addQuickMenu({ menuName: it.menuName, calories: it.calories, protein: it.protein, carbs: it.carbs, fat: it.fat, sodium: it.sodium })
    }
    onDone()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-ink text-2xl font-extrabold">식사 기록</h1>
        <button onClick={onCancel} className="text-muted hover:text-ink text-sm">
          취소
        </button>
      </div>

      {/* 날짜 */}
      <div className="card p-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-muted text-xs font-medium">기록할 날짜</p>
          <p className="text-ink text-sm font-semibold mt-0.5">
            {mealDate === todayKey() ? '오늘 · ' : ''}
            {formatDateKeyKorean(mealDate)}
          </p>
        </div>
        <input
          type="date"
          value={mealDate}
          max={todayKey()}
          onChange={e => setMealDate(e.target.value || todayKey())}
          className="field w-auto"
        />
      </div>

      {/* 끼니 */}
      <div className="grid grid-cols-4 gap-2">
        {MEAL_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setMealType(t)}
            className={`py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              mealType === t ? 'bg-navy text-white' : 'card text-muted hover:text-ink'
            }`}
          >
            {MEAL_TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      {/* 담은 목록 */}
      {items.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-ink text-sm font-bold">담은 메뉴 {items.length}개</p>
            <span className="text-gold text-sm font-bold">{Math.round(listCalories)}kcal</span>
          </div>
          <div className="space-y-1.5">
            {items.map((it, i) => (
              <div key={i} className="flex items-center gap-2 bg-canvas rounded-xl px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-ink text-sm truncate">{it.menuName}</p>
                  <p className="text-faint text-[11px] mt-0.5">{Math.round(it.calories)}kcal · 나트륨 {Math.round(it.sodium)}mg</p>
                </div>
                <button onClick={() => removeItem(i)} aria-label="목록에서 제거" className="text-faint hover:text-danger text-sm px-1">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 현재 항목 입력 */}
      <div className="card p-4 space-y-4">
        <p className="text-ink text-sm font-bold">{items.length > 0 ? '메뉴 더 추가' : '메뉴 추가'}</p>

        {/* 즐겨찾기 */}
        <div>
          <p className="text-muted text-xs font-medium mb-2">즐겨찾는 메뉴 (탭하면 아래에 채워져요)</p>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {quickMenus.map(menu => (
              <button
                key={menu.id}
                onClick={() => pickQuick(menu)}
                className="bg-canvas hover:bg-line rounded-xl px-3 py-2 text-left transition-colors"
              >
                <p className="text-ink text-xs font-semibold truncate">{menu.menuName}</p>
                <p className="text-gold text-[11px] font-medium mt-0.5">{menu.calories}kcal</p>
              </button>
            ))}
          </div>
        </div>

        {/* 메뉴 이름 + AI */}
        <div>
          <label className="text-muted text-xs font-medium mb-1.5 block">메뉴 이름</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={menuName}
              onChange={e => setMenuName(e.target.value)}
              placeholder="예: 김치찌개 백반"
              className="field flex-1"
            />
            <button onClick={handleEstimateText} disabled={estimating || !menuName.trim()} className="btn-primary text-sm px-4 shrink-0">
              {estimating ? '추정 중…' : 'AI 추정'}
            </button>
          </div>
        </div>

        {/* 사진: 촬영 + 사진첩 */}
        <div>
          <label className="text-muted text-xs font-medium mb-1.5 block">사진으로 인식</label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center justify-center gap-1.5 bg-surface border border-dashed border-line rounded-xl px-3 py-3 text-muted text-sm cursor-pointer hover:border-navy transition-colors">
              📷 카메라 촬영
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} disabled={estimating} />
            </label>
            <label className="flex items-center justify-center gap-1.5 bg-surface border border-dashed border-line rounded-xl px-3 py-3 text-muted text-sm cursor-pointer hover:border-navy transition-colors">
              🖼️ 사진첩에서 선택
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} disabled={estimating} />
            </label>
          </div>
          {photo && <img src={photo} alt="선택한 음식 사진" className="mt-2 w-full max-h-44 object-cover rounded-xl" />}
        </div>

        {/* 영양정보 */}
        <div>
          <p className="text-muted text-xs font-medium mb-3">영양정보 (직접 수정 가능)</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="칼로리 (kcal)" value={nutrition.calories} onChange={v => setField('calories', v)} />
            <Field label="나트륨 (mg)" value={nutrition.sodium} onChange={v => setField('sodium', v)} />
            <Field label="단백질 (g)" value={nutrition.protein} onChange={v => setField('protein', v)} />
            <Field label="탄수화물 (g)" value={nutrition.carbs} onChange={v => setField('carbs', v)} />
            <Field label="지방 (g)" value={nutrition.fat} onChange={v => setField('fat', v)} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-muted text-sm">
          <input type="checkbox" checked={saveAsQuick} onChange={e => setSaveAsQuick(e.target.checked)} className="accent-navy w-4 h-4" />
          나만의 메뉴에 저장
        </label>

        <button
          onClick={addToList}
          disabled={!currentFilled}
          className="w-full border-2 border-dashed border-navy/30 text-navy font-semibold py-2.5 rounded-xl disabled:opacity-40 hover:bg-navy/[0.04] transition-colors"
        >
          ＋ 이 메뉴 목록에 추가
        </button>
      </div>

      {error && <p className="text-danger text-sm px-1">{error}</p>}

      <button onClick={handleSave} disabled={totalCount === 0} className="btn-primary w-full py-3.5">
        {totalCount > 0 ? `${totalCount}개 메뉴 기록하기` : '기록하기'}
      </button>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-faint text-[11px] mb-1 block">{label}</label>
      <input type="number" inputMode="numeric" value={value} onChange={e => onChange(e.target.value)} className="field" />
    </div>
  )
}
