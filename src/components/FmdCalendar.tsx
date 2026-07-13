import { FMD_CYCLE_LENGTH, FMD_DAYS_IN_CYCLE } from '../lib/constants'
import { getFmdCycleInfo } from '../lib/fmd'

export default function FmdCalendar({ fmdCycleStartDate, onGoSettings }: { fmdCycleStartDate: string | null; onGoSettings: () => void }) {
  if (!fmdCycleStartDate) {
    return (
      <div className="card p-6 text-center">
        <p className="text-muted text-sm mb-3">FMD 사이클 시작일을 설정하면 캘린더가 표시돼요</p>
        <button onClick={onGoSettings} className="text-navy hover:text-navy2 text-sm font-semibold">
          설정에서 시작일 지정하기 →
        </button>
      </div>
    )
  }

  const cycle = getFmdCycleInfo(fmdCycleStartDate)
  const todayDay = cycle?.dayInCycle ?? 1

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-ink font-bold text-sm">
          FMD 사이클 <span className="text-faint font-medium">({FMD_CYCLE_LENGTH - FMD_DAYS_IN_CYCLE}일 일반식 + {FMD_DAYS_IN_CYCLE}일 FMD)</span>
        </h2>
        <span className="text-gold text-xs font-bold">오늘 {todayDay}일차</span>
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {Array.from({ length: FMD_CYCLE_LENGTH }, (_, i) => i + 1).map(day => {
          const isFmd = day > FMD_CYCLE_LENGTH - FMD_DAYS_IN_CYCLE
          const isToday = day === todayDay
          return (
            <div
              key={day}
              className={`aspect-square rounded-lg flex items-center justify-center text-xs font-semibold ${
                isFmd ? 'bg-goldsoft text-gold' : 'bg-canvas text-muted'
              } ${isToday ? 'ring-2 ring-navy' : ''}`}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}
