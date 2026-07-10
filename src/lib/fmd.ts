import { FMD_CYCLE_LENGTH, FMD_DAYS_IN_CYCLE } from './constants'
import { parseDateKey, toDateKey } from './date'
import type { MealType, Settings } from './types'

export interface FmdCycleInfo {
  dayInCycle: number // 1..30
  isFmdDay: boolean
  fmdDayNumber: number | null // 1..5 when isFmdDay
}

export function getFmdCycleInfo(fmdCycleStartDate: string | null, forDate: Date = new Date()): FmdCycleInfo | null {
  if (!fmdCycleStartDate) return null

  const start = parseDateKey(fmdCycleStartDate)
  const target = parseDateKey(toDateKey(forDate))

  const diffDays = Math.floor((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return null

  const dayInCycle = (diffDays % FMD_CYCLE_LENGTH) + 1
  const isFmdDay = dayInCycle > FMD_CYCLE_LENGTH - FMD_DAYS_IN_CYCLE
  const fmdDayNumber = isFmdDay ? dayInCycle - (FMD_CYCLE_LENGTH - FMD_DAYS_IN_CYCLE) : null

  return { dayInCycle, isFmdDay, fmdDayNumber }
}

export function getCalorieTargetForDate(settings: Settings, forDate: Date = new Date()) {
  const cycle = getFmdCycleInfo(settings.fmdCycleStartDate, forDate)

  if (cycle?.isFmdDay) {
    const target = cycle.fmdDayNumber === 1 ? settings.fmdDay1Calories : settings.fmdDay2to5Calories
    return { min: target, max: target, isFmd: true, fmdDayNumber: cycle.fmdDayNumber }
  }

  return { min: settings.targetCaloriesMin, max: settings.targetCaloriesMax, isFmd: false, fmdDayNumber: null }
}

export function suggestMealTypeByTime(date: Date = new Date()): MealType {
  const hour = date.getHours()
  if (hour < 10) return 'breakfast'
  if (hour < 15) return 'lunch'
  if (hour < 21) return 'dinner'
  return 'snack'
}
