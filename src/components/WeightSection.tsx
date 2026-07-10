import { useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { upsertWeight, useWeightLogs } from '../lib/store'
import { todayKey } from '../lib/date'

export default function WeightSection() {
  const logs = useWeightLogs()
  const [weight, setWeight] = useState('')
  const [error, setError] = useState('')

  const chartData = logs.map(l => ({
    label: l.date.slice(5).replace('-', '/'),
    weight: Number(l.weightKg),
  }))

  const latest = logs.length > 0 ? logs[logs.length - 1].weightKg : null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = Number(weight)
    if (!Number.isFinite(n) || n <= 0) {
      setError('올바른 체중을 입력해주세요.')
      return
    }
    upsertWeight(todayKey(), n)
    setWeight('')
    setError('')
  }

  return (
    <div className="bg-gray-900 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-bold text-sm">체중 기록</h2>
        {latest !== null && <span className="text-gray-400 text-xs">최근 {latest}kg</span>}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="number"
          step="0.1"
          inputMode="decimal"
          value={weight}
          onChange={e => setWeight(e.target.value)}
          placeholder="오늘 체중 (kg)"
          className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 rounded-xl transition-colors shrink-0"
        >
          기록
        </button>
      </form>
      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      {chartData.length < 2 ? (
        <p className="text-gray-500 text-sm text-center py-6">체중을 2회 이상 기록하면 변화 그래프가 보여요</p>
      ) : (
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={{ stroke: '#374151' }} tickLine={false} />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={value => [`${value}kg`, '체중']}
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
              />
              <Line type="monotone" dataKey="weight" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
