"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { ComparisonMetric } from "@/lib/queries/comparisons"
import { formatNumber, formatPercent } from "@/lib/utils/format"

interface ComparisonChartProps {
  data: ComparisonMetric[]
  labelA?: string
  labelB?: string
}

export function ComparisonChart({
  data,
  labelA = "Periodo A",
  labelB = "Periodo B",
}: ComparisonChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] text-sm text-[#6B7280]">
        Sem dados comparativos para o periodo selecionado.
      </div>
    )
  }

  const chartData = data.map((metric) => ({
    name: metric.label,
    periodA: metric.periodA,
    periodB: metric.periodB,
    format: metric.format,
  }))
  const chartHeight = Math.max(300, chartData.length * 54)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 text-xs text-[#6B7280]">
        <LegendChip color="#B2121A" label={labelA} />
        <LegendChip color="#B2121A" label={labelB} subtle />
      </div>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 12, left: 12, bottom: 0 }}
          barCategoryGap={14}
        >
          <CartesianGrid
            horizontal={false}
            stroke="#E5E7EB"
            strokeDasharray="2 6"
          />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={196}
            tick={{ fontSize: 12, fill: "#475569" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null

              const periodAValue = Number(
                payload.find((item) => item.dataKey === "periodA")?.value ?? 0
              )
              const periodBValue = Number(
                payload.find((item) => item.dataKey === "periodB")?.value ?? 0
              )
              const metric = data.find((item) => item.label === label)
              const formatter =
                metric?.format === "percent"
                  ? formatPercent
                  : (value: number) => formatNumber(value)

              return (
                <div className="min-w-44 rounded-2xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#94A3B8]">
                    {label}
                  </p>
                  <div className="mt-2 space-y-1.5">
                    <TooltipRow
                      color="#B2121A"
                      label={labelA}
                      value={formatter(periodAValue)}
                    />
                    <TooltipRow
                      color="rgba(178, 18, 26, 0.28)"
                      label={labelB}
                      value={formatter(periodBValue)}
                    />
                  </div>
                </div>
              )
            }}
          />
          <Bar
            dataKey="periodA"
            name={labelA}
            fill="#B2121A"
            radius={[0, 999, 999, 0]}
            barSize={10}
          />
          <Bar
            dataKey="periodB"
            name={labelB}
            fill="rgba(178, 18, 26, 0.28)"
            radius={[0, 999, 999, 0]}
            barSize={10}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function LegendChip({
  color,
  label,
  subtle = false,
}: {
  color: string
  label: string
  subtle?: boolean
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] px-3 py-1.5 ring-1 ring-inset ring-[#E5E7EB]">
      <span
        className="h-2.5 w-5 rounded-full"
        style={{
          backgroundColor: subtle ? "transparent" : color,
          border: subtle ? `2px solid ${color}` : undefined,
          opacity: subtle ? 0.45 : 1,
        }}
      />
      <span className="font-medium text-[#111827]">{label}</span>
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
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-[#475569]">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span>{label}</span>
      </div>
      <span className="font-semibold text-[#111827]">{value}</span>
    </div>
  )
}
