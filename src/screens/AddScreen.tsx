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
        <h1 className="text-white text-xl font-bold">식사 기록하기</h1>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-300 text-sm">
          취소
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {MEAL_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setMealType(t)}
            className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
              mealType === t ? 'bg-emerald-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
            }`}
          >
            {MEAL_TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      <div>
        <p className="text-gray-400 text-xs mb-2">즐겨찾는 메뉴</p>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {quickMenus.map(menu => (
            <button
              key={menu.id}
              onClick={() => pickQuick(menu)}
              className="bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl px-3 py-2 text-left transition-colors"
            >
              <p className="text-white text-xs font-medium truncate">{menu.menuName}</p>
              <p className="text-gray-500 text-[11px] mt-0.5">{menu.calories}kcal</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-gray-400 text-xs mb-1.5 block">메뉴 이름</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={menuName}
            onChange={e => setMenuName(e.target.value)}
            placeholder="예: 김치찌개 백반"
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleEstimateText}
            disabled={estimating || !menuName.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-semibold px-4 rounded-xl transition-colors shrink-0"
          >
            {estimating ? '추정 중…' : 'AI 추정'}
          </button>
        </div>
      </div>

      <div>
        <label className="text-gray-400 text-xs mb-1.5 block">사진으로 인식</label>
        <label className="flex items-center justify-center gap-2 bg-gray-900 border border-dashed border-gray-700 rounded-xl px-4 py-4 text-gray-400 text-sm cursor-pointer hover:border-emerald-500 transition-colors">
          📷 {photo ? '사진 다시 선택' : '음식 사진 선택'}
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} disabled={estimating} />
        </label>
        {photo && <img src={photo} alt="업로드한 음식 사진" className="mt-2 w-full max-h-48 object-cover rounded-xl" />}
      </div>

      <div>
        <p className="text-gray-400 text-xs mb-2">영양정보 (직접 수정 가능)</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="칼로리 (kcal)" value={nutrition.calories} onChange={v => setField('calories', v)} />
          <Field label="나트륨 (mg)" value={nutrition.sodium} onChange={v => setField('sodium', v)} />
          <Field label="단백질 (g)" value={nutrition.protein} onChange={v => setField('protein', v)} />
          <Field label="탄수화물 (g)" value={nutrition.carbs} onChange={v => setField('carbs', v)} />
          <Field label="지방 (g)" value={nutrition.fat} onChange={v => setField('fat', v)} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-gray-400 text-sm">
        <input type="checkbox" checked={saveAsQuick} onChange={e => setSaveAsQuick(e.target.checked)} className="accent-emerald-600" />
        나만의 메뉴에 저장 (다음에 한 번에 기록)
      </label>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        onClick={handleSave}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 rounded-xl transition-colors"
      >
        기록하기
      </button>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-gray-500 text-[11px] mb-1 block">{label}</label>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
      />
    </div>
  )
}
