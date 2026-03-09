"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface PathPieChartProps {
  data: { name: string; value: number; fill: string }[]
}

export function PathPieChart({ data }: PathPieChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0)

  if (total === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[#6B7280]">
        Sem dados
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [
              `${value} (${Math.round((Number(value) / total) * 100)}%)`,
              String(name),
            ]}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #E5E7EB",
              fontSize: 13,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 flex gap-4">
        {data.map((d) => (
          <div
            key={d.name}
            className="flex items-center gap-1.5 text-xs text-[#6B7280]"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: d.fill }}
            />
            {d.name}
          </div>
        ))}
      </div>
    </div>
  )
}
