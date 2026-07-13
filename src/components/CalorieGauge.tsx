interface Props {
  consumed: number
  targetMin: number
  targetMax: number
}

// 네이비 히어로 카드 위에 올라가는 칼로리 게이지
export default function CalorieGauge({ consumed, targetMin, targetMax }: Props) {
  const target = targetMax
  const pct = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0
  const over = consumed > targetMax
  const remaining = targetMax - consumed
  const ringColor = over ? '#f8a29a' : pct > 88 ? '#f2cf6b' : '#5fd6a0'

  return (
    <div className="flex items-center gap-5">
      <div
        className="relative w-28 h-28 rounded-full flex items-center justify-center shrink-0"
        style={{ background: `conic-gradient(${ringColor} ${pct * 3.6}deg, rgba(255,255,255,0.14) 0deg)` }}
      >
        <div className="absolute inset-[9px] rounded-full flex flex-col items-center justify-center" style={{ background: '#222c49' }}>
          <span className="text-white text-2xl font-bold leading-none">{Math.round(consumed)}</span>
          <span className="text-white/50 text-[10px] mt-1">kcal</span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-white/55 text-xs">일일 목표</p>
        <p className="text-white font-semibold text-lg leading-tight">
          {targetMin === targetMax ? targetMax : `${targetMin}~${targetMax}`}
          <span className="text-white/50 text-sm font-normal"> kcal</span>
        </p>
        {over ? (
          <p className="mt-2 text-[#f8a29a] text-sm font-medium">{Math.round(consumed - targetMax)}kcal 초과했어요</p>
        ) : (
          <p className="mt-2 text-[#7fe3b4] text-sm font-medium">{Math.round(remaining)}kcal 더 드실 수 있어요</p>
        )}
      </div>
    </div>
  )
}
