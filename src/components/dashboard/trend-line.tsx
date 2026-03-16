"use client"

import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
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
  const totalLeads = formatted.reduce((sum, entry) => sum + entry.total_leads, 0)
  const totalQualified = formatted.reduce((sum, entry) => sum + entry.path3_qualified, 0)
  const qualifiedShare = totalLeads > 0 ? (totalQualified / totalLeads) * 100 : 0
  const peakLeadEntry = formatted.reduce(
    (best, entry) => (entry.total_leads > best.total_leads ? entry : best),
    formatted[0]
  )
  const peakQualifiedEntry = formatted.reduce(
    (best, entry) =>
      entry.path3_qualified > best.path3_qualified ? entry : best,
    formatted[0]
  )

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryChip
          label="Recebidos no periodo"
          value={formatNumber(totalLeads)}
          helper="soma das entradas neste recorte"
        />
        <SummaryChip
          label="Operacao ASX"
          value={formatNumber(totalQualified)}
          helper="leads que ficaram com o time ASX"
        />
        <SummaryChip
          label="Participacao na operacao"
          value={`${qualifiedShare.toFixed(1)}%`}
          helper="fatia do volume que avancou no time"
        />
        <SummaryChip
          label="Maior dia"
          value={peakLeadEntry.dayLabel}
          helper={`${formatNumber(peakLeads)} entradas no pico`}
        />
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-[#FCFCFB] px-3 py-3 md:px-4 md:py-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#6B7280]">
          <div className="flex flex-wrap items-center gap-2">
            <LegendChip label="Entradas" color="#B2121A" note={`pico ${formatNumber(peakLeads)}`} />
            <LegendChip
              label="Operacao ASX"
              color="#059669"
              note={`pico ${formatNumber(peakQualified)}`}
              line
            />
          </div>
          <p className="rounded-full bg-white px-3 py-1.5 ring-1 ring-inset ring-[#E5E7EB]">
            melhor avanco interno em {peakQualifiedEntry.dayLabel}
          </p>
        </div>

        <div className="mt-4 min-w-0">
          <ResponsiveContainer width="100%" height={286}>
            <ComposedChart data={formatted} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
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
                width={28}
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
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
                        <TooltipRow color="#B2121A" label="Entradas" value={totalLeads} />
                        <TooltipRow color="#059669" label="Operacao ASX" value={qualified} />
                      </div>
                    </div>
                  )
                }}
              />

              <Bar
                dataKey="total_leads"
                fill="#F4D5D7"
                stroke="#E9B7BA"
                radius={[8, 8, 0, 0]}
                barSize={18}
                name="Entradas"
              />
              <Line
                type="monotone"
                dataKey="path3_qualified"
                stroke="#059669"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: "#059669", stroke: "#fff", strokeWidth: 2 }}
                name="Operacao ASX"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function LegendChip({
  label,
  color,
  note,
  line = false,
}: {
  label: string
  color: string
  note: string
  line?: boolean
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] px-3 py-1.5 ring-1 ring-inset ring-[#E5E7EB]">
      <span
        className="h-2.5 w-5 rounded-full"
        style={{
          backgroundColor: line ? "transparent" : color,
          border: line ? `2px solid ${color}` : undefined,
        }}
      />
      <span className="font-medium text-[#111827]">{label}</span>
      <span className="text-[#6B7280]">{note}</span>
    </div>
  )
}

function SummaryChip({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#FCFCFB] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A94A6]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-[#111827]">
        {value}
      </p>
      <p className="mt-1 text-xs text-[#6B7280]">{helper}</p>
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
