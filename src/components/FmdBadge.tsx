import type { FmdCycleInfo } from '../lib/fmd'

export default function FmdBadge({ cycle }: { cycle: FmdCycleInfo | null }) {
  if (!cycle) return null

  if (cycle.isFmdDay) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5 text-amber-300 text-sm font-medium">
        🔥 FMD {cycle.fmdDayNumber}일차 · 사이클 {cycle.dayInCycle}일차
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-gray-400 text-sm">
      사이클 {cycle.dayInCycle}일차 · 일반식 진행 중
    </div>
  )
}
