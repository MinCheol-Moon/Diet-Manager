import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface Props {
  protein: number
  carbs: number
  fat: number
}

const COLORS = { protein: '#38bdf8', carbs: '#fbbf24', fat: '#f472b6' }

export default function MacroDonut({ protein, carbs, fat }: Props) {
  const total = protein + carbs + fat
  const data = [
    { name: '단백질', value: protein, color: COLORS.protein },
    { name: '탄수화물', value: carbs, color: COLORS.carbs },
    { name: '지방', value: fat, color: COLORS.fat },
  ]

  if (total === 0) {
    return <p className="text-gray-500 text-sm text-center py-6">아직 기록된 영양정보가 없어요</p>
  }

  return (
    <div className="flex items-center gap-4">
      <div className="w-28 h-28 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={32} outerRadius={54} paddingAngle={2} stroke="none">
              {data.map(d => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={value => `${Math.round(Number(value))}g`}
              contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-1.5 text-sm">
        {data.map(d => (
          <div key={d.name} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-gray-400">{d.name}</span>
            <span className="text-white font-medium">{Math.round(d.value)}g</span>
            <span className="text-gray-500 text-xs">({total > 0 ? Math.round((d.value / total) * 100) : 0}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}
