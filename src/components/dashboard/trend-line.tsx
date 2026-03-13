"use client"

import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  Line,
} from "recharts"
import type { FunnelSummary } from "@/lib/types/database"
import { formatNumber } from "@/lib/utils/format"

interface TrendLineProps {
  data: FunnelSummary[]
}

export function TrendLine({ data }: TrendLineProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] text-sm text-[#6B7280]">
        Sem dados de tendência
      </div>
    )
  }

  const formatted = data.map((entry) => {
    const [year, month, day] = entry.day.split("-").map(Number)
    return {
      ...entry,
      dayLabel: new Date(year, month - 1, day).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
    }
  })

  const peakLeads = Math.max(...formatted.map((entry) => entry.total_leads))
  const peakQualified = Math.max(...formatted.map((entry) => entry.path3_qualified))

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
        <LegendChip label="Total Leads" color="#B2121A" note={`pico ${formatNumber(peakLeads)}`} />
        <LegendChip
          label="Qualificados"
          color="#059669"
          note={`pico ${formatNumber(peakQualified)}`}
          dashed
        />
      </div>

      <div className="h-[268px] min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={268}>
          <ComposedChart data={formatted} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="trend-total" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B2121A" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#B2121A" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="2 6" />

            <XAxis
              dataKey="dayLabel"
              tick={{ fontSize: 11, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              minTickGap={24}
            />
            <YAxis
              width={26}
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              cursor={{ stroke: "#CBD5E1", strokeDasharray: "4 4" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null

                const totalLeads = Number(
                  payload.find((item) => item.dataKey === "total_leads")?.value ?? 0
                )
                const qualified = Number(
                  payload.find((item) => item.dataKey === "path3_qualified")?.value ?? 0
                )

                return (
                  <div className="min-w-40 rounded-2xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#94A3B8]">
                      {label}
                    </p>
                    <div className="mt-2 space-y-1.5">
                      <TooltipRow color="#B2121A" label="Total Leads" value={totalLeads} />
                      <TooltipRow color="#059669" label="Qualificados" value={qualified} />
                    </div>
                  </div>
                )
              }}
            />

            <Area
              type="monotone"
              dataKey="total_leads"
              stroke="#B2121A"
              strokeWidth={2.25}
              fill="url(#trend-total)"
              dot={false}
              activeDot={{ r: 4, fill: "#B2121A", stroke: "#fff", strokeWidth: 2 }}
              name="Total Leads"
            />
            <Line
              type="monotone"
              dataKey="path3_qualified"
              stroke="#059669"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 2.5, fill: "#059669", strokeWidth: 0 }}
              activeDot={{ r: 4, fill: "#059669", stroke: "#fff", strokeWidth: 2 }}
              name="Qualificados"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function LegendChip({
  label,
  color,
  note,
  dashed = false,
}: {
  label: string
  color: string
  note: string
  dashed?: boolean
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] px-3 py-1.5 ring-1 ring-inset ring-[#E5E7EB]">
      <span
        className="h-2.5 w-5 rounded-full"
        style={{
          backgroundColor: dashed ? "transparent" : color,
          border: dashed ? `2px dashed ${color}` : undefined,
        }}
      />
      <span className="font-medium text-[#111827]">{label}</span>
      <span className="text-[#6B7280]">{note}</span>
    </div>
  )
}

function TooltipRow({
  color,
  label,
  value,
}: {
  color: string
  label: string
  value: number
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-[#475569]">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span>{label}</span>
      </div>
      <span className="font-semibold text-[#111827]">{formatNumber(value)}</span>
    </div>
  )
}
