import { useState } from 'react'
import { addMeal, addQuickMenu, useQuickMenus, useSettings } from '../lib/store'
import { DEFAULT_QUICK_MENUS } from '../lib/constants'
import { suggestMealTypeByTime } from '../lib/fmd'
import { todayKey } from '../lib/date'
import { MEAL_TYPE_LABEL, type InputMethod, type MealType, type Nutrition, type QuickMenu } from '../lib/types'
import { estimateFromPhoto, estimateFromText, friendlyAiError } from '../lib/ai'
import { resizeImageToDataUrl } from '../lib/resizeImage'

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']
const EMPTY: Nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 0 }

export default function AddScreen({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const settings = useSettings()
  const customMenus = useQuickMenus()
  const quickMenus: QuickMenu[] = [...DEFAULT_QUICK_MENUS, ...customMenus]

  const [mealType, setMealType] = useState<MealType>(suggestMealTypeByTime())
  const [menuName, setMenuName] = useState('')
  const [nutrition, setNutrition] = useState<Nutrition>(EMPTY)
  const [photo, setPhoto] = useState<string | null>(null)
  const [inputMethod, setInputMethod] = useState<InputMethod>('text')
  const [saveAsQuick, setSaveAsQuick] = useState(false)
  const [estimating, setEstimating] = useState(false)
  const [error, setError] = useState('')

  const hasKey = settings.anthropicApiKey.trim().length > 0

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

  function handleSave() {
    if (!menuName.trim()) {
      setError('메뉴 이름을 입력해주세요.')
      return
    }
    addMeal({ date: todayKey(), mealType, menuName: menuName.trim(), ...nutrition, inputMethod })
    if (saveAsQuick) addQuickMenu({ menuName: menuName.trim(), ...nutrition })
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

      {/* 즐겨찾기 */}
      <div className="card p-4">
        <p className="text-muted text-xs font-medium mb-2">즐겨찾는 메뉴</p>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
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
        <label className="text-muted text-xs font-medium mb-1.5 block px-1">메뉴 이름</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={menuName}
            onChange={e => setMenuName(e.target.value)}
            placeholder="예: 김치찌개 백반"
            className="field flex-1"
          />
          <button
            onClick={handleEstimateText}
            disabled={estimating || !menuName.trim()}
            className="btn-primary text-sm px-4 shrink-0"
          >
            {estimating ? '추정 중…' : 'AI 추정'}
          </button>
        </div>
      </div>

      {/* 사진 */}
      <div>
        <label className="text-muted text-xs font-medium mb-1.5 block px-1">사진으로 인식</label>
        <label className="flex items-center justify-center gap-2 bg-surface border border-dashed border-line rounded-xl px-4 py-4 text-muted text-sm cursor-pointer hover:border-navy transition-colors">
          📷 {photo ? '사진 다시 선택' : '음식 사진 선택'}
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} disabled={estimating} />
        </label>
        {photo && <img src={photo} alt="업로드한 음식 사진" className="mt-2 w-full max-h-48 object-cover rounded-xl" />}
      </div>

      {/* 영양정보 */}
      <div className="card p-4">
        <p className="text-muted text-xs font-medium mb-3">영양정보 (직접 수정 가능)</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="칼로리 (kcal)" value={nutrition.calories} onChange={v => setField('calories', v)} />
          <Field label="나트륨 (mg)" value={nutrition.sodium} onChange={v => setField('sodium', v)} />
          <Field label="단백질 (g)" value={nutrition.protein} onChange={v => setField('protein', v)} />
          <Field label="탄수화물 (g)" value={nutrition.carbs} onChange={v => setField('carbs', v)} />
          <Field label="지방 (g)" value={nutrition.fat} onChange={v => setField('fat', v)} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-muted text-sm px-1">
        <input type="checkbox" checked={saveAsQuick} onChange={e => setSaveAsQuick(e.target.checked)} className="accent-navy w-4 h-4" />
        나만의 메뉴에 저장 (다음에 한 번에 기록)
      </label>

      {error && <p className="text-danger text-sm px-1">{error}</p>}

      <button onClick={handleSave} className="btn-primary w-full py-3.5">
        기록하기
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
