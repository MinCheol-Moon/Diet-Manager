interface Props {
  sodium: number
  target: number
}

export default function SodiumBar({ sodium, target }: Props) {
  const pct = target > 0 ? Math.min(100, Math.round((sodium / target) * 100)) : 0
  const over = sodium > target

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-ink text-sm font-semibold">나트륨</span>
        <span className={`text-sm font-medium ${over ? 'text-danger' : 'text-muted'}`}>
          {Math.round(sodium)} / {target}mg
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-canvas overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${over ? 'bg-danger' : 'bg-sodium'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {over && <p className="text-danger text-xs mt-2">⚠️ 나트륨 목표를 초과했어요</p>}
    </div>
  )
}
