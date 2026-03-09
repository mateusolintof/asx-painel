"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import type { FunnelStage } from "@/lib/queries/funnel"

interface FunnelChartProps {
  data: FunnelStage[]
}

export function FunnelChart({ data }: FunnelChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[#6B7280]">
        Sem dados para o per\u00edodo selecionado
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="stage"
          width={130}
          tick={{ fontSize: 13, fill: "#6B7280" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value) => [String(value), "Leads"]}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #E5E7EB",
            fontSize: 13,
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={28}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
