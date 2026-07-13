import type { FmdCycleInfo } from '../lib/fmd'

// 히어로(네이비) 카드 안에서 쓰는 작은 배지
export default function FmdBadge({ cycle }: { cycle: FmdCycleInfo | null }) {
  if (!cycle) return null

  if (cycle.isFmdDay) {
    return (
      <span className="inline-flex items-center rounded-full bg-gold/20 text-[#f2cf6b] text-xs font-semibold px-3 py-1">
        🔥 FMD {cycle.fmdDayNumber}일차
      </span>
    )
  }

  return (
    <span className="inline-flex items-center rounded-full bg-white/10 text-white/70 text-xs font-medium px-3 py-1">
      사이클 {cycle.dayInCycle}일차
    </span>
  )
}
