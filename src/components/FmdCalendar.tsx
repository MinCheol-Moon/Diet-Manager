import { FMD_CYCLE_LENGTH, FMD_DAYS_IN_CYCLE } from '../lib/constants'
import { getFmdCycleInfo } from '../lib/fmd'

export default function FmdCalendar({ fmdCycleStartDate, onGoSettings }: { fmdCycleStartDate: string | null; onGoSettings: () => void }) {
  if (!fmdCycleStartDate) {
    return (
      <div className="bg-gray-900 rounded-xl p-5 text-center">
        <p className="text-gray-400 text-sm mb-3">FMD 사이클 시작일을 설정하면 캘린더가 표시돼요</p>
        <button onClick={onGoSettings} className="text-emerald-400 hover:text-emerald-300 text-sm">
          설정에서 시작일 지정하기 →
        </button>
      </div>
    )
  }

  const cycle = getFmdCycleInfo(fmdCycleStartDate)
  const todayDay = cycle?.dayInCycle ?? 1

  return (
    <div className="bg-gray-900 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-bold text-sm">
          FMD 사이클 ({FMD_CYCLE_LENGTH - FMD_DAYS_IN_CYCLE}일 일반식 + {FMD_DAYS_IN_CYCLE}일 FMD)
        </h2>
        <span className="text-emerald-400 text-xs font-medium">오늘 {todayDay}일차</span>
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {Array.from({ length: FMD_CYCLE_LENGTH }, (_, i) => i + 1).map(day => {
          const isFmd = day > FMD_CYCLE_LENGTH - FMD_DAYS_IN_CYCLE
          const isToday = day === todayDay
          return (
            <div
              key={day}
              className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${
                isFmd ? 'bg-amber-500/20 text-amber-300' : 'bg-gray-800 text-gray-400'
              } ${isToday ? 'ring-2 ring-emerald-400' : ''}`}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}
