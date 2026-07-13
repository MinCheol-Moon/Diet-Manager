import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface DayCalorie {
  label: string
  calories: number
}

export default function CalorieTrendChart({ data, targetMax }: { data: DayCalorie[]; targetMax: number }) {
  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#99a0ad', fontSize: 11 }} axisLine={{ stroke: '#e9eaf0' }} tickLine={false} />
          <YAxis tick={{ fill: '#99a0ad', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: 'rgba(33,43,71,0.04)' }}
            formatter={value => [`${Math.round(Number(value))}kcal`, '섭취 칼로리']}
            contentStyle={{ background: '#fff', border: '1px solid #e9eaf0', borderRadius: 10, fontSize: 12, boxShadow: '0 2px 10px rgba(20,24,45,.08)' }}
          />
          <ReferenceLine y={targetMax} stroke="#c2932f" strokeDasharray="4 4" />
          <Bar dataKey="calories" fill="#2c3a5e" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
