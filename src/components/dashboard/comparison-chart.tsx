"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import type { ComparisonMetric } from "@/lib/queries/comparisons"
import { formatNumber, formatPercent } from "@/lib/utils/format"

interface ComparisonChartProps {
  data: ComparisonMetric[]
}

export function ComparisonChart({ data }: ComparisonChartProps) {
  const chartData = data.map((d) => ({
    name: d.label,
    "Per\u00edodo A": d.periodA,
    "Per\u00edodo B": d.periodB,
  }))

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "#6B7280" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #E5E7EB",
            fontSize: 13,
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, color: "#6B7280" }}
        />
        <Bar dataKey="Per\u00edodo A" fill="#B2121A" radius={[4, 4, 0, 0]} barSize={24} />
        <Bar dataKey="Per\u00edodo B" fill="#B2121A" fillOpacity={0.3} radius={[4, 4, 0, 0]} barSize={24} />
      </BarChart>
    </ResponsiveContainer>
  )
}
