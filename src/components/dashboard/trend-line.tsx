"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import type { FunnelSummary } from "@/lib/types/database"

interface TrendLineProps {
  data: FunnelSummary[]
}

export function TrendLine({ data }: TrendLineProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[#6B7280]">
        Sem dados de tendência
      </div>
    )
  }

  const formatted = data.map((d) => {
    const [year, month, day] = d.day.split("-").map(Number)
    return {
      ...d,
      dayLabel: new Date(year, month - 1, day).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
    }
  })

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={formatted} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradientLeads" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#B2121A" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#B2121A" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
        <XAxis
          dataKey="dayLabel"
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
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
        <Area
          type="monotone"
          dataKey="total_leads"
          stroke="#B2121A"
          strokeWidth={2}
          fill="url(#gradientLeads)"
          name="Total Leads"
        />
        <Area
          type="monotone"
          dataKey="path3_qualified"
          stroke="#059669"
          strokeWidth={1.5}
          fill="none"
          strokeDasharray="4 4"
          name="Qualificados"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
