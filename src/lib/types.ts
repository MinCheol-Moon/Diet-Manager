export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export const MEAL_TYPE_LABEL: Record<MealType, string> = {
  breakfast: '아침',
  lunch: '점심',
  dinner: '저녁',
  snack: '간식',
}

export const MEAL_TYPE_ICON: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '🍚',
  dinner: '🌙',
  snack: '🍎',
}

export type InputMethod = 'text' | 'photo' | 'quick'

export interface Nutrition {
  calories: number
  protein: number
  carbs: number
  fat: number
  sodium: number
}

export interface Meal extends Nutrition {
  id: string
  date: string // YYYY-MM-DD
  mealType: MealType
  menuName: string
  inputMethod: InputMethod
  loggedAt: string // ISO
}

export interface QuickMenu extends Nutrition {
  id: string
  menuName: string
  isCustom?: boolean
}

export interface Settings {
  heightCm: number
  weightKg: number
  targetCaloriesMin: number
  targetCaloriesMax: number
  targetSodiumMg: number
  fmdDay1Calories: number
  fmdDay2to5Calories: number
  breakfastTime: string
  lunchTime: string
  dinnerTime: string
  fmdCycleStartDate: string | null
  notificationsEnabled: boolean
  anthropicApiKey: string
  aiModel: string
}

export interface WeightLog {
  date: string // YYYY-MM-DD
  weightKg: number
}
