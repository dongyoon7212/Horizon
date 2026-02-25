'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'

interface DataPoint {
  date: string
  [key: string]: number | string
}

interface SeriesConfig {
  key: string
  label: string
  trend: 'rising' | 'falling' | 'stable'
}

interface TrendLineChartProps {
  data: DataPoint[]
  series: SeriesConfig[]
  height?: number
}

const COLORS = {
  rising:  '#22d3ee',
  falling: '#818cf8',
  stable:  '#4b5e78',
}

// 커스텀 툴팁
function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="font-body text-xs rounded-lg px-3 py-2.5 space-y-1"
      style={{
        background: 'rgba(16,13,28,0.95)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      }}
    >
      <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: p.color }}
          />
          <span style={{ color: 'var(--text-star)' }}>{p.name}</span>
          <span className="font-data ml-auto tabular-nums" style={{ color: p.color }}>
            {p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function TrendLineChart({ data, series, height = 260 }: TrendLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.04)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
          axisLine={false}
          tickLine={false}
          dy={8}
        />
        <YAxis
          tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
          axisLine={false}
          tickLine={false}
          width={44}
          tickFormatter={(v) =>
            v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
            : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K`
            : String(v)
          }
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} />
        <Legend
          wrapperStyle={{ fontSize: 11, fontFamily: 'Inter', color: 'var(--text-muted)', paddingTop: 12 }}
        />
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={COLORS[s.trend]}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4, fill: COLORS[s.trend], strokeWidth: 0 }}
            animationDuration={900}
            animationEasing="ease-out"
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
