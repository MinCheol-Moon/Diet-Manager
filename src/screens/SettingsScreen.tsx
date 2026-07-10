import { useState } from 'react'
import { clearAll, deleteQuickMenu, exportAll, updateSettings, useQuickMenus, useSettings } from '../lib/store'
import { AI_MODELS } from '../lib/constants'

export default function SettingsScreen() {
  const settings = useSettings()
  const customMenus = useQuickMenus()
  const [savedMsg, setSavedMsg] = useState('')

  function flash(msg: string) {
    setSavedMsg(msg)
    window.setTimeout(() => setSavedMsg(''), 2000)
  }

  function num(key: keyof typeof settings, value: string) {
    const n = Number(value)
    updateSettings({ [key]: Number.isFinite(n) ? n : 0 })
  }

  async function toggleNotifications(checked: boolean) {
    if (checked && typeof Notification !== 'undefined') {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') {
        flash('브라우저에서 알림 권한이 거부되었어요.')
        return
      }
    }
    updateSettings({ notificationsEnabled: checked })
  }

  function handleExport() {
    const blob = new Blob([exportAll()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diet-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleReset() {
    if (confirm('모든 기록과 설정을 삭제할까요? 이 작업은 되돌릴 수 없어요.')) {
      clearAll()
      flash('모든 데이터를 삭제했어요.')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-white text-xl font-bold">설정</h1>

      <Section title="프로필">
        <div className="grid grid-cols-2 gap-3">
          <Field label="키 (cm)" type="number" value={settings.heightCm} onChange={v => num('heightCm', v)} />
          <Field label="공복 체중 (kg)" type="number" step="0.1" value={settings.weightKg} onChange={v => num('weightKg', v)} />
        </div>
      </Section>

      <Section title="일일 목표">
        <div className="grid grid-cols-2 gap-3">
          <Field label="최소 칼로리 (kcal)" type="number" value={settings.targetCaloriesMin} onChange={v => num('targetCaloriesMin', v)} />
          <Field label="최대 칼로리 (kcal)" type="number" value={settings.targetCaloriesMax} onChange={v => num('targetCaloriesMax', v)} />
        </div>
        <Field label="나트륨 목표 (mg)" type="number" value={settings.targetSodiumMg} onChange={v => num('targetSodiumMg', v)} />
      </Section>

      <Section title="FMD (단식모방식단)">
        <div className="grid grid-cols-2 gap-3">
          <Field label="1일차 칼로리" type="number" value={settings.fmdDay1Calories} onChange={v => num('fmdDay1Calories', v)} />
          <Field label="2~5일차 칼로리" type="number" value={settings.fmdDay2to5Calories} onChange={v => num('fmdDay2to5Calories', v)} />
        </div>
        <div>
          <label className="text-gray-500 text-[11px] mb-1 block">사이클 시작일 (25일 일반식 + 5일 FMD)</label>
          <input
            type="date"
            value={settings.fmdCycleStartDate ?? ''}
            onChange={e => updateSettings({ fmdCycleStartDate: e.target.value || null })}
            className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </Section>

      <Section title="식사 시간 알림">
        <div className="grid grid-cols-3 gap-3">
          <Field label="아침" type="time" value={settings.breakfastTime} onChange={v => updateSettings({ breakfastTime: v })} />
          <Field label="점심" type="time" value={settings.lunchTime} onChange={v => updateSettings({ lunchTime: v })} />
          <Field label="저녁" type="time" value={settings.dinnerTime} onChange={v => updateSettings({ dinnerTime: v })} />
        </div>
        <label className="flex items-center gap-2 text-gray-400 text-sm pt-1">
          <input type="checkbox" checked={settings.notificationsEnabled} onChange={e => toggleNotifications(e.target.checked)} className="accent-emerald-600" />
          앱을 열어둔 동안 식사·나트륨 알림 받기
        </label>
        <p className="text-gray-600 text-xs">브라우저 알림은 앱이 열려 있을 때만 동작해요. iOS Safari는 백그라운드 푸시를 지원하지 않아요.</p>
      </Section>

      <Section title="AI 추정">
        <div>
          <label className="text-gray-500 text-[11px] mb-1 block">Anthropic API 키 (브라우저에만 저장됨)</label>
          <input
            type="password"
            value={settings.anthropicApiKey}
            onChange={e => updateSettings({ anthropicApiKey: e.target.value })}
            placeholder="sk-ant-..."
            className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="text-gray-500 text-[11px] mb-1 block">사용할 모델</label>
          <select
            value={settings.aiModel}
            onChange={e => updateSettings({ aiModel: e.target.value })}
            className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
          >
            {AI_MODELS.map(m => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <p className="text-gray-600 text-xs">
          메뉴 이름·사진 인식 시 본인 키로 Claude API를 직접 호출해요. 키는 서버로 전송되지 않고 이 기기에만 저장됩니다.
        </p>
      </Section>

      <Section title="나만의 메뉴 관리">
        {customMenus.length === 0 ? (
          <p className="text-gray-500 text-sm">추가한 나만의 메뉴가 없어요. 기록 화면에서 추가할 수 있어요.</p>
        ) : (
          <div className="space-y-2">
            {customMenus.map(menu => (
              <div key={menu.id} className="flex items-center justify-between bg-gray-950 rounded-xl px-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{menu.menuName}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{menu.calories}kcal</p>
                </div>
                <button onClick={() => deleteQuickMenu(menu.id)} className="text-gray-600 hover:text-red-400 text-sm shrink-0 px-1">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="데이터">
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
            백업 내보내기 (JSON)
          </button>
          <button onClick={handleReset} className="flex-1 bg-red-900/40 hover:bg-red-900/60 text-red-300 text-sm font-medium py-2.5 rounded-xl transition-colors">
            전체 초기화
          </button>
        </div>
      </Section>

      {savedMsg && <p className="text-emerald-400 text-sm text-center">{savedMsg}</p>}
      <p className="text-gray-600 text-xs text-center pb-2">변경 사항은 자동으로 저장돼요.</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-gray-900 rounded-xl p-5 space-y-3">
      <h2 className="text-white font-bold text-sm">{title}</h2>
      {children}
    </section>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  step,
}: {
  label: string
  value: string | number
  onChange: (v: string) => void
  type?: string
  step?: string
}) {
  return (
    <div>
      <label className="text-gray-500 text-[11px] mb-1 block">{label}</label>
      <input
        type={type}
        step={step}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
      />
    </div>
  )
}
