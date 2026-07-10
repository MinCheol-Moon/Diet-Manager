import { useEffect, useRef } from 'react'
import { todayKey } from './date'
import type { Meal, MealType, Settings } from './types'

const REMINDER_MEALS: { type: MealType; timeKey: 'breakfastTime' | 'lunchTime' | 'dinnerTime'; label: string }[] = [
  { type: 'breakfast', timeKey: 'breakfastTime', label: '아침' },
  { type: 'lunch', timeKey: 'lunchTime', label: '점심' },
  { type: 'dinner', timeKey: 'dinnerTime', label: '저녁' },
]

function toMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/**
 * 앱이 열려 있는 동안 식사 시간대에 브라우저 알림을 띄운다.
 * (PWA 특성상 백그라운드 푸시는 지원하지 않으므로 foreground 알림만 제공)
 */
export function useMealReminders(settings: Settings, meals: Meal[]) {
  const firedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!settings.notificationsEnabled) return
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return

    function check() {
      const now = new Date()
      const nowMin = now.getHours() * 60 + now.getMinutes()
      const today = todayKey()
      const loggedTypes = new Set(meals.filter(m => m.date === today).map(m => m.mealType))

      for (const r of REMINDER_MEALS) {
        const target = toMinutes(settings[r.timeKey])
        // 식사 시간 ~ +30분 사이, 아직 기록 안 했고 오늘 아직 알림 안 보냈으면 알림
        const fireKey = `${today}-${r.type}`
        if (nowMin >= target && nowMin <= target + 30 && !loggedTypes.has(r.type) && !firedRef.current.has(fireKey)) {
          firedRef.current.add(fireKey)
          new Notification('식단관리', { body: `${r.label} 식사 시간이에요. 오늘 ${r.label} 기록을 잊지 마세요!`, icon: '/icon.svg' })
        }
      }

      // 나트륨 초과 경고 (하루 1회)
      const todaySodium = meals.filter(m => m.date === today).reduce((s, m) => s + m.sodium, 0)
      const sodiumKey = `${today}-sodium`
      if (todaySodium > settings.targetSodiumMg && !firedRef.current.has(sodiumKey)) {
        firedRef.current.add(sodiumKey)
        new Notification('식단관리', { body: `오늘 나트륨 섭취가 ${settings.targetSodiumMg}mg를 초과했어요.`, icon: '/icon.svg' })
      }
    }

    check()
    const id = window.setInterval(check, 60_000)
    return () => window.clearInterval(id)
  }, [settings, meals])
}
