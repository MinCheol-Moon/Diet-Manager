interface Props {
  consumed: number
  targetMin: number
  targetMax: number
}

export default function CalorieGauge({ consumed, targetMin, targetMax }: Props) {
  const target = targetMax
  const pct = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0
  const over = consumed > targetMax
  const remaining = targetMax - consumed
  const ringColor = over ? '#f87171' : pct > 85 ? '#fbbf24' : '#34d399'

  return (
    <div className="flex items-center gap-5">
      <div
        className="relative w-28 h-28 rounded-full flex items-center justify-center shrink-0"
        style={{ background: `conic-gradient(${ringColor} ${pct * 3.6}deg, #1f2937 0deg)` }}
      >
        <div className="absolute inset-2 rounded-full bg-gray-950 flex flex-col items-center justify-center">
          <span className="text-white text-xl font-bold">{Math.round(consumed)}</span>
          <span className="text-gray-500 text-[10px]">kcal</span>
        </div>
      </div>
      <div>
        <p className="text-gray-400 text-sm">
          목표 {targetMin === targetMax ? targetMax : `${targetMin}~${targetMax}`}kcal
        </p>
        {over ? (
          <p className="text-red-400 font-semibold mt-1">오늘 목표를 {Math.round(consumed - targetMax)}kcal 초과했어요</p>
        ) : (
          <p className="text-emerald-400 font-semibold mt-1">오늘 {Math.round(remaining)}kcal 더 드실 수 있어요</p>
        )}
      </div>
    </div>
  )
}
