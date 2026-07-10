import Anthropic from '@anthropic-ai/sdk'
import { DEFAULT_AI_MODEL } from './constants'
import type { Nutrition } from './types'

export interface PhotoEstimate extends Nutrition {
  menuName: string
}

function getClient(apiKey: string): Anthropic {
  // 개인용 PWA: 서버가 없어 브라우저에서 직접 Anthropic API를 호출한다.
  // 사용자가 본인 키를 로컬에 저장해 사용하므로 dangerouslyAllowBrowser 를 명시한다.
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
}

const ALLOWED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
type AllowedMediaType = (typeof ALLOWED_MEDIA_TYPES)[number]

function extractJson<T>(text: string): T | null {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    return JSON.parse(match[0]) as T
  } catch {
    return null
  }
}

function toNum(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0
}

function firstText(content: Anthropic.Messages.ContentBlock[]): string {
  const block = content.find(b => b.type === 'text')
  return block && block.type === 'text' ? block.text : ''
}

export async function estimateFromText(menuName: string, apiKey: string, model = DEFAULT_AI_MODEL): Promise<Nutrition> {
  const client = getClient(apiKey)
  const message = await client.messages.create({
    model,
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `다음 음식/메뉴의 1인분 기준 영양정보를 추정해줘: "${menuName.slice(0, 200)}"

반드시 아래 JSON 형식으로만 답변해. 다른 설명이나 마크다운 없이 JSON 객체 하나만 출력해.
{"calories": 숫자, "protein": 숫자, "carbs": 숫자, "fat": 숫자, "sodium": 숫자}

단위: calories(kcal), protein/carbs/fat(g), sodium(mg). 모두 정수로 추정해줘.`,
      },
    ],
  })

  const parsed = extractJson<Record<string, unknown>>(firstText(message.content))
  if (!parsed) throw new Error('영양정보를 추정하지 못했어요. 직접 입력해주세요.')

  return {
    calories: toNum(parsed.calories),
    protein: toNum(parsed.protein),
    carbs: toNum(parsed.carbs),
    fat: toNum(parsed.fat),
    sodium: toNum(parsed.sodium),
  }
}

export async function estimateFromPhoto(imageDataUrl: string, apiKey: string, model = DEFAULT_AI_MODEL): Promise<PhotoEstimate> {
  const match = imageDataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/)
  if (!match) throw new Error('이미지 형식이 올바르지 않아요.')

  const mediaType = match[1] as AllowedMediaType
  const base64Data = match[2]
  if (!ALLOWED_MEDIA_TYPES.includes(mediaType)) {
    throw new Error('지원하지 않는 이미지 형식이에요. (jpeg/png/webp/gif)')
  }

  const client = getClient(apiKey)
  const message = await client.messages.create({
    model,
    max_tokens: 400,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64Data },
          },
          {
            type: 'text',
            text: `이 사진 속 음식을 인식해서 메뉴 이름과 1인분 기준 영양정보를 추정해줘.

반드시 아래 JSON 형식으로만 답변해. 다른 설명이나 마크다운 없이 JSON 객체 하나만 출력해.
{"menuName": "음식 이름", "calories": 숫자, "protein": 숫자, "carbs": 숫자, "fat": 숫자, "sodium": 숫자}

단위: calories(kcal), protein/carbs/fat(g), sodium(mg). 모두 정수로 추정해줘. 음식을 알 수 없으면 menuName을 "알 수 없는 음식"으로 해줘.`,
          },
        ],
      },
    ],
  })

  const parsed = extractJson<Record<string, unknown>>(firstText(message.content))
  if (!parsed) throw new Error('음식을 인식하지 못했어요. 메뉴 이름을 직접 입력해주세요.')

  return {
    menuName: typeof parsed.menuName === 'string' && parsed.menuName ? parsed.menuName : '알 수 없는 음식',
    calories: toNum(parsed.calories),
    protein: toNum(parsed.protein),
    carbs: toNum(parsed.carbs),
    fat: toNum(parsed.fat),
    sodium: toNum(parsed.sodium),
  }
}

export function friendlyAiError(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError) return 'API 키가 올바르지 않아요. 설정에서 다시 확인해주세요.'
  if (e instanceof Anthropic.RateLimitError) return '요청이 많아요. 잠시 후 다시 시도해주세요.'
  if (e instanceof Anthropic.APIError) return `AI 요청 오류: ${e.message}`
  if (e instanceof Error) return e.message
  return 'AI 추정 중 오류가 발생했어요.'
}
