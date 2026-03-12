"use client"

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"
import { formatNumber, formatPercent } from "@/lib/utils/format"

interface PathPieChartProps {
  data: { name: string; value: number; fill: string }[]
}

export function PathPieChart({ data }: PathPieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  if (total === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] text-sm text-[#6B7280]">
        Sem dados
      </div>
    )
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)] xl:items-center">
      <div className="relative mx-auto h-[220px] w-full max-w-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={62}
              outerRadius={90}
              paddingAngle={3}
              stroke="#FFFFFF"
              strokeWidth={4}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                `${formatNumber(Number(value))} leads`,
                String(name),
              ]}
              contentStyle={{
                borderRadius: 16,
                border: "1px solid #E5E7EB",
                boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                fontSize: 13,
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-white/96 px-4 py-2 text-center ring-1 ring-inset ring-[#E5E7EB]">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#94A3B8]">
              Total
            </p>
            <p className="mt-0.5 text-2xl font-semibold tracking-tight text-[#111827]">
              {formatNumber(total)}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {data.map((item) => {
          const share = total > 0 ? (item.value / total) * 100 : 0

          return (
            <div
              key={item.name}
              className="rounded-2xl border border-[#E5E7EB] bg-white/70 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-sm font-medium text-[#111827]">
                    {item.name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-[#111827]">
                  {formatNumber(item.value)}
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#F3F4F6]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${share}%`,
                    backgroundColor: item.fill,
                  }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-[#6B7280]">
                <span>participação</span>
                <span>{formatPercent(share)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
