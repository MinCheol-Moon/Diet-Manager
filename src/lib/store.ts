import { useSyncExternalStore } from 'react'
import { DEFAULT_SETTINGS } from './constants'
import { makeId, readJson, writeJson } from './storage'
import type { Meal, QuickMenu, Settings, WeightLog } from './types'

const KEYS = {
  meals: 'meals',
  settings: 'settings',
  quickMenus: 'quickMenus',
  weightLogs: 'weightLogs',
} as const

// ---- pub/sub ----
const listeners = new Set<() => void>()
function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
function emit() {
  listeners.forEach(l => l())
}

// 다른 탭에서의 변경도 반영
if (typeof window !== 'undefined') {
  window.addEventListener('storage', () => emit())
}

// ---- raw getters (snapshot 캐시로 useSyncExternalStore 무한루프 방지) ----
let mealsCache: Meal[] | null = null
let settingsCache: Settings | null = null
let quickMenusCache: QuickMenu[] | null = null
let weightCache: WeightLog[] | null = null

function getMeals(): Meal[] {
  if (mealsCache === null) mealsCache = readJson<Meal[]>(KEYS.meals, [])
  return mealsCache
}
function getSettings(): Settings {
  if (settingsCache === null) settingsCache = { ...DEFAULT_SETTINGS, ...readJson<Partial<Settings>>(KEYS.settings, {}) }
  return settingsCache
}
function getQuickMenus(): QuickMenu[] {
  if (quickMenusCache === null) quickMenusCache = readJson<QuickMenu[]>(KEYS.quickMenus, [])
  return quickMenusCache
}
function getWeightLogs(): WeightLog[] {
  if (weightCache === null) weightCache = readJson<WeightLog[]>(KEYS.weightLogs, [])
  return weightCache
}

function setMeals(next: Meal[]) {
  mealsCache = next
  writeJson(KEYS.meals, next)
  emit()
}
function setQuickMenus(next: QuickMenu[]) {
  quickMenusCache = next
  writeJson(KEYS.quickMenus, next)
  emit()
}
function setWeightLogs(next: WeightLog[]) {
  weightCache = next
  writeJson(KEYS.weightLogs, next)
  emit()
}

// ---- mutations ----
export function addMeal(meal: Omit<Meal, 'id' | 'loggedAt'>): void {
  const full: Meal = { ...meal, id: makeId(), loggedAt: new Date().toISOString() }
  setMeals([...getMeals(), full])
}

export function deleteMeal(id: string): void {
  setMeals(getMeals().filter(m => m.id !== id))
}

export function updateSettings(patch: Partial<Settings>): void {
  settingsCache = { ...getSettings(), ...patch }
  writeJson(KEYS.settings, settingsCache)
  emit()
}

export function addQuickMenu(menu: Omit<QuickMenu, 'id' | 'isCustom'>): void {
  const full: QuickMenu = { ...menu, id: makeId(), isCustom: true }
  setQuickMenus([full, ...getQuickMenus()])
}

export function deleteQuickMenu(id: string): void {
  setQuickMenus(getQuickMenus().filter(m => m.id !== id))
}

export function upsertWeight(date: string, weightKg: number): void {
  const rest = getWeightLogs().filter(w => w.date !== date)
  const next = [...rest, { date, weightKg }].sort((a, b) => a.date.localeCompare(b.date))
  setWeightLogs(next)
}

// ---- hooks ----
export function useMeals(): Meal[] {
  return useSyncExternalStore(subscribe, getMeals)
}
export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, getSettings)
}
export function useQuickMenus(): QuickMenu[] {
  return useSyncExternalStore(subscribe, getQuickMenus)
}
export function useWeightLogs(): WeightLog[] {
  return useSyncExternalStore(subscribe, getWeightLogs)
}

// ---- data management ----
export function exportAll(): string {
  return JSON.stringify(
    {
      meals: getMeals(),
      settings: getSettings(),
      quickMenus: getQuickMenus(),
      weightLogs: getWeightLogs(),
    },
    null,
    2,
  )
}

export function clearAll(): void {
  setMeals([])
  setQuickMenus([])
  setWeightLogs([])
  settingsCache = { ...DEFAULT_SETTINGS }
  writeJson(KEYS.settings, settingsCache)
  emit()
}
