interface Props {
  sodium: number
  target: number
}

export default function SodiumBar({ sodium, target }: Props) {
  const pct = target > 0 ? Math.min(100, Math.round((sodium / target) * 100)) : 0
  const over = sodium > target

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-gray-400 text-sm">나트륨</span>
        <span className={`text-sm font-medium ${over ? 'text-red-400' : 'text-gray-300'}`}>
          {Math.round(sodium)} / {target}mg
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${over ? 'bg-red-500' : 'bg-sky-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {over && <p className="text-red-400 text-xs mt-1.5">⚠️ 나트륨 목표를 초과했어요</p>}
    </div>
  )
}
