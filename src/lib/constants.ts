import type { QuickMenu, Settings } from './types'

const DEFAULT_AI_MODEL_ID = 'claude-opus-4-8'

// 나만의 메뉴 DB — 기본 내장 메뉴 (탭 한 번으로 바로 기록)
export const DEFAULT_QUICK_MENUS: QuickMenu[] = [
  { id: 'q1', menuName: '포크 함박 스테이크', calories: 630, protein: 23, carbs: 94, fat: 18, sodium: 510 },
  { id: 'q2', menuName: '양념치킨 도시락', calories: 560, protein: 32, carbs: 95, fat: 6, sodium: 640 },
  { id: 'q3', menuName: '마크니커리 덮밥', calories: 450, protein: 38, carbs: 55, fat: 9, sodium: 820 },
  { id: 'q4', menuName: '일본카레 덮밥', calories: 470, protein: 37, carbs: 60, fat: 9, sodium: 850 },
  { id: 'q5', menuName: '비프 함박 스테이크', calories: 635, protein: 22, carbs: 103, fat: 15, sodium: 710 },
  { id: 'q6', menuName: '바베큐 도시락', calories: 550, protein: 33, carbs: 87, fat: 8, sodium: 840 },
  { id: 'q7', menuName: '중화짜장 도시락', calories: 430, protein: 32, carbs: 53, fat: 10, sodium: 875 },
  { id: 'q8', menuName: '갈비 닭가슴살 스테이크', calories: 565, protein: 31, carbs: 82, fat: 13, sodium: 920 },
  { id: 'q9', menuName: '닭가슴살 갈릭 볶음밥', calories: 440, protein: 23, carbs: 73, fat: 6, sodium: 700 },
  { id: 'q10', menuName: '닭가슴살 소불고기 볶음밥', calories: 415, protein: 22, carbs: 64, fat: 8, sodium: 860 },
  { id: 'q11', menuName: '닭가슴살 감자탕 볶음밥', calories: 430, protein: 23, carbs: 64, fat: 9, sodium: 1130 },
  { id: 'q12', menuName: '닭가슴살 간장계란 볶음밥', calories: 455, protein: 25, carbs: 73, fat: 7, sodium: 1040 },
  { id: 'q13', menuName: '콘치즈 닭갈비 주먹밥 (100g)', calories: 230, protein: 5, carbs: 33, fat: 9, sodium: 420 },
  { id: 'q14', menuName: '제육볶음 주먹밥 (100g)', calories: 195, protein: 5, carbs: 35, fat: 4, sodium: 520 },
  { id: 'q15', menuName: '소불고기 주먹밥 (100g)', calories: 210, protein: 5, carbs: 33, fat: 6, sodium: 560 },
  { id: 'q16', menuName: 'FMD 채소수프+견과류 (아침)', calories: 220, protein: 0, carbs: 0, fat: 0, sodium: 0 },
  { id: 'q17', menuName: 'FMD 샐러드+두부 (점심)', calories: 300, protein: 0, carbs: 0, fat: 0, sodium: 0 },
  { id: 'q18', menuName: 'FMD 데친채소 (저녁)', calories: 230, protein: 0, carbs: 0, fat: 0, sodium: 0 },
]

export const DEFAULT_SETTINGS: Settings = {
  heightCm: 174,
  weightKg: 85.5,
  targetCaloriesMin: 1900,
  targetCaloriesMax: 2100,
  targetSodiumMg: 2000,
  fmdDay1Calories: 1100,
  fmdDay2to5Calories: 780,
  breakfastTime: '08:00',
  lunchTime: '12:30',
  dinnerTime: '19:00',
  fmdCycleStartDate: null,
  notificationsEnabled: false,
  anthropicApiKey: '',
  aiModel: DEFAULT_AI_MODEL_ID,
}

// FMD 사이클: 25일 일반식 + 5일 FMD = 30일 주기
export const FMD_CYCLE_LENGTH = 30
export const FMD_DAYS_IN_CYCLE = 5

// AI 추정에 사용할 Claude 모델 (개인 키로 호출하므로 사용자가 비용에 맞춰 선택 가능)
export const AI_MODELS = [
  { id: 'claude-opus-4-8', label: 'Opus 4.8 (가장 정확)' },
  { id: 'claude-sonnet-5', label: 'Sonnet 5 (균형)' },
  { id: 'claude-haiku-4-5', label: 'Haiku 4.5 (가장 저렴)' },
] as const

export const DEFAULT_AI_MODEL = DEFAULT_AI_MODEL_ID
